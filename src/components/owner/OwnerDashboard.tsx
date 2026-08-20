import React, { useState, useEffect } from 'react';
import { Property, Inquiry, Visit } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  Building2,
  Plus,
  Eye,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Send,
  Loader2,
  ShieldCheck,
  MapPin,
  Check,
  X,
} from 'lucide-react';

interface OwnerDashboardProps {
  onOpenAddWizard: () => void;
}

export const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ onOpenAddWizard }) => {
  const { showToast } = useNotifications();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    scheduledVisits: 0,
  });
  const [activeTab, setActiveTab] = useState<'properties' | 'inquiries' | 'visits'>('properties');
  const [isLoading, setIsLoading] = useState(true);

  // Reply to inquiry state
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [isReplyingId, setIsReplyingId] = useState<string | null>(null);

  const loadOwnerData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, propRes] = await Promise.all([
        api.getOwnerDashboard(),
        api.getOwnerProperties(),
      ]);
      setStats(dashRes.stats);
      setInquiries(dashRes.recentInquiries || []);
      setVisits(dashRes.upcomingVisits || []);
      setProperties(propRes.properties || []);
    } catch (err) {
      console.error('Failed to load owner data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  const handleToggleAvailability = async (id: string, current: string) => {
    const next = current === 'VACANT' ? 'OCCUPIED' : 'VACANT';
    try {
      await api.togglePropertyStatus(id, { availabilityStatus: next });
      showToast('Status Updated', `Property marked as ${next}.`, 'info');
      loadOwnerData();
    } catch (err: any) {
      showToast('Update failed', err.message, 'warning');
    }
  };

  const handleSubmitForReview = async (id: string) => {
    try {
      await api.submitPropertyForReview(id);
      showToast('Submitted for Review', 'Admin moderation will verify within 15 minutes.', 'success');
      loadOwnerData();
    } catch (err: any) {
      showToast('Submission failed', err.message, 'warning');
    }
  };

  const handleSendReply = async (inquiryId: string) => {
    const text = replyTextMap[inquiryId];
    if (!text || !text.trim()) return;

    setIsReplyingId(inquiryId);
    try {
      await api.respondToInquiry(inquiryId, text);
      showToast('Reply Sent!', 'Tenant has been notified via instant in-app notification.', 'success');
      setReplyTextMap((prev) => ({ ...prev, [inquiryId]: '' }));
      loadOwnerData();
    } catch (err: any) {
      showToast('Failed to reply', err.message, 'warning');
    } finally {
      setIsReplyingId(null);
    }
  };

  const handleVisitAction = async (visitId: string, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.updateVisitStatus(visitId, {
        status,
        ownerRemarks: status === 'ACCEPTED' ? 'Confirmed! Looking forward to meeting you.' : 'Slot unavailable, please pick another slot.',
      });
      showToast(status === 'ACCEPTED' ? 'Visit Confirmed!' : 'Visit Declined', '', 'info');
      loadOwnerData();
    } catch (err: any) {
      showToast('Action failed', err.message, 'warning');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-500/30 text-blue-200 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-400/30">
              Direct Landlord Portal
            </span>
            <span className="text-xs text-blue-300">0% Commission</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Room Owner Command Center</h1>
          <p className="text-xs text-blue-200 mt-1 max-w-xl">
            Manage your properties, inspect Google Maps geolocations, answer verified renter inquiries, and schedule room visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="owner-refresh-btn"
            onClick={loadOwnerData}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="owner-add-property-btn"
            onClick={onOpenAddWizard}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 transition-transform transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List New Property</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Total Listings</span>
          <span className="text-2xl font-black text-slate-900">{stats.totalProperties}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 block">Active Verified</span>
          <span className="text-2xl font-black text-emerald-700">{stats.activeProperties}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-600 block">Pending Review</span>
          <span className="text-2xl font-black text-amber-700">{stats.pendingProperties}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">Total Views</span>
          <span className="text-2xl font-black text-slate-900">{stats.totalViews}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 block">Total Inquiries</span>
          <span className="text-2xl font-black text-blue-700">{stats.totalInquiries}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-indigo-600 block">Scheduled Visits</span>
          <span className="text-2xl font-black text-indigo-700">{stats.scheduledVisits}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          id="owner-tab-properties"
          onClick={() => setActiveTab('properties')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'properties'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>My Listings ({properties.length})</span>
        </button>

        <button
          id="owner-tab-inquiries"
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'inquiries'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Tenant Inquiries ({inquiries.length})</span>
        </button>

        <button
          id="owner-tab-visits"
          onClick={() => setActiveTab('visits')}
          className={`pb-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'visits'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Visit Requests ({visits.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-sm">Loading owner portal data...</span>
        </div>
      ) : activeTab === 'properties' ? (
        /* My Listings */
        properties.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4 max-w-md mx-auto">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No properties listed yet</h3>
            <p className="text-xs text-slate-500">
              List your apartment, room, or house with 0% brokerage in Wakad, Pune and connect directly with tenants.
            </p>
            <button
              onClick={onOpenAddWizard}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
            >
              List Property Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={prop.images[0]?.thumbnailUrl || prop.images[0]?.url}
                    alt={prop.propertyName}
                    className="w-24 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-slate-900">{prop.propertyName}</h3>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          prop.listingStatus === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : prop.listingStatus === 'PENDING_APPROVAL'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {prop.listingStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{prop.formattedAddress || `${prop.locality}, ${prop.city}`}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 mt-2">
                      <span className="text-emerald-800 font-extrabold">
                        ₹{prop.monthlyRent.toLocaleString('en-IN')}/mo
                      </span>
                      <span>·</span>
                      <span>{prop.roomType}</span>
                      <span>·</span>
                      <span>Views: {prop.viewsCount || 0}</span>
                      <span>·</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        📍 {prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleToggleAvailability(prop.id, prop.availabilityStatus)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      prop.availabilityStatus === 'VACANT'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {prop.availabilityStatus === 'VACANT' ? '🟢 Vacant (Available)' : '🔴 Occupied'}
                  </button>

                  {prop.listingStatus === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmitForReview(prop.id)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Submit for Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'inquiries' ? (
        /* Inquiries Management */
        inquiries.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Inquiries Received Yet</h3>
            <p className="text-xs text-slate-500">
              When tenants inquire about your Wakad flat, their direct messages will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{inq.userName || 'Prospective Tenant'}</span>
                      <span className="text-xs text-slate-400 font-mono">({inq.userPhone || '+91 91234 56780'})</span>
                    </div>
                    <p className="text-xs text-slate-500">Property: <strong>{inq.propertyName}</strong></p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800">
                  <span className="font-bold block mb-1">Tenant Inquiry:</span>
                  <p>{inq.message}</p>
                  {inq.tenantProfile && (
                    <span className="text-[11px] text-slate-500 block mt-1">Profile: {inq.tenantProfile}</span>
                  )}
                </div>

                {inq.ownerResponse ? (
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-xs text-blue-900">
                    <span className="font-bold block mb-0.5">Your Sent Reply:</span>
                    <p>{inq.ownerResponse}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Type your response (e.g. Yes, available! Please call or schedule a visit)..."
                      value={replyTextMap[inq.id] || ''}
                      onChange={(e) =>
                        setReplyTextMap({ ...replyTextMap, [inq.id]: e.target.value })
                      }
                      className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSendReply(inq.id)}
                      disabled={isReplyingId === inq.id}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      {isReplyingId === inq.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>Reply</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        /* Visits Management */
        visits.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Visit Requests</h3>
            <p className="text-xs text-slate-500">
              When tenants book property viewing slots, they will appear here for confirmation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visits.map((vis) => (
              <div
                key={vis.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{vis.userName || 'Renter'}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        vis.status === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : vis.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {vis.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Property: {vis.propertyName}</p>
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 mt-2">
                    <span className="flex items-center gap-1 text-blue-700">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{vis.visitDate}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{vis.visitTimeSlot}</span>
                    </span>
                  </div>
                  {vis.note && <p className="text-xs text-slate-500 mt-1 italic">Note: "{vis.note}"</p>}
                </div>

                {vis.status === 'REQUESTED' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVisitAction(vis.id, 'ACCEPTED')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Slot</span>
                    </button>

                    <button
                      onClick={() => handleVisitAction(vis.id, 'REJECTED')}
                      className="bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
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
