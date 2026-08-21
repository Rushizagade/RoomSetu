import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider, useNotifications } from './context/NotificationContext.tsx';
import { Header } from './components/common/Header.tsx';
import { NotificationDrawer } from './components/common/NotificationDrawer.tsx';
import { AuthModal } from './components/auth/AuthModal.tsx';
import { AuthLandingPage } from './components/auth/AuthLandingPage.tsx';
import { UserLoginPage } from './components/auth/UserLoginPage.tsx';
import { OwnerLoginPage } from './components/auth/OwnerLoginPage.tsx';
import { AdminLoginPage } from './components/auth/AdminLoginPage.tsx';
import { UserApp } from './components/user/UserApp.tsx';
import { OwnerApp } from './components/owner/OwnerApp.tsx';
import { AdminApp } from './components/admin/AdminApp.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContainer: React.FC = () => {
  const { toastMessage, hideToast } = useNotifications();
  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';
  const isWarning = toastMessage.type === 'warning';

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border max-w-sm ${
          isSuccess
            ? 'bg-slate-900 text-white border-emerald-500/50'
            : isWarning
            ? 'bg-slate-900 text-white border-amber-500/50'
            : 'bg-slate-900 text-white border-slate-700'
        }`}
      >
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : isWarning ? (
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold text-slate-100">{toastMessage.title}</h4>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.message}</p>
        </div>
        <button
          onClick={hideToast}
          className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const MainExperience: React.FC = () => {
  const { user, currentView, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center mx-auto shadow-lg animate-pulse">
            RS
          </div>
          <p className="text-xs font-bold text-slate-600">Connecting to RoomSetu Network...</p>
        </div>
      </div>
    );
  }

  // If user is explicitly on a login, landing, or guest browse view, show that view
  if (currentView === 'USER_LOGIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <div className="flex-1">
          <UserLoginPage />
        </div>
        <NotificationDrawer />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'OWNER_LOGIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <div className="flex-1">
          <OwnerLoginPage />
        </div>
        <NotificationDrawer />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'ADMIN_LOGIN') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <div className="flex-1">
          <AdminLoginPage />
        </div>
        <NotificationDrawer />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'AUTH_LANDING') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <div className="flex-1">
          <AuthLandingPage />
        </div>
        <NotificationDrawer />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  if (currentView === 'BROWSE_ROOMS') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <div className="flex-1">
          <UserApp />
        </div>
        <NotificationDrawer />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  // If user is authenticated, route to their role dashboard
  if (user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <Header />
        <div className="flex-1">
          {user.role === 'USER' && <UserApp />}
          {user.role === 'ROOM_OWNER' && <OwnerApp />}
          {user.role === 'ADMIN' && <AdminApp />}
        </div>
        <NotificationDrawer />
        <AuthModal />
        <ToastContainer />
      </div>
    );
  }

  // Fallback to AuthLandingPage if unauthenticated
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      <Header />
      <div className="flex-1">
        <AuthLandingPage />
      </div>
      <NotificationDrawer />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainExperience />
      </NotificationProvider>
    </AuthProvider>
  );
}
