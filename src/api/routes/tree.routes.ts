import { Router } from 'express';
import { TreeController } from '../controllers/tree.controller';
import { authenticateToken, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();
const treeController = new TreeController();

router.post(
  '/register',
  authenticateToken,
  authorizeRoles('planter', 'validator', 'admin'),
  (req, res) => treeController.registerTree(req, res)
);

router.get(
  '/',
  authenticateToken,
  (req, res) => treeController.getTrees(req, res)
);

router.get(
  '/:id',
  authenticateToken,
  (req, res) => treeController.getTreeById(req, res)
);

router.put(
  '/:id/measurement',
  authenticateToken,
  authorizeRoles('validator', 'admin'),
  (req, res) => treeController.updateMeasurement(req, res)
);

export default router;