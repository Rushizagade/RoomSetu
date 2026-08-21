import { Router } from 'express';
import { savedController } from '../controllers/saved.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

const router = Router();

// All saved-property routes require USER role
router.use(authenticateToken, requireRole(['USER']));

// GET /api/saved-properties
router.get('/', (req, res) => savedController.getSavedProperties(req, res));

// POST /api/saved-properties/toggle
router.post('/toggle', (req, res) => savedController.toggleSave(req, res));

export default router;
