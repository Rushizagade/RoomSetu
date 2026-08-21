import React, { useState, useEffect } from 'react';
import { Property, PropertyReport, AuditLog } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { GoogleMapWrapper } from '../common/GoogleMapWrapper.tsx';
import {
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Users,
  Building2,
  Activity,
  MapPin,
  RefreshCw,
  Loader2,
  Check,
  X,
} from 'lucide-react';

export const AdminApp: React.FC = () => {
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState<'queue' | 'all-properties' | 'users' | 'reports' | 'logs'>('queue');
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    totalOwners: 0,
    activeProperties: 0,
    pendingProperties: 0,
    totalInquiries: 0,
  });
  const [pendingQueue, setPendingQueue] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [reports, setReports] = useState<PropertyReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Rejection modal
  const [rejectPropId, setRejectPropId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Incomplete or inaccurate Google Maps location pin');

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, allPropsRes, usersRes, ownersRes, reportsRes, logsRes] =
        await Promise.all([
          api.getAdminDashboard(),
          api.getAdminProperties(),
          api.getAdminUsers(),
          api.getAdminOwners(),
          api.getAdminReports(),
          api.getAdminAuditLogs(),
        ]);

      setMetrics(dashRes.metrics);
      setPendingQueue(dashRes.pendingQueue || []);
      setAllProperties(allPropsRes.properties || []);
      setUsers(usersRes.users || []);
      setOwners(ownersRes.owners || []);
      setReports(reportsRes.reports || []);
      setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.approveProperty(id);
      showToast('Property Approved & Published', 'The listing is now discoverable on the map in Pune.', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast('Approval failed', err.message, 'warning');
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectPropId) return;
    try {
      await api.rejectProperty(rejectPropId, rejectReason);
      showToast('Property Rejected', 'Feedback sent to owner.', 'info');
      setRejectPropId(null);
      loadAdminData();
    } catch (err: any) {
      showToast('Rejection failed', err.message, 'warning');
    }
  };

  const handleToggleAccountStatus = async (type: 'user' | 'owner', id: string, current: string) => {
    const next = current === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.setAccountStatus(type, id, next);
      showToast('Account Updated', `Status changed to ${next}`, 'info');
      loadAdminData();
    } catch (err: any) {
      showToast('Failed to update account', err.message, 'warning');
    }
  };

  const handleModerateReport = async (reportId: string, status: string) => {
    try {
      await api.moderateReport(reportId, status, 'Resolved by moderation admin team');
      showToast('Report Status Updated', '', 'info');
      loadAdminData();
    } catch (err: any) {
      showToast('Failed', err.message, 'warning');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 text-slate-900 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
              Admin & Moderation
            </span>
            <span className="text-xs text-slate-500">RoomSetu Trust & Safety</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Moderation & Approval Hub</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Review landlord listing submissions, verify Google Maps geolocations, moderate complaints, and monitor 0% brokerage operations.
          </p>
        </div>

        <button
          id="admin-refresh-btn"
          onClick={loadAdminData}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Pending Verification</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{pendingQueue.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Active Verified</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.activeProperties}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Registered Renters</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.totalUsers}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Property Owners</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{metrics.totalOwners}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 block">Reports / Flags</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{reports.length}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60 overflow-x-auto max-w-3xl">
        <button
          id="admin-tab-queue"
          onClick={() => setActiveTab('queue')}
          className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'queue'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Queue ({pendingQueue.length})</span>
        </button>

        <button
          id="admin-tab-all-properties"
          onClick={() => setActiveTab('all-properties')}
          className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'all-properties'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Properties ({allProperties.length})</span>
        </button>

        <button
          id="admin-tab-users"
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Accounts ({users.length + owners.length})</span>
        </button>

        <button
          id="admin-tab-reports"
          onClick={() => setActiveTab('reports')}
          className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Reports ({reports.length})</span>
        </button>

        <button
          id="admin-tab-logs"
          onClick={() => setActiveTab('logs')}
          className={`py-2 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'logs'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* Main Tab Views */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-slate-700" />
          <span className="text-xs">Loading admin dashboard...</span>
        </div>
      ) : activeTab === 'queue' ? (
        /* PENDING APPROVAL QUEUE */
        pendingQueue.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Verification Queue Clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              All submitted landlord listings have been moderated and published to the live user discovery map.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingQueue.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                      Pending Moderation
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{prop.propertyName}</h3>
                    <p className="text-xs text-slate-500">
                      Owner: <strong>{prop.ownerName}</strong> ({prop.ownerPhone}) · {prop.locality}, {prop.city}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`reject-btn-${prop.id}`}
                      onClick={() => setRejectPropId(prop.id)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      id={`approve-btn-${prop.id}`}
                      onClick={() => handleApprove(prop.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Publish</span>
                    </button>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Photos & Specs */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {prop.images?.map((img, i) => (
                        <div key={i} className="aspect-4/3 rounded-lg overflow-hidden border border-slate-200">
                          <img src={img.url} alt="prop" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium block">Monthly Rent</span>
                        <span className="font-bold text-slate-900">₹{prop.monthlyRent.toLocaleString('en-IN')}/mo</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Deposit</span>
                        <span className="font-bold text-slate-900">₹{prop.securityDeposit.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium block">Type & Area</span>
                        <span className="font-bold text-slate-900">{prop.roomType} · {prop.area} sq.ft</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {prop.description}
                    </p>
                  </div>

                  {/* Right: Google Maps Coordinates & Pin Verification */}
                  <div className="lg:col-span-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-700" />
                        <span>Coordinates Inspection</span>
                      </span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        {prop.latitude.toFixed(4)}, {prop.longitude.toFixed(4)}
                      </span>
                    </div>

                    <GoogleMapWrapper
                      center={{ lat: prop.latitude, lng: prop.longitude }}
                      zoom={15}
                      properties={[prop]}
                      selectedPropertyId={prop.id}
                      height="200px"
                    />

                    <div className="text-[11px] text-slate-500">
                      <strong>Address:</strong> {prop.formattedAddress || `${prop.address}, ${prop.locality}, ${prop.city}`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'all-properties' ? (
        /* ALL PROPERTIES TABLE */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Property</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Rent / Deposit</th>
                <th className="p-3.5">Owner</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allProperties.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80">
                  <td className="p-3.5 font-semibold text-slate-900">{p.propertyName}</td>
                  <td className="p-3.5">{p.locality}, {p.city}</td>
                  <td className="p-3.5 font-semibold text-slate-900">
                    ₹{p.monthlyRent.toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 block font-normal">Dep: ₹{p.securityDeposit.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="p-3.5">{p.ownerName}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                        p.listingStatus === 'ACTIVE'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : p.listingStatus === 'PENDING_APPROVAL'
                          ? 'bg-slate-100 text-slate-700 border-slate-300'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.listingStatus}
                    </span>
                  </td>
                  <td className="p-3.5">
                    {p.listingStatus === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => handleApprove(p.id)}
                        className="text-slate-900 hover:text-black font-semibold underline cursor-pointer"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="text-slate-400">Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : activeTab === 'users' ? (
        /* ACCOUNTS & USERS */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Renters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Renters / Users ({users.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{u.name}</span>
                    <span className="text-slate-400 block font-mono">{u.phone}</span>
                  </div>
                  <button
                    onClick={() => handleToggleAccountStatus('user', u.id, u.status)}
                    className={`px-2.5 py-1 rounded-md font-semibold text-[10px] transition-colors cursor-pointer border ${
                      u.status === 'ACTIVE'
                        ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                        : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {u.status}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Property Owners */}
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 text-sm">Property Owners ({owners.length})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {owners.map((o) => (
                <div key={o.id} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">{o.name}</span>
                    <span className="text-slate-400 block font-mono">{o.phone} · ⭐ {o.rating || 4.9}</span>
                  </div>
                  <button
                    onClick={() => handleToggleAccountStatus('owner', o.id, o.status)}
                    className={`px-2.5 py-1 rounded-md font-semibold text-[10px] transition-colors cursor-pointer border ${
                      o.status === 'ACTIVE'
                        ? 'bg-white text-slate-900 border-slate-300 hover:bg-slate-100'
                        : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {o.status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : activeTab === 'reports' ? (
        /* REPORTS */
        reports.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Reports Filed</h3>
            <p className="text-xs text-slate-500">All properties meet community quality standards.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-4">
                <div>
                  <span className="bg-slate-100 text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-slate-200 uppercase">
                    {rep.reason}
                  </span>
                  <h4 className="font-semibold text-slate-900 text-sm mt-1">{rep.propertyName}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">"{rep.description}"</p>
                </div>
                <button
                  onClick={() => handleModerateReport(rep.id, 'RESOLVED')}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  Mark Resolved
                </button>
              </div>
            ))}
          </div>
        )
      ) : (
        /* AUDIT LOGS */
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-semibold text-slate-900 text-sm">
            Audit Trail
          </div>
          <div className="divide-y divide-slate-100 font-mono text-xs max-h-96 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 flex items-center justify-between text-slate-700">
                <div>
                  <span className="text-slate-900 font-semibold">[{log.action}]</span>{' '}
                  <span>{log.details ? JSON.stringify(log.details) : 'Action performed'}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectPropId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setRejectPropId(null)} />
          <form onSubmit={handleReject} className="relative w-full max-w-md bg-white rounded-2xl p-5 shadow-xl border border-slate-200 space-y-4 z-10">
            <h3 className="font-bold text-base text-slate-900">Reject Property Submission</h3>
            <p className="text-xs text-slate-500">Provide constructive feedback so the landlord can correct and re-submit.</p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Rejection</label>
              <textarea
                rows={3}
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectPropId(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
