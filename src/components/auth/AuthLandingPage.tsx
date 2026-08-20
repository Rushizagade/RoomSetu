import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  Building2,
  UserCheck,
  ShieldCheck,
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  KeyRound,
} from 'lucide-react';

export const AuthLandingPage: React.FC = () => {
  const { navigateTo, switchRole } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-5xl space-y-10 text-center">
        {/* Main Branding Header */}
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-black px-4 py-1.5 rounded-full shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>0% Brokerage · Direct Owner-to-Renter Connection</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome to <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">RoomSetu</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Choose your portal below to log in or register. Direct rental discovery with verified Google Maps locations in Wakad, Pune.
          </p>
        </div>

        {/* 2 Primary Action Portals: Tenant vs Room Owner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
          {/* 1. Tenant / Renter Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-emerald-200/80 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-emerald-600" />

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <UserCheck className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600">
                  For Renters & Room Seekers
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Tenant Login & Register</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Looking for a 1 RK, 1/2/3 BHK flat, or PG accommodation? Contact verified property owners directly with zero broker fees.
              </p>

              <div className="space-y-2 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Google Maps GPS verified locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct phone contact & visit bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% 0% brokerage guarantee</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                id="portal-renter-login-btn"
                onClick={() => navigateTo('USER_LOGIN')}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>Login as Tenant / Renter</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="portal-renter-demo-btn"
                onClick={() => switchRole('USER')}
                className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 px-4 rounded-xl border border-emerald-200 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>1-Click Test Demo (Rushikesh)</span>
              </button>
            </div>
          </div>

          {/* 2. Room Owner / Landlord Card */}
          <div className="bg-white rounded-3xl p-7 sm:p-8 border border-blue-200/80 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-2 bg-blue-600" />

            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                <Building2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-blue-600">
                  For Property Landlords
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">Room Owner Login & Register</h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Have a flat, independent house, or room to rent out in Pune? List it with exact Google Maps coordinates and get direct verified tenants.
              </p>

              <div className="space-y-2 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Free property listing with 0% commission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Draggable Google Maps pin for exact gate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Manage inquiries & schedule visits online</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <button
                id="portal-owner-login-btn"
                onClick={() => navigateTo('OWNER_LOGIN')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group-hover:gap-3 cursor-pointer"
              >
                <span>Login as Room Owner</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="portal-owner-demo-btn"
                onClick={() => switchRole('ROOM_OWNER')}
                className="w-full bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold py-2.5 px-4 rounded-xl border border-blue-200 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>1-Click Test Demo (Rajesh Kulkarni)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Navigation Options */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            id="portal-browse-guest-btn"
            onClick={() => navigateTo('BROWSE_ROOMS')}
            className="bg-white hover:bg-slate-50 text-slate-800 font-bold px-5 py-2.5 rounded-xl border border-slate-300 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 text-emerald-600" />
            <span>Browse Discovery Map as Guest</span>
          </button>

          <button
            id="portal-admin-login-btn"
            onClick={() => navigateTo('ADMIN_LOGIN')}
            className="bg-slate-900 hover:bg-black text-purple-200 font-bold px-5 py-2.5 rounded-xl border border-purple-900/60 shadow-2xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin Moderation Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
