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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleQuickDemoLogin = async () => {
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
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-blue-50/60 via-slate-50 to-slate-100 py-10 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Value Proposition for Landlords */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 bg-blue-100 border border-blue-300 text-blue-900 text-xs font-black px-3 py-1 rounded-full">
            <Building2 className="w-3.5 h-3.5" />
            <span>0% Commission Landlord Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            List Your Property & Connect Directly with Verified Tenants
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Post flats, independent rooms, PGs, and apartments in Pune. Pinpoint your property location on Google Maps and manage inquiries with zero brokerage deductions.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Google Places autocomplete + draggable map pin for accurate gate entrance</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <span>Receive direct tenant phone inquiries & tenant profiles</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <span>Approve, reschedule, or decline room viewing visits with 1 click</span>
            </div>
          </div>

          {/* Quick link to Tenant Login */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="text-slate-500">Looking for a room to rent?</span>
            <button
              onClick={() => navigateTo('USER_LOGIN')}
              className="text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
            >
              <span>Go to Tenant / Renter Login →</span>
            </button>
          </div>
        </div>

        {/* Right Side: Landlord Login & Registration Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-700" />

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Room Owner Login</h2>
                  <p className="text-xs text-slate-500">Sign in to manage listings & view inquiries</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
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
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Landlord / Owner Full Name
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
                  We'll send a 6-digit OTP code to verify your landlord identity
                </span>
              </div>

              <button
                id="owner-send-otp-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                <span>Send OTP to Landlord Mobile</span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  Or Test Instantly
                </span>
              </div>

              <button
                id="owner-demo-login-btn"
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>1-Click Test Login as Landlord (Rajesh)</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigateTo('BROWSE_ROOMS')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Explore Public Room Discovery First →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>OTP Sent to Landlord</span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Verification code for +91 {phone}: <strong className="text-blue-950 font-mono text-xs">{devOtp || '123456'}</strong>
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
                <span>Verify & Enter Owner Command Center</span>
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
                  onClick={handleSendOtp}
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
