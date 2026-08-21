import { db } from '../database/engine.ts';
import { NotificationItem } from '../types/index.ts';

export const notificationRepository = {
  findById(id: string): NotificationItem | undefined {
    return db.notifications.get(id);
  },

  findByRecipientId(recipientId: string): NotificationItem[] {
    return Array.from(db.notifications.values())
      .filter((n) => n.recipientId === recipientId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  countUnread(recipientId: string): number {
    return Array.from(db.notifications.values()).filter(
      (n) => n.recipientId === recipientId && !n.isRead
    ).length;
  },

  markRead(id: string): void {
    const notif = db.notifications.get(id);
    if (notif) notif.isRead = true;
  },

  markAllReadForRecipient(recipientId: string): void {
    Array.from(db.notifications.values())
      .filter((n) => n.recipientId === recipientId)
      .forEach((n) => (n.isRead = true));
  },

  create(recipientId: string, recipientRole: any, type: any, title: string, message: string, referenceId?: string, referenceType?: any): NotificationItem {
    return db.createNotification(recipientId, recipientRole, type, title, message, referenceId, referenceType);
  },
};
