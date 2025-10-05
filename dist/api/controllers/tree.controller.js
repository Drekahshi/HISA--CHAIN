"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeController = void 0;
const Tree_model_1 = __importDefault(require("../../models/Tree.model"));
const hcs_service_1 = require("../../services/hedera/hcs.service");
const hash_service_1 = require("../../services/blockchain/hash.service");
class TreeController {
    constructor() {
        this.hcsService = new hcs_service_1.HCSService();
    }
    async registerTree(req, res) {
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
            const dataHash = hash_service_1.HashService.hashTreeData(treeData);
            // Create tree in MongoDB
            const tree = new Tree_model_1.default({
                ...treeData,
                verification: {
                    isVerified: false,
                    verifiedBy: [],
                    dataHash
                }
            });
            await tree.save();
            // Submit to Hedera HCS
            const topicId = process.env.CONSERVATION_TOPIC_ID;
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
        }
        catch (error) {
            console.error('Error registering tree:', error);
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getTrees(req, res) {
        try {
            const { status, projectId, page = 1, limit = 20 } = req.query;
            const query = {};
            if (status)
                query.status = status;
            if (projectId)
                query.projectId = projectId;
            const trees = await Tree_model_1.default.find(query)
                .limit(Number(limit))
                .skip((Number(page) - 1) * Number(limit))
                .populate('plantedBy', 'profile walletAddress')
                .populate('nurseryId', 'name location')
                .sort({ createdAt: -1 });
            const total = await Tree_model_1.default.countDocuments(query);
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getTreeById(req, res) {
        try {
            const { id } = req.params;
            const tree = await Tree_model_1.default.findById(id)
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
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async updateMeasurement(req, res) {
        try {
            const { id } = req.params;
            const { height, diameter, photos, notes } = req.body;
            const validatorId = req.user.id;
            const tree = await Tree_model_1.default.findById(id);
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
            });
            await tree.save();
            res.json({
                success: true,
                message: 'Measurement added successfully',
                data: tree
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
}
exports.TreeController = TreeController;
