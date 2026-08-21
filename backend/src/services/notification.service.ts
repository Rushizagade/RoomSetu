import { notificationRepository } from '../repositories/notification.repository.ts';
import { NotificationItem } from '../types/index.ts';

export const notificationService = {
  getForUser(userId: string): { notifications: NotificationItem[]; unreadCount: number } {
    const notifications = notificationRepository.findByRecipientId(userId);
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { notifications, unreadCount };
  },

  markRead(userId: string, notificationId?: string): void {
    if (notificationId) {
      const notif = notificationRepository.findById(notificationId);
      if (notif && notif.recipientId === userId) {
        notificationRepository.markRead(notificationId);
      }
    } else {
      notificationRepository.markAllReadForRecipient(userId);
    }
  },
};
