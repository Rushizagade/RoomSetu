import React, { useState, useEffect } from 'react';
import { useAuth, AuthMode } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import {
  Phone,
  CheckCircle,
  Loader2,
  Building2,
  UserCheck,
  ShieldCheck,
  Zap,
  Search,
  Lock,
  Mail,
  ArrowRight,
  UserPlus,
  LogIn,
  MapPin,
  Home,
  Check,
} from 'lucide-react';
import { UserRole } from '../../types/index.ts';

interface LoginPageProps {
  initialRole?: UserRole;
  initialMode?: AuthMode;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialRole = 'USER',
  initialMode,
}) => {
  const {
    authMode: contextAuthMode,
    loginWithOtp,
    loginAdmin,
    switchRole,
    navigateTo,
    setAuthMode: setContextAuthMode,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode || contextAuthMode || 'LOGIN');
  const [activeRole, setActiveRole] = useState<'USER' | 'ROOM_OWNER' | 'ADMIN'>(
    initialRole === 'ADMIN' ? 'ADMIN' : initialRole === 'ROOM_OWNER' ? 'ROOM_OWNER' : 'USER'
  );

  // Sign In / Register state
  const [phone, setPhone] = useState('9123456780');
  const [name, setName] = useState('Rushikesh Zope');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Pune');
  const [locality, setLocality] = useState('Wakad');
  const [propertyInterest, setPropertyInterest] = useState('1 BHK / 2 BHK');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP flow
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@roomsetu.in');
  const [adminPassword, setAdminPassword] = useState('admin12345');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  // Update default phone/name when switching role tabs
  const handleSelectRole = (role: 'USER' | 'ROOM_OWNER' | 'ADMIN') => {
    setActiveRole(role);
    setOtpSent(false);
    setOtpCode('');
    setErrorMsg(null);
    setSuccessMsg(null);

    if (role === 'USER') {
      setPhone('9123456780');
      setName('Rushikesh Zope');
    } else if (role === 'ROOM_OWNER') {
      setPhone('9822012345');
      setName('Rajesh Kulkarni');
    }
  };

  const handleToggleMode = (newMode: AuthMode) => {
    setMode(newMode);
    setContextAuthMode(newMode);
    setOtpSent(false);
    setOtpCode('');
    setErrorMsg(null);
    setSuccessMsg(null);
    if (newMode === 'REGISTER' && activeRole === 'ADMIN') {
      setActiveRole('USER');
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!phone || phone.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    if (mode === 'REGISTER' && (!name || name.trim().length < 2)) {
      setErrorMsg('Please provide your full name to create an account');
      return;
    }

    if (mode === 'REGISTER' && !agreeTerms) {
      setErrorMsg('Please agree to 0% brokerage direct rental terms to proceed');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.sendOtp(phone, activeRole as 'USER' | 'ROOM_OWNER');
      setOtpSent(true);
      if (res.devOtp) {
        setDevOtp(res.devOtp);
        setOtpCode(res.devOtp);
      }
      setSuccessMsg(`OTP sent to +91 ${phone}`);
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
      await loginWithOtp(phone, activeRole as 'USER' | 'ROOM_OWNER', otpCode, name);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid OTP code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
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

  const handleQuickLogin = async (targetRole: UserRole) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await switchRole(targetRole);
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick access failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-4 flex flex-col justify-center items-center">
      <div className="w-full max-w-lg bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center mx-auto shadow-2xs mb-3">
            RS
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {mode === 'LOGIN' ? 'Sign in to RoomSetu' : 'Create RoomSetu Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Direct owner-to-tenant room rental network · 0% Brokerage
          </p>
        </div>

        {/* Primary Mode Switcher: Sign In vs Create Account */}
        <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 mb-5 border border-slate-200/60">
          <button
            id="auth-mode-login-btn"
            type="button"
            onClick={() => handleToggleMode('LOGIN')}
            className={`py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'LOGIN'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In (Login)</span>
          </button>

          <button
            id="auth-mode-register-btn"
            type="button"
            onClick={() => handleToggleMode('REGISTER')}
            className={`py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'REGISTER'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Role Selector Tabs (Tenant vs Room Owner vs Admin) */}
        <div className="bg-slate-50 p-1 rounded-xl flex items-center gap-1 mb-6 border border-slate-200/60">
          <button
            id="role-tab-tenant"
            type="button"
            onClick={() => handleSelectRole('USER')}
            className={`flex-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'USER'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tenant (Renter)</span>
          </button>

          <button
            id="role-tab-owner"
            type="button"
            onClick={() => handleSelectRole('ROOM_OWNER')}
            className={`flex-1 py-1.5 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeRole === 'ROOM_OWNER'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Room Owner (Landlord)</span>
          </button>

          {mode === 'LOGIN' && (
            <button
              id="role-tab-admin"
              type="button"
              onClick={() => handleSelectRole('ADMIN')}
              className={`py-1.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                activeRole === 'ADMIN'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 bg-white border border-slate-200/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>

        {/* Error / Success Notifications */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-slate-100 border border-slate-300 text-slate-900 text-xs rounded-xl font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-slate-100 border border-slate-300 text-slate-900 text-xs rounded-xl font-medium flex items-center gap-2">
            <Check className="w-4 h-4 text-slate-800 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 1: SIGN IN (LOGIN)                                     */}
        {/* ============================================================ */}
        {mode === 'LOGIN' && activeRole !== 'ADMIN' && (
          <div>
            {!otpSent ? (
              <div className="space-y-4">
                {/* 1-Click Instant Demo Login Option */}
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Instant Demo Access
                  </span>
                  
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(activeRole)}
                    disabled={isLoading}
                    className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-left transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-900">
                          {activeRole === 'USER'
                            ? '1-Click Tenant Demo (Rushikesh)'
                            : '1-Click Landlord Demo (Rajesh)'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {activeRole === 'USER'
                            ? 'Search verified rooms, map view & inquiries'
                            : 'Post listings, manage rooms & tenant requests'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-800 transition-all" />
                  </button>
                </div>

                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                    Or Sign In with Mobile Number
                  </span>
                </div>

                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      id="login-name-input"
                      type="text"
                      placeholder="e.g. Rushikesh Zope"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      10-Digit Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-semibold text-slate-400">+91</span>
                      <input
                        id="login-phone-input"
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9123456780"
                        required
                        className="w-full pl-12 pr-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold tracking-wider text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none transition-colors"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Verification code is <strong className="text-slate-600 font-mono">123456</strong> for testing.
                    </span>
                  </div>

                  <button
                    id="send-otp-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                    <span>{activeRole === 'USER' ? 'Sign In as Tenant' : 'Sign In as Room Owner'}</span>
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <CheckCircle className="w-4 h-4 text-slate-700" />
                      <span>OTP Sent Successfully</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devOtp || '123456')}
                      className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-200 px-2 py-0.5 rounded-md cursor-pointer"
                    >
                      Auto-Fill Code
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Verification OTP for +91 {phone}: <strong className="text-slate-800 font-mono text-xs">{devOtp || '123456'}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter 6-Digit Verification OTP
                  </label>
                  <input
                    id="verify-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full px-4 py-3 bg-white text-center tracking-widest text-xl font-bold rounded-xl border border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                  />
                </div>

                <button
                  id="verify-otp-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Verify & Enter Dashboard</span>
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
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
                    className="text-slate-800 font-semibold hover:underline cursor-pointer"
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 2: CREATE ACCOUNT (REGISTRATION PORTAL)                 */}
        {/* ============================================================ */}
        {mode === 'REGISTER' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-name-input"
                    type="text"
                    required
                    placeholder={activeRole === 'USER' ? 'e.g. Rushikesh Zope' : 'e.g. Rajesh Kulkarni'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      10-Digit Mobile (+91) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-semibold text-slate-400">+91</span>
                      <input
                        id="reg-phone-input"
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="9822012345"
                        required
                        className="w-full pl-12 pr-3 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      id="reg-email-input"
                      type="email"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary City
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3.5" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Pune"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {activeRole === 'USER' ? 'Preferred Locality' : 'Property Locality'}
                    </label>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Wakad / Baner / Hinjawadi"
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                    />
                  </div>
                </div>

                {activeRole === 'USER' ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Looking For Room Type
                    </label>
                    <div className="relative flex items-center">
                      <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3.5" />
                      <input
                        type="text"
                        value={propertyInterest}
                        onChange={(e) => setPropertyInterest(e.target.value)}
                        placeholder="e.g. 1 RK, 1 BHK, 2 BHK, Shared PG"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <span className="font-semibold text-slate-900 block">Landlord Guarantee:</span>
                    <p>
                      Post unlimited rooms with 0% brokerage. Verified badge awarded upon address and photo validation.
                    </p>
                  </div>
                )}

                <div className="flex items-start gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="agree-terms-checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-slate-900 focus:ring-slate-400"
                  />
                  <label htmlFor="agree-terms-checkbox" className="text-[11px] text-slate-600 cursor-pointer">
                    I agree to RoomSetu 0% brokerage terms and direct owner contact policy.
                  </label>
                </div>

                <button
                  id="reg-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>
                    {activeRole === 'USER' ? 'Create Tenant Account' : 'Create Room Owner Account'}
                  </span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <CheckCircle className="w-4 h-4 text-slate-700" />
                      <span>Registration Verification Code</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devOtp || '123456')}
                      className="text-[10px] font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-200 px-2 py-0.5 rounded-md cursor-pointer"
                    >
                      Auto-Fill
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    OTP for +91 {phone}: <strong className="text-slate-800 font-mono text-xs">{devOtp || '123456'}</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enter Verification OTP
                  </label>
                  <input
                    id="verify-reg-otp-input"
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    required
                    className="w-full px-4 py-3 bg-white text-center tracking-widest text-xl font-bold rounded-xl border border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                  />
                </div>

                <button
                  id="verify-reg-otp-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  <span>Confirm Account & Enter Dashboard</span>
                </button>

                <div className="text-center text-xs text-slate-500 pt-1">
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="hover:text-slate-800 underline cursor-pointer"
                  >
                    ← Edit details & phone
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 3: ADMIN LOGIN FORM                                     */}
        {/* ============================================================ */}
        {mode === 'LOGIN' && activeRole === 'ADMIN' && (
          <div className="space-y-4">
            {/* Quick 1-Click Admin Access */}
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={isLoading}
              className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/70 hover:bg-slate-100 text-left transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    1-Click Administrator Hub Access
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Direct access to listing approvals, moderation & audit logs
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-800 transition-all" />
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider absolute">
                Or Admin Credentials
              </span>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Email
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    id="admin-email-input"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@roomsetu.in"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                  <input
                    id="admin-password-input"
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="admin-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Sign in as Administrator</span>
              </button>
            </form>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            id="browse-guest-link"
            onClick={() => navigateTo('BROWSE_ROOMS')}
            className="hover:text-slate-900 flex items-center gap-1 font-medium cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore Rooms as Guest</span>
          </button>

          {activeRole !== 'ADMIN' ? (
            <button
              id="admin-portal-link"
              onClick={() => handleSelectRole('ADMIN')}
              className="hover:text-slate-900 font-medium cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin Portal</span>
            </button>
          ) : (
            <button
              id="back-to-user-portal-link"
              onClick={() => handleSelectRole('USER')}
              className="hover:text-slate-900 font-medium cursor-pointer"
            >
              ← Back to User Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
