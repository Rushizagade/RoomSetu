import React, { useState, useEffect } from 'react';
import { Property, Inquiry, Visit } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  Building2,
  Plus,
  MessageSquare,
  Calendar,
  Clock,
  RefreshCw,
  Send,
  Loader2,
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
      showToast('Reply Sent', 'Tenant has been notified via in-app notification.', 'success');
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
      showToast(status === 'ACCEPTED' ? 'Visit Confirmed' : 'Visit Declined', '', 'info');
      loadOwnerData();
    } catch (err: any) {
      showToast('Action failed', err.message, 'warning');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Banner - White & Grey styling */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
              Landlord Portal
            </span>
            <span className="text-xs text-slate-500">0% Brokerage Commission</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Room Owner Command Center</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Manage your properties, inspect Google Maps coordinates, answer verified tenant inquiries, and confirm visits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="owner-refresh-btn"
            onClick={loadOwnerData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="owner-add-property-btn"
            onClick={onOpenAddWizard}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>List New Property</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Listings</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.totalProperties}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Active Verified</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.activeProperties}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Pending Review</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.pendingProperties}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Total Views</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.totalViews}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Inquiries</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.totalInquiries}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Scheduled Visits</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{stats.scheduledVisits}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60 max-w-md">
        <button
          id="owner-tab-properties"
          onClick={() => setActiveTab('properties')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'properties'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>My Listings ({properties.length})</span>
        </button>

        <button
          id="owner-tab-inquiries"
          onClick={() => setActiveTab('inquiries')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'inquiries'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Inquiries ({inquiries.length})</span>
        </button>

        <button
          id="owner-tab-visits"
          onClick={() => setActiveTab('visits')}
          className={`flex-1 py-2 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'visits'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Visits ({visits.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
          <span className="text-xs">Loading owner portal data...</span>
        </div>
      ) : activeTab === 'properties' ? (
        /* My Listings */
        properties.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No properties listed yet</h3>
            <p className="text-xs text-slate-500">
              List your apartment, room, or flat with 0% brokerage in Wakad or Pune and connect directly with tenants.
            </p>
            <button
              onClick={onOpenAddWizard}
              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              List Property Now
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={prop.images[0]?.thumbnailUrl || prop.images[0]?.url}
                    alt={prop.propertyName}
                    className="w-24 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{prop.propertyName}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                          prop.listingStatus === 'ACTIVE'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : prop.listingStatus === 'PENDING_APPROVAL'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {prop.listingStatus}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.formattedAddress || `${prop.locality}, ${prop.city}`}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-medium text-slate-600 mt-2">
                      <span className="text-slate-900 font-bold">
                        ₹{prop.monthlyRent.toLocaleString('en-IN')}/mo
                      </span>
                      <span>·</span>
                      <span>{prop.roomType}</span>
                      <span>·</span>
                      <span>Views: {prop.viewsCount || 0}</span>
                      <span>·</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        📍 {prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleToggleAvailability(prop.id, prop.availabilityStatus)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      prop.availabilityStatus === 'VACANT'
                        ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50'
                        : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {prop.availabilityStatus === 'VACANT' ? '● Vacant (Available)' : '○ Occupied'}
                  </button>

                  {prop.listingStatus === 'DRAFT' && (
                    <button
                      onClick={() => handleSubmitForReview(prop.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
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
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Inquiries Received Yet</h3>
            <p className="text-xs text-slate-500">
              When tenants inquire about your flat, their direct messages will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">{inq.userName || 'Prospective Tenant'}</span>
                      <span className="text-xs text-slate-400 font-mono">({inq.userPhone || '+91 91234 56780'})</span>
                    </div>
                    <p className="text-xs text-slate-500">Property: <strong>{inq.propertyName}</strong></p>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(inq.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800">
                  <span className="font-semibold block mb-1">Tenant Inquiry:</span>
                  <p>{inq.message}</p>
                  {inq.tenantProfile && (
                    <span className="text-[11px] text-slate-500 block mt-1">Profile: {inq.tenantProfile}</span>
                  )}
                </div>

                {inq.ownerReply ? (
                  <div className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-xs text-slate-900">
                    <span className="font-semibold block mb-0.5">Your Sent Reply:</span>
                    <p>{inq.ownerReply}</p>
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
                      className="flex-1 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSendReply(inq.id)}
                      disabled={isReplyingId === inq.id}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer"
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
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Visit Requests</h3>
            <p className="text-xs text-slate-500">
              When tenants book property viewing slots, they will appear here for confirmation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((vis) => (
              <div
                key={vis.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm text-slate-900">{vis.userName || 'Renter'}</h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        vis.status === 'ACCEPTED'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : vis.status === 'REJECTED'
                          ? 'bg-slate-200 text-slate-700 border-slate-300'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {vis.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">Property: {vis.propertyName}</p>
                  <div className="flex items-center gap-3 text-xs font-medium text-slate-600 mt-2">
                    <span className="flex items-center gap-1 text-slate-900">
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
                      className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Slot</span>
                    </button>

                    <button
                      onClick={() => handleVisitAction(vis.id, 'REJECTED')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer border border-slate-200"
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
