import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  Home,
  Building2,
  ShieldCheck,
  Bell,
  UserCheck,
  LogOut,
  Sparkles,
  MapPin,
  CheckCircle2,
  LogIn,
  Search,
  KeyRound,
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface HeaderProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { user, role, currentView, navigateTo, switchRole, logout, openAuthModal } = useAuth();
  const { unreadCount, openDrawer } = useNotifications();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
      {/* Top Banner / Role Switcher Simulator Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RoomSetu Portals:</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">
            {user ? `Logged in as ${user.name}` : 'Not Logged In'}
          </span>
        </div>

        {/* Portals & Demo Switchers */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700">
          <button
            id="switch-role-user-btn"
            onClick={() => {
              if (user && user.role === 'USER') {
                navigateTo('MAIN_APP');
              } else {
                navigateTo('USER_LOGIN');
              }
            }}
            className={`px-3 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              (user && user.role === 'USER') || currentView === 'USER_LOGIN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tenant Portal</span>
          </button>

          <button
            id="switch-role-owner-btn"
            onClick={() => {
              if (user && user.role === 'ROOM_OWNER') {
                navigateTo('MAIN_APP');
              } else {
                navigateTo('OWNER_LOGIN');
              }
            }}
            className={`px-3 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              (user && user.role === 'ROOM_OWNER') || currentView === 'OWNER_LOGIN'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Room Owner Portal</span>
          </button>

          <button
            id="switch-role-admin-btn"
            onClick={() => {
              if (user && user.role === 'ADMIN') {
                navigateTo('MAIN_APP');
              } else {
                navigateTo('ADMIN_LOGIN');
              }
            }}
            className={`px-3 py-1 rounded-md font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              (user && user.role === 'ADMIN') || currentView === 'ADMIN_LOGIN'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* User Identity Info / Logout / Sign In */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-[11px] font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {user.name} ({user.role})
              </span>
              <button
                id="logout-btn"
                onClick={logout}
                title="Log out"
                className="text-slate-400 hover:text-rose-400 p-1 flex items-center gap-1 text-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                id="header-top-login-btn"
                onClick={() => navigateTo('AUTH_LANDING')}
                className="text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Register</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Header Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div
          onClick={() => {
            if (user) navigateTo('MAIN_APP');
            else navigateTo('AUTH_LANDING');
          }}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md font-black text-xl tracking-tight">
            RS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">ROOMSETU</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                0% Brokerage
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Direct owner-to-renter connection in Wakad & Pune
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* If Not Logged In: Show Tenant Login and Owner Login Buttons */}
          {!user ? (
            <div className="flex items-center gap-2">
              <button
                id="header-browse-btn"
                onClick={() => navigateTo('BROWSE_ROOMS')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  currentView === 'BROWSE_ROOMS'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Explore Map</span>
              </button>

              <button
                id="header-tenant-login-btn"
                onClick={() => navigateTo('USER_LOGIN')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'USER_LOGIN'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Tenant Login</span>
              </button>

              <button
                id="header-owner-login-btn"
                onClick={() => navigateTo('OWNER_LOGIN')}
                className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  currentView === 'OWNER_LOGIN'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Room Owner Login</span>
              </button>
            </div>
          ) : (
            /* Logged in state controls */
            <div className="flex items-center gap-3">
              {user.role === 'USER' && (
                <button
                  id="header-list-property-btn"
                  onClick={() => navigateTo('OWNER_LOGIN')}
                  className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Switch to Owner Portal</span>
                </button>
              )}

              {/* Notifications Bell */}
              <button
                id="notifications-bell-btn"
                onClick={openDrawer}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Account / Profile Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs overflow-hidden border border-slate-300">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {user.role === 'USER'
                      ? 'Renter / Tenant'
                      : user.role === 'ROOM_OWNER'
                      ? 'Property Owner'
                      : 'Administrator'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
