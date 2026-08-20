import React, { useState } from 'react';
import { Property } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { X, MessageSquare, Calendar, UserCheck, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

interface InquiryModalProps {
  property: Property | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({ property, onClose, onSuccess }) => {
  if (!property) return null;

  const { showToast } = useNotifications();
  const [message, setMessage] = useState(
    `Hello ${property.ownerName || 'Owner'}, I am interested in renting your ${property.roomType} flat in ${property.locality}. Is it still available?`
  );
  const [moveInDate, setMoveInDate] = useState('2026-09-01');
  const [tenantProfile, setTenantProfile] = useState('Working professional / IT engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      await api.sendInquiry({
        propertyId: property.id,
        message,
        moveInDate,
        tenantProfile,
      });
      setIsSubmitted(true);
      showToast('Inquiry Sent!', `Your inquiry was delivered directly to ${property.ownerName || 'the owner'}.`, 'success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1800);
    } catch (err: any) {
      showToast('Failed to send inquiry', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Direct Owner Inquiry</h3>
            <p className="text-xs text-slate-500">Contact {property.ownerName || 'Landlord'} directly with 0% brokerage</p>
          </div>
          <button id="close-inquiry-modal-btn" onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">Inquiry Delivered!</h4>
            <p className="text-xs text-slate-600">
              The owner has been notified via in-app alert. You can track responses under <strong>Inquiries & Visits</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* Property Recap */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center gap-3">
              <img
                src={property.images[0]?.thumbnailUrl || property.images[0]?.url}
                alt={property.propertyName}
                className="w-14 h-12 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{property.propertyName}</h4>
                <div className="text-xs font-extrabold text-emerald-700">
                  ₹{property.monthlyRent.toLocaleString('en-IN')}/mo · {property.locality}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Message to Owner</label>
              <textarea
                id="inquiry-message-textarea"
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full p-3 bg-white rounded-xl border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Expected Move-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="inquiry-movein-date-input"
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tenant Profile</label>
                <input
                  id="inquiry-tenant-profile-input"
                  type="text"
                  value={tenantProfile}
                  onChange={(e) => setTenantProfile(e.target.value)}
                  placeholder="e.g. IT Professional, Family"
                  className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 flex items-center gap-1.5 border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>RoomSetu ensures your phone number is protected. No spam calls.</span>
            </div>

            <button
              id="submit-inquiry-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              <span>Send Direct Inquiry Now</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
