import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

const router = Router();

// GET /api/inquiries  (USER, ROOM_OWNER, ADMIN — each gets their own scope)
router.get('/', authenticateToken, (req, res) => inquiryController.getInquiries(req, res));

// POST /api/inquiries  (USER only)
router.post(
  '/',
  authenticateToken,
  requireRole(['USER']),
  (req, res) => inquiryController.sendInquiry(req, res)
);

// POST /api/inquiries/:id/respond  (ROOM_OWNER only)
router.post(
  '/:id/respond',
  authenticateToken,
  requireRole(['ROOM_OWNER']),
  (req, res) => inquiryController.respondToInquiry(req, res)
);

export default router;
