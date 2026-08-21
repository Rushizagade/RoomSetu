import React, { useState } from 'react';
import { Property } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { X, AlertTriangle, Loader2 } from 'lucide-react';

interface ReportModalProps {
  property: Property | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ property, onClose }) => {
  if (!property) return null;

  const { showToast } = useNotifications();
  const [reason, setReason] = useState('INCORRECT_LOCATION');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.reportProperty(property.id, reason, description);
      showToast('Report Submitted', 'Our moderation team will review this listing.', 'success');
      onClose();
    } catch (err: any) {
      showToast('Failed to report', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-base text-slate-900">Report Listing</h3>
          </div>
          <button id="close-report-modal-btn" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-500">
            Help maintain RoomSetu's high-quality direct-owner community by flagging discrepancies.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Report</label>
            <select
              id="report-reason-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
            >
              <option value="INCORRECT_LOCATION">Incorrect Google Map Location / Pin</option>
              <option value="BROKER_DISGUISED">Broker / Agent posing as Direct Owner</option>
              <option value="FAKE_PRICING">Fake Rent or Hidden Brokerage Demanded</option>
              <option value="MISLEADING_PHOTOS">Misleading / Inaccurate Photos</option>
              <option value="ALREADY_RENTED">Already Rented Out</option>
              <option value="OTHER">Other Issue</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Details</label>
            <textarea
              id="report-description-textarea"
              rows={3}
              required
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
            />
          </div>

          <button
            id="submit-report-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            <span>Submit Report for Moderation</span>
          </button>
        </form>
      </div>
    </div>
  );
};
