import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id?: string) => Promise<void>;
  toastMessage: { title: string; message: string; type?: 'info' | 'success' | 'warning' } | null;
  showToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  hideToast: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning';
  } | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // ignore
    }
  }, [user]);

  useEffect(() => {
    refreshNotifications();
    const interval = setInterval(refreshNotifications, 8000);
    return () => clearInterval(interval);
  }, [refreshNotifications]);

  const markAsRead = async (id?: string) => {
    try {
      await api.markNotificationsRead(id);
      refreshNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const showToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    setToastMessage({ title, message, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const hideToast = () => setToastMessage(null);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        refreshNotifications,
        markAsRead,
        toastMessage,
        showToast,
        hideToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
