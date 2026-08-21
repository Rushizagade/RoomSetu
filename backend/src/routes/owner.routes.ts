import { Router } from 'express';
import { ownerController } from '../controllers/owner.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

const router = Router();

// All owner routes require ROOM_OWNER role
router.use(authenticateToken, requireRole(['ROOM_OWNER']));

// GET /api/owner/dashboard
router.get('/dashboard', (req, res) => ownerController.getDashboard(req, res));

// GET /api/owner/properties
router.get('/properties', (req, res) => ownerController.getProperties(req, res));

// POST /api/owner/properties
router.post('/properties', (req, res) => ownerController.createProperty(req, res));

// PUT /api/owner/properties/:id
router.put('/properties/:id', (req, res) => ownerController.updateProperty(req, res));

// POST /api/owner/properties/:id/submit
router.post('/properties/:id/submit', (req, res) => ownerController.submitForReview(req, res));

// PATCH /api/owner/properties/:id/status
router.patch('/properties/:id/status', (req, res) => ownerController.patchStatus(req, res));

export default router;
