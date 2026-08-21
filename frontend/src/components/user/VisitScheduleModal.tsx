import React, { useState } from 'react';
import { Property } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useNotifications } from '../../context/NotificationContext.tsx';
import { X, Calendar, Loader2, CheckCircle2 } from 'lucide-react';

interface VisitScheduleModalProps {
  property: Property | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VisitScheduleModal: React.FC<VisitScheduleModalProps> = ({
  property,
  onClose,
  onSuccess,
}) => {
  if (!property) return null;

  const { showToast } = useNotifications();
  const [visitDate, setVisitDate] = useState('2026-08-25');
  const [visitTimeSlot, setVisitTimeSlot] = useState('11:00 AM - 12:00 PM');
  const [note, setNote] = useState('Looking forward to visiting the property with my family.');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const slots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
    '05:00 PM - 06:00 PM',
    '06:00 PM - 07:00 PM',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.requestVisit({
        propertyId: property.id,
        visitDate,
        visitTimeSlot,
        note,
      });
      setIsSubmitted(true);
      showToast('Visit Requested', `The owner will review and confirm your slot.`, 'success');
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1500);
    } catch (err: any) {
      showToast('Failed to request visit', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900">Schedule Property Visit</h3>
            <p className="text-xs text-slate-500">Book an in-person viewing with {property.ownerName || 'the owner'}</p>
          </div>
          <button id="close-visit-modal-btn" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center mx-auto border border-slate-200">
              <CheckCircle2 className="w-6 h-6 text-slate-700" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Visit Request Sent</h4>
            <p className="text-xs text-slate-500">
              The owner will confirm or suggest a convenient time. You will receive an in-app notification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Visit Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  id="visit-date-picker"
                  type="date"
                  required
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Time Slot</label>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setVisitTimeSlot(slot)}
                    className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all text-center cursor-pointer ${
                      visitTimeSlot === slot
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Note for Owner (Optional)</label>
              <input
                id="visit-notes-input"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Coming with family for inspection"
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 focus:outline-none"
              />
            </div>

            <button
              id="submit-visit-request-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              <span>Confirm Visit Request</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
