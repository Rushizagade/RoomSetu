import React, { useState, useEffect } from 'react';
import { useAuth, AuthMode } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  X,
  Phone,
  Lock,
  Mail,
  ShieldCheck,
  Building2,
  UserCheck,
  CheckCircle,
  Loader2,
  UserPlus,
  LogIn,
  Check,
  Zap,
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalInitialRole,
    authModalInitialMode,
    closeAuthModal,
    loginWithOtp,
    loginAdmin,
    switchRole,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('LOGIN');
  const [activeTab, setActiveTab] = useState<UserRole>(authModalInitialRole || 'USER');
  const [phone, setPhone] = useState('9123456780');
  const [name, setName] = useState('Rushikesh Zope');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('admin@roomsetu.in');
  const [adminPassword, setAdminPassword] = useState('admin12345');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(authModalInitialRole || 'USER');
    setMode(authModalInitialMode || 'LOGIN');
    setOtpSent(false);
    setOtpCode('');
    setErrorMsg(null);
    if (authModalInitialRole === 'ROOM_OWNER') {
      setPhone('9822012345');
      setName('Rajesh Kulkarni');
    } else {
      setPhone('9123456780');
      setName('Rushikesh Zope');
    }
  }, [authModalInitialRole, authModalInitialMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phone || phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }

    if (mode === 'REGISTER' && (!name || !name.trim())) {
      setErrorMsg('Please enter your full name');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendOtp(phone, activeTab as 'USER' | 'ROOM_OWNER');
      setOtpSent(true);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtpCode(res.devOtp);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!otpCode) {
      setErrorMsg('Please enter the OTP code');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOtp(phone, activeTab as 'USER' | 'ROOM_OWNER', otpCode, name);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginAdmin(adminEmail, adminPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid admin credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: UserRole) => {
    setIsLoading(true);
    try {
      await switchRole(targetRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={closeAuthModal} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {mode === 'LOGIN' ? 'Sign In to RoomSetu' : 'Create RoomSetu Account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Direct owner-to-renter authentication · 0% Brokerage</p>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-5 pt-4 pb-2 bg-white flex gap-1 border-b border-slate-100">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setOtpSent(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              mode === 'LOGIN'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <LogIn className="w-3 h-3" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setOtpSent(false);
              setErrorMsg(null);
              if (activeTab === 'ADMIN') setActiveTab('USER');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors ${
              mode === 'REGISTER'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 bg-slate-100'
            }`}
          >
            <UserPlus className="w-3 h-3" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Role Tabs */}
        <div className="p-2 bg-slate-100/70 flex items-center gap-1 border-b border-slate-200/80">
          <button
            id="modal-auth-tab-user"
            type="button"
            onClick={() => {
              setActiveTab('USER');
              setOtpSent(false);
              setErrorMsg(null);
              setPhone('9123456780');
              setName('Rushikesh Zope');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'USER'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tenant</span>
          </button>

          <button
            id="modal-auth-tab-owner"
            type="button"
            onClick={() => {
              setActiveTab('ROOM_OWNER');
              setOtpSent(false);
              setErrorMsg(null);
              setPhone('9822012345');
              setName('Rajesh Kulkarni');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ROOM_OWNER'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Room Owner</span>
          </button>

          {mode === 'LOGIN' && (
            <button
              id="modal-auth-tab-admin"
              type="button"
              onClick={() => {
                setActiveTab('ADMIN');
                setErrorMsg(null);
              }}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeTab === 'ADMIN'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Body Form */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-slate-100 border border-slate-300 text-slate-900 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {activeTab !== 'ADMIN' ? (
            <div>
              {!otpSent ? (
                <div className="space-y-3.5">
                  {mode === 'LOGIN' && (
                    <button
                      type="button"
                      onClick={() => handleQuickDemo(activeTab)}
                      disabled={isLoading}
                      className="w-full p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-900">
                          {activeTab === 'USER' ? '1-Click Demo Tenant' : '1-Click Demo Landlord'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">Quick Access →</span>
                    </button>
                  )}

                  <form onSubmit={handleSendOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name {mode === 'REGISTER' && <span className="text-rose-500">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rushikesh Zope"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required={mode === 'REGISTER'}
                        className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Mobile Number (India)
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-xs font-semibold text-slate-400">+91</span>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9123456780"
                          required
                          className="w-full pl-11 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-semibold tracking-wider text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                      <span>{mode === 'LOGIN' ? 'Send Verification OTP' : 'Create & Verify Account'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <CheckCircle className="w-4 h-4 text-slate-700" />
                        <span>OTP Sent</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOtpCode(devOtp || '123456')}
                        className="text-[10px] font-semibold text-slate-700 bg-slate-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        Auto-Fill
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Code for +91 {phone}: <strong className="text-slate-800 font-mono">{devOtp || '123456'}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full px-4 py-2.5 bg-white text-center tracking-widest text-lg font-bold rounded-xl border border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Verify & Continue</span>
                  </button>

                  <div className="text-center text-xs text-slate-500">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="hover:text-slate-800 underline cursor-pointer"
                    >
                      ← Change mobile number
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Admin Login</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
