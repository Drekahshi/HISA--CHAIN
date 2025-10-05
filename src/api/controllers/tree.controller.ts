import { Request, Response } from 'express';
import Tree from '../../models/Tree.model';
import { HCSService } from '../../services/hedera/hcs.service';
import { HashService } from '../../services/blockchain/hash.service';

export class TreeController {
  private hcsService = new HCSService();

  async registerTree(req: Request, res: Response) {
    try {
      const { species, location, nurseryId, projectId } = req.body;
      const userId = req.user.id; // from auth middleware

      // Generate unique tree ID
      const treeId = `TREE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create tree data object
      const treeData = {
        treeId,
        species,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude],
          altitude: location.altitude
        },
        plantedBy: userId,
        nurseryId,
        projectId,
        plantingDate: new Date()
      };

      // Hash the data
      const dataHash = HashService.hashTreeData(treeData);

      // Create tree in MongoDB
      const tree = new Tree({
        ...treeData,
        verification: {
          isVerified: false,
          verifiedBy: [],
          dataHash
        }
      });

      await tree.save();

      // Submit to Hedera HCS
      const topicId = process.env.CONSERVATION_TOPIC_ID!;
      const hederaTxId = await this.hcsService.submitTreeVerification(topicId, {
        treeId,
        hash: dataHash,
        validators: [],
        location: treeData.location
      });

      // Update tree with Hedera transaction ID
      tree.verification.hederaTxId = hederaTxId;
      tree.verification.hederaTopicId = topicId;
      await tree.save();

      res.status(201).json({
        success: true,
        message: 'Tree registered successfully',
        data: {
          tree,
          hederaTxId
        }
      });

    } catch (error: any) {
      console.error('Error registering tree:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTrees(req: Request, res: Response) {
    try {
      const { status, projectId, page = 1, limit = 20 } = req.query;

      const query: any = {};
      if (status) query.status = status;
      if (projectId) query.projectId = projectId;

      const trees = await Tree.find(query)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate('plantedBy', 'profile walletAddress')
        .populate('nurseryId', 'name location')
        .sort({ createdAt: -1 });

      const total = await Tree.countDocuments(query);

      res.json({
        success: true,
        data: {
          trees,
          pagination: {
            total,
            page: Number(page),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTreeById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const tree = await Tree.findById(id)
        .populate('plantedBy', 'profile walletAddress')
        .populate('nurseryId', 'name location')
        .populate('projectId', 'name')
        .populate('verification.verifiedBy', 'profile walletAddress');

      if (!tree) {
        return res.status(404).json({
          success: false,
          message: 'Tree not found'
        });
      }

      res.json({
        success: true,
        data: tree
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateMeasurement(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { height, diameter, photos, notes } = req.body;
      const validatorId = req.user.id;

      const tree = await Tree.findById(id);
      if (!tree) {
        return res.status(404).json({
          success: false,
          message: 'Tree not found'
        });
      }

      tree.measurements.push({
        date: new Date(),
        height,
        diameter,
        photos,
        validatorId,
        notes
      } as any);

      await tree.save();

      res.json({
        success: true,
        message: 'Measurement added successfully',
        data: tree
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}