import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  Building2,
  Bell,
  UserCheck,
  LogOut,
  LogIn,
  Search,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';

interface HeaderProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const { user, currentView, navigateTo, switchRole, logout, openAuthModal } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo */}
        <div
          id="header-brand-logo"
          onClick={() => {
            if (user) navigateTo('MAIN_APP');
            else navigateTo('BROWSE_ROOMS');
          }}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm tracking-tight shadow-2xs transition-transform group-hover:scale-102">
            RS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">ROOMSETU</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                0% Brokerage
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Direct room rental network · Wakad & Pune
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {!user ? (
            /* Unauthenticated state: Explore Map + Sign In + Create Account + Admin Portal */
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                id="header-browse-btn"
                onClick={() => navigateTo('BROWSE_ROOMS')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'BROWSE_ROOMS'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Explore</span>
                <span className="xs:hidden">Map</span>
              </button>

              <button
                id="header-login-btn"
                onClick={() => navigateTo('USER_LOGIN', 'LOGIN')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-3.5 py-2 rounded-xl text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>

              <button
                id="header-register-btn"
                onClick={() => navigateTo('USER_REGISTER', 'REGISTER')}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>

              <button
                id="header-admin-portal-btn"
                onClick={() => navigateTo('ADMIN_PORTAL', 'LOGIN')}
                className="flex items-center gap-1 text-xs font-semibold px-2.5 py-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Admin Moderation Portal"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Admin</span>
              </button>
            </div>
          ) : (
            /* Authenticated state: 3 Quick Role Portals + Notifications + User Profile + Logout */
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Switchers */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  id="header-tenant-view-btn"
                  onClick={() => switchRole('USER')}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    user.role === 'USER'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Tenant Search & Discovery"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tenant</span>
                </button>

                <button
                  id="header-owner-view-btn"
                  onClick={() => switchRole('ROOM_OWNER')}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    user.role === 'ROOM_OWNER'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Landlord & Property Management"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Owner</span>
                </button>

                <button
                  id="header-admin-view-btn"
                  onClick={() => switchRole('ADMIN')}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    user.role === 'ADMIN'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                  title="Admin Moderation & Approvals"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Hub</span>
                </button>
              </div>

              {/* Notifications */}
              <button
                id="notifications-bell-btn"
                onClick={openDrawer}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Account Info */}
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs overflow-hidden border border-slate-300 shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[120px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user.role === 'USER'
                      ? 'Tenant'
                      : user.role === 'ROOM_OWNER'
                      ? 'Room Owner'
                      : 'Platform Admin'}
                  </div>
                </div>

                <button
                  id="header-logout-btn"
                  onClick={logout}
                  title="Sign out"
                  className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
