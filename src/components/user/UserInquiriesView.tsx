import React, { useState, useEffect } from 'react';
import { Inquiry, Visit } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Building2,
  RefreshCw,
  Loader2,
} from 'lucide-react';

export const UserInquiriesView: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'inquiries' | 'visits'>('inquiries');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inqRes, visRes] = await Promise.all([api.getInquiries(), api.getVisits()]);
      setInquiries(inqRes.inquiries);
      setVisits(visRes.visits);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Owner Responded</span>;
      case 'SENT':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Sent · Pending</span>;
      case 'ACCEPTED':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Visit Confirmed</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Slot Unavailable</span>;
      case 'REQUESTED':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">Awaiting Owner Confirmation</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2 py-0.5 rounded-full">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900">Inquiries & Visits Tracker</h2>
          <p className="text-xs text-slate-500">Track direct communications and scheduled visits with property owners</p>
        </div>

        <button
          id="refresh-inquiries-btn"
          onClick={loadData}
          className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          id="tab-user-inquiries"
          onClick={() => setActiveSubTab('inquiries')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'inquiries'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Direct Inquiries ({inquiries.length})</span>
        </button>

        <button
          id="tab-user-visits"
          onClick={() => setActiveSubTab('visits')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'visits'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Scheduled Visits ({visits.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
          <span className="text-sm">Loading activity...</span>
        </div>
      ) : activeSubTab === 'inquiries' ? (
        /* Inquiries List */
        inquiries.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Inquiries Sent Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you find a room you like in Wakad, Pune or other cities, tap "Contact Owner" to send a direct message.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-200 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    {inq.propertyCoverImage ? (
                      <img
                        src={inq.propertyCoverImage}
                        alt="prop"
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{inq.propertyName || 'Room Listing'}</h4>
                      <p className="text-xs text-slate-500">📍 {inq.propertyAddress || 'Wakad, Pune'}</p>
                    </div>
                  </div>
                  <div>{getStatusBadge(inq.status)}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-1">Your Message:</span>
                  <p className="leading-relaxed">{inq.message}</p>
                </div>

                {inq.ownerResponse && (
                  <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950">
                    <span className="font-bold text-emerald-900 block mb-1">Owner's Reply:</span>
                    <p className="leading-relaxed">{inq.ownerResponse}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Sent: {new Date(inq.createdAt).toLocaleDateString()} at {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {inq.moveInDate && <span>Move-in: {inq.moveInDate}</span>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Visits List */
        visits.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Scheduled Visits</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Schedule property viewings directly on the listing page to visit rooms in person.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((vis) => (
              <div
                key={vis.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{vis.propertyName}</h4>
                    <p className="text-xs text-slate-500">📍 {vis.propertyAddress}</p>
                  </div>
                  <div>{getStatusBadge(vis.status)}</div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-3 rounded-xl text-xs font-semibold text-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-700">
                    <Calendar className="w-4 h-4" />
                    <span>Date: {vis.visitDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-4 h-4" />
                    <span>Time: {vis.visitTimeSlot}</span>
                  </div>
                  {vis.ownerPhone && (
                    <div className="flex items-center gap-1.5 text-slate-600 ml-auto">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Host: {vis.ownerName} ({vis.ownerPhone})</span>
                    </div>
                  )}
                </div>

                {vis.ownerRemarks && (
                  <div className="text-xs text-slate-600 bg-slate-100 p-2.5 rounded-lg">
                    <strong>Host Note:</strong> {vis.ownerRemarks}
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
