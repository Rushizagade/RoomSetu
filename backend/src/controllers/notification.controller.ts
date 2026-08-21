import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service.ts';
import { sendSuccess } from '../utils/response.ts';

export const notificationController = {
  getNotifications(req: Request, res: Response): void {
    const result = notificationService.getForUser(req.user!.id);
    sendSuccess(res, result);
  },

  markRead(req: Request, res: Response): void {
    const { notificationId } = req.body;
    notificationService.markRead(req.user!.id, notificationId);
    sendSuccess(res, { message: 'Notifications marked as read' });
  },
};
