import { Router } from 'express';
import { visitController } from '../controllers/visit.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

const router = Router();

// GET /api/visits  (USER, ROOM_OWNER, ADMIN)
router.get('/', authenticateToken, (req, res) => visitController.getVisits(req, res));

// POST /api/visits  (USER only)
router.post(
  '/',
  authenticateToken,
  requireRole(['USER']),
  (req, res) => visitController.requestVisit(req, res)
);

// PATCH /api/visits/:id/status  (ROOM_OWNER only)
router.patch(
  '/:id/status',
  authenticateToken,
  requireRole(['ROOM_OWNER']),
  (req, res) => visitController.updateVisitStatus(req, res)
);

export default router;
