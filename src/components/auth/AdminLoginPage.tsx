import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  ShieldCheck,
  Mail,
  Lock,
  Loader2,
  Sparkles,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, switchRole, navigateTo } = useAuth();
  const [adminEmail, setAdminEmail] = useState('admin@roomsetu.in');
  const [adminPassword, setAdminPassword] = useState('admin12345');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginAdmin(adminEmail, adminPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAdmin = async () => {
    setIsLoading(true);
    try {
      await switchRole('ADMIN');
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-purple-950 via-slate-900 to-slate-950 py-12 px-4 flex flex-col justify-center items-center text-white">
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-purple-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

        <div className="text-center mb-6 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 text-purple-300 flex items-center justify-center mx-auto shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">Admin Moderation Portal</h2>
          <p className="text-xs text-purple-200">RoomSetu Trust & Safety Control Center</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-login-email-input"
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="admin-login-password-input"
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 rounded-xl border border-slate-700 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-purple-950/60 rounded-xl border border-purple-800/40 text-[11px] text-purple-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Credentials: <strong>admin@roomsetu.in</strong> / <strong>admin12345</strong></span>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            <span>Sign In to Admin Panel</span>
          </button>

          <button
            id="admin-demo-login-btn"
            type="button"
            onClick={handleQuickDemoAdmin}
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-purple-200 font-bold py-2.5 rounded-xl border border-purple-900/50 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5 text-purple-400" />
            <span>1-Click Test Login as Admin</span>
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => navigateTo('AUTH_LANDING')}
              className="text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
