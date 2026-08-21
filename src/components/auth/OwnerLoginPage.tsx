import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  Phone,
  CheckCircle,
  Loader2,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Users,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  UserCheck,
  Zap,
  Check,
  Search,
} from 'lucide-react';

export const OwnerLoginPage: React.FC = () => {
  const { loginWithOtp, switchRole, navigateTo } = useAuth();
  const [phone, setPhone] = useState('9822012345');
  const [name, setName] = useState('Rajesh Kulkarni');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    if (!phone || phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendOtp(phone, 'ROOM_OWNER');
      setOtpSent(true);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtpCode(res.devOtp); // Auto-fill demo OTP
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
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      await loginWithOtp(phone, 'ROOM_OWNER', otpCode, name);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (ownerPhone: string, ownerName: string) => {
    setPhone(ownerPhone);
    setName(ownerName);
    setIsLoading(true);
    try {
      await switchRole('ROOM_OWNER');
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50/70 via-slate-50 to-slate-100 py-8 px-4 flex flex-col justify-center items-center">
      {/* Top Portal Switcher Segmented Control */}
      <div className="w-full max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            id="login-tab-tenant"
            onClick={() => navigateTo('USER_LOGIN')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Tenant / Renter Portal</span>
          </button>
          <button
            id="login-tab-owner"
            onClick={() => navigateTo('OWNER_LOGIN')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white shadow-xs transition-all cursor-pointer"
          >
            <Building2 className="w-4 h-4" />
            <span>Room Owner Portal</span>
          </button>
          <button
            id="login-tab-admin"
            onClick={() => navigateTo('ADMIN_LOGIN')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-purple-700 hover:bg-white transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        <button
          id="browse-map-btn"
          onClick={() => navigateTo('BROWSE_ROOMS')}
          className="w-full sm:w-auto text-xs font-bold text-slate-700 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 px-3.5 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-blue-700" />
          <span>Explore Discovery Map</span>
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Value Proposition for Landlords */}
        <div className="lg:col-span-6 space-y-5">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 text-blue-900 text-xs font-black px-3.5 py-1 rounded-full shadow-2xs">
            <Building2 className="w-3.5 h-3.5 text-blue-700" />
            <span>0% Commission Landlord Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            List Your Property & Connect Directly with Verified Tenants
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Post flats, independent rooms, PGs, and apartments in Pune. Pinpoint your property location on Google Maps and manage inquiries with zero brokerage deductions.
          </p>

          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Google Places autocomplete + draggable map pin for accurate building gate entrance</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span>Receive direct tenant phone inquiries, WhatsApp chats, and renter profiles</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Approve, reschedule, or complete room viewing visits with 1 click</span>
            </div>
          </div>

          {/* Quick link to Tenant Login */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold">
            <span className="text-slate-500">Looking for a room to rent?</span>
            <button
              onClick={() => navigateTo('USER_LOGIN')}
              className="text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Go to Tenant / Renter Login →</span>
            </button>
          </div>
        </div>

        {/* Right Side: Landlord Login & Registration Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-700" />

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Room Owner Login</h2>
                  <p className="text-xs text-slate-500">Sign in to manage listings & view inquiries</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-full">
                Owner Portal
              </span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {errorMsg}
            </div>
          )}

          {!otpSent ? (
            <div className="space-y-4">
              {/* 1-Click Fast Landlord Test Accounts */}
              <div className="space-y-2 pb-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>1-Click Verified Landlord Accounts:</span>
                  <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded">Instant Access</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('9822012345', 'Rajesh Kulkarni')}
                    disabled={isLoading}
                    className="p-2.5 bg-blue-50/70 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-blue-950 flex items-center justify-between">
                      <span>Rajesh Kulkarni</span>
                      <Zap className="w-3 h-3 text-blue-600 group-hover:scale-125 transition-transform" />
                    </div>
                    <div className="text-[11px] text-blue-800">+91 9822012345 · 3 Listings</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('9876543210', 'Priya Sharma')}
                    disabled={isLoading}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                      <span>Priya Sharma</span>
                      <Zap className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="text-[11px] text-slate-500">+91 9876543210 · 2 Listings</div>
                  </button>
                </div>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  Or Mobile OTP Login
                </span>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Owner / Landlord Name
                  </label>
                  <input
                    id="owner-login-name-input"
                    type="text"
                    placeholder="e.g. Rajesh Kulkarni"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (India)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-bold text-slate-500">+91</span>
                    <input
                      id="owner-login-phone-input"
                      type="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="9822012345"
                      required
                      className="w-full pl-12 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm font-semibold tracking-wider focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Enter any 10-digit number. OTP code is <strong className="text-slate-700 font-mono">123456</strong>.
                  </span>
                </div>

                <button
                  id="owner-send-otp-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                  <span>Send OTP & Login as Owner</span>
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span>OTP Sent Successfully</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(devOtp || '123456')}
                    className="text-[10px] font-bold text-blue-800 bg-blue-200/70 hover:bg-blue-200 px-2 py-0.5 rounded cursor-pointer"
                  >
                    Auto-Fill Code
                  </button>
                </div>
                <p className="text-[11px] text-blue-800">
                  Verification OTP for +91 {phone}: <strong className="text-blue-950 font-mono text-xs">{devOtp || '123456'}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  id="owner-verify-otp-input"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full px-4 py-3 bg-white text-center tracking-widest text-xl font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <button
                id="owner-verify-otp-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Verify & Enter Landlord Dashboard</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="hover:text-slate-800 underline cursor-pointer"
                >
                  ← Change phone number
                </button>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  className="text-blue-700 font-bold hover:underline cursor-pointer"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
