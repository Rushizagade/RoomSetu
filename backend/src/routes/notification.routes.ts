import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';

const router = Router();

// All notification routes require auth
router.use(authenticateToken);

// GET /api/notifications
router.get('/', (req, res) => notificationController.getNotifications(req, res));

// PATCH /api/notifications/mark-read
router.patch('/mark-read', (req, res) => notificationController.markRead(req, res));

export default router;
