import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
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
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, authModalInitialRole, closeAuthModal, loginWithOtp, loginAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>(authModalInitialRole || 'USER');
  const [phone, setPhone] = useState('9123456780');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('admin@roomsetu.in');
  const [adminPassword, setAdminPassword] = useState('admin12345');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(authModalInitialRole || 'USER');
    setOtpSent(false);
    setOtpCode('');
    setErrorMsg(null);
  }, [authModalInitialRole, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!phone || phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendOtp(phone, activeTab as 'USER' | 'ROOM_OWNER');
      setOtpSent(true);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtpCode(res.devOtp); // auto-fill for testing ease
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={closeAuthModal} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">Sign in to RoomSetu</h3>
            <p className="text-xs text-slate-500 mt-0.5">Secure direct owner-to-renter authentication</p>
          </div>
          <button
            id="close-auth-modal-btn"
            onClick={closeAuthModal}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Tabs */}
        <div className="p-3 bg-slate-100 flex items-center gap-1 border-b border-slate-200">
          <button
            id="auth-tab-user"
            type="button"
            onClick={() => {
              setActiveTab('USER');
              setOtpSent(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'USER'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Renter / User</span>
          </button>

          <button
            id="auth-tab-owner"
            type="button"
            onClick={() => {
              setActiveTab('ROOM_OWNER');
              setOtpSent(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ROOM_OWNER'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Room Owner</span>
          </button>

          <button
            id="auth-tab-admin"
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'ADMIN'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {activeTab === 'ADMIN' ? (
            /* Admin Password Login */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="admin-email-input"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="admin-password-input"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Default credentials preloaded: <strong>admin@roomsetu.in</strong> / <strong>admin12345</strong></span>
              </div>

              <button
                id="admin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Login to Admin Panel</span>
              </button>
            </form>
          ) : (
            /* User & Owner Mobile OTP Login */
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {activeTab === 'USER' ? 'Renter' : 'Property Owner'} Full Name (Optional)
                    </label>
                    <input
                      id="otp-name-input"
                      type="text"
                      placeholder={activeTab === 'USER' ? 'e.g. Rushikesh Zope' : 'e.g. Rajesh Kulkarni'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-slate-500">+91</span>
                      <input
                        id="otp-phone-input"
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9822012345"
                        required
                        className="w-full pl-12 pr-3 py-2.5 bg-white rounded-xl border border-slate-300 text-sm font-semibold tracking-wider focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    id="send-otp-btn"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'USER'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                    <span>Send Mobile OTP</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span>OTP sent to +91 {phone}. Demo verification code: <strong>{devOtp || '123456'}</strong></span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                    <input
                      id="verify-otp-input"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      required
                      className="w-full px-4 py-3 bg-white text-center tracking-widest text-lg font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <button
                    id="verify-otp-btn"
                    type="submit"
                    disabled={isLoading}
                    className={`w-full text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      activeTab === 'USER'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    <span>Verify & Continue</span>
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      Change phone number
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
