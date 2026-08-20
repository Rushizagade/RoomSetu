import React from 'react';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  X,
  Bell,
  CheckCheck,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  CalendarCheck,
  Building2,
  Clock,
} from 'lucide-react';

export const NotificationDrawer: React.FC = () => {
  const { notifications, unreadCount, isDrawerOpen, closeDrawer, markAsRead } = useNotifications();

  if (!isDrawerOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROPERTY_APPROVED':
        return <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'PROPERTY_REJECTED':
        return <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />;
      case 'NEW_INQUIRY':
      case 'INQUIRY_RESPONSE':
        return <MessageSquare className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'VISIT_REQUESTED':
      case 'VISIT_ACCEPTED':
      case 'VISIT_RESCHEDULED':
        return <CalendarCheck className="w-5 h-5 text-indigo-600 shrink-0" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-slate-800" />
            <h2 className="font-bold text-slate-900 text-base">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                id="mark-all-read-btn"
                onClick={() => markAsRead()}
                className="text-xs text-slate-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            <button
              id="close-notification-drawer-btn"
              onClick={closeDrawer}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">
                You will receive updates on listings, inquiries, and scheduled visits here.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.isRead && markAsRead(n.id)}
                className={`pt-3 first:pt-0 cursor-pointer transition-colors p-3 rounded-xl ${
                  !n.isRead ? 'bg-emerald-50/60 border border-emerald-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getIcon(n.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
