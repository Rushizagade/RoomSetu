import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  Phone,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Heart,
  Eye,
  KeyRound,
  UserCheck,
} from 'lucide-react';

export const UserLoginPage: React.FC = () => {
  const { loginWithOtp, switchRole, navigateTo } = useAuth();
  const [phone, setPhone] = useState('9123456780');
  const [name, setName] = useState('Rushikesh Zope');
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
      const res = await api.sendOtp(phone, 'USER');
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
      await loginWithOtp(phone, 'USER', otpCode, name);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    try {
      await switchRole('USER');
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-emerald-50/50 via-slate-50 to-slate-100 py-10 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Value Proposition for Renters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>0% Brokerage Renter Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Find & Rent Rooms Directly from Verified Owners
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            Search verified flats, 1 RKs, 1/2/3 BHKs, and PG accommodations in Wakad, Hinjewadi, and Pune with exact Google Maps coordinates and zero broker fees.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <span>Exact Google Maps GPS pin verified on every listing</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Direct owner communication with no middleman brokerage</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-semibold text-slate-800 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <span>Schedule in-person visits and get instant landlord replies</span>
            </div>
          </div>

          {/* Quick link to Room Owner Login */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold">
            <span className="text-slate-500">Are you a property owner?</span>
            <button
              onClick={() => navigateTo('OWNER_LOGIN')}
              className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Go to Landlord / Owner Login →</span>
            </button>
          </div>
        </div>

        {/* Right Side: Renter Login & Registration Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-600" />

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Tenant / Renter Login</h2>
                  <p className="text-xs text-slate-500">Sign in to contact owners and book visits</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                Renter App
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
                  Your Full Name
                </label>
                <input
                  id="user-login-name-input"
                  type="text"
                  placeholder="e.g. Rushikesh Zope"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mobile Number (India)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-bold text-slate-500">+91</span>
                  <input
                    id="user-login-phone-input"
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9123456780"
                    required
                    className="w-full pl-12 pr-3 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-sm font-semibold tracking-wider focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  We'll send a 6-digit OTP to verify your account
                </span>
              </div>

              <button
                id="user-send-otp-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                <span>Send OTP to Mobile</span>
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
                  Or Test Instantly
                </span>
              </div>

              <button
                id="user-demo-login-btn"
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isLoading}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-Click Test Login as Renter (Rushikesh)</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => navigateTo('BROWSE_ROOMS')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  Skip & Browse Rooms as Guest →
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>OTP Sent Successfully</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Verification code for +91 {phone}: <strong className="text-emerald-950 font-mono text-xs">{devOtp || '123456'}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  id="user-verify-otp-input"
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  required
                  className="w-full px-4 py-3 bg-white text-center tracking-widest text-xl font-black rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <button
                id="user-verify-otp-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-transform transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Verify & Enter Renter App</span>
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
                  className="text-emerald-700 font-bold hover:underline cursor-pointer"
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
