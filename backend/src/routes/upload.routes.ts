import { Router } from 'express';
import { uploadController } from '../controllers/upload.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

const router = Router();

// POST /api/uploads  (ROOM_OWNER or ADMIN only)
router.post(
  '/',
  authenticateToken,
  requireRole(['ROOM_OWNER', 'ADMIN']),
  (req, res) => uploadController.uploadImage(req, res)
);

export default router;
