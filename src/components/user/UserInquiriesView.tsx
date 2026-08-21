import React, { useState, useEffect } from 'react';
import { Inquiry, Visit } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import {
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle,
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
        return <span className="bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">Owner Responded</span>;
      case 'SENT':
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">Sent · Pending</span>;
      case 'ACCEPTED':
        return <span className="bg-slate-900 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">Visit Confirmed</span>;
      case 'REJECTED':
        return <span className="bg-slate-200 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md">Slot Unavailable</span>;
      case 'REQUESTED':
        return <span className="bg-slate-100 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">Awaiting Owner Confirmation</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Inquiries & Visits Tracker</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track direct communications and scheduled visits with room owners</p>
        </div>

        <button
          id="refresh-inquiries-btn"
          onClick={loadData}
          className="p-2 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60 max-w-sm">
        <button
          id="tab-user-inquiries"
          onClick={() => setActiveSubTab('inquiries')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'inquiries'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Direct Inquiries ({inquiries.length})</span>
        </button>

        <button
          id="tab-user-visits"
          onClick={() => setActiveSubTab('visits')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'visits'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Visits ({visits.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
          <span className="text-xs">Loading activity...</span>
        </div>
      ) : activeSubTab === 'inquiries' ? (
        /* Inquiries List */
        inquiries.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Inquiries Sent Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When you find a room you like in Wakad or Pune, click "Contact Owner" on any listing to send a direct message.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-3"
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
                      <h4 className="text-sm font-semibold text-slate-900">{inq.propertyName || 'Room Listing'}</h4>
                      <p className="text-xs text-slate-500">Contacted: {inq.ownerName || 'Verified Host'}</p>
                    </div>
                  </div>

                  <div>{getStatusBadge(inq.status)}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-semibold text-slate-700 block">Your Message:</span>
                  <p className="text-slate-800 italic">"{inq.message}"</p>
                </div>

                {inq.ownerReply && (
                  <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <CheckCircle className="w-3.5 h-3.5 text-slate-700" />
                      <span>Owner's Direct Reply:</span>
                    </div>
                    <p className="text-slate-800">{inq.ownerReply}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Move-in Date: {inq.moveInDate || 'Flexible'}</span>
                  <span>{new Date(inq.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Visits List */
        visits.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Visits Scheduled Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You can schedule in-person room inspections directly with landlords by clicking "Schedule Visit".
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((vis) => (
              <div
                key={vis.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{vis.propertyName || 'Room Property'}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {vis.visitDate} ({vis.visitTimeSlot})
                      </span>
                    </div>
                  </div>

                  <div>{getStatusBadge(vis.status)}</div>
                </div>

                {vis.note && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                    <span className="font-semibold text-slate-700">Your note: </span>
                    <span>{vis.note}</span>
                  </div>
                )}

                {vis.ownerRemarks && (
                  <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-900">Host Instructions: </span>
                    <span className="text-slate-800">{vis.ownerRemarks}</span>
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
