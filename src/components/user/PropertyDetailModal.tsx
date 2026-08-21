import React, { useState } from 'react';
import { Property, Amenity } from '../../types/index.ts';
import { GoogleMapWrapper } from '../common/GoogleMapWrapper.tsx';
import {
  X,
  MapPin,
  Heart,
  Share2,
  ShieldCheck,
  Calendar,
  MessageSquare,
  AlertOctagon,
  ArrowUpRight,
  Check,
} from 'lucide-react';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  onInquire?: (property: Property) => void;
  onScheduleVisit?: (property: Property) => void;
  onOpenInquiry?: (property: Property) => void;
  onOpenVisit?: (property: Property) => void;
  onToggleSave?: (propertyId: string) => void;
  isSaved?: boolean;
  onReport?: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onInquire,
  onScheduleVisit,
  onOpenInquiry,
  onOpenVisit,
  onToggleSave,
  isSaved = false,
  onReport,
}) => {
  if (!property) return null;

  const handleInquiryClick = () => {
    if (onInquire) onInquire(property);
    else if (onOpenInquiry) onOpenInquiry(property);
  };

  const handleVisitClick = () => {
    if (onScheduleVisit) onScheduleVisit(property);
    else if (onOpenVisit) onOpenVisit(property);
  };

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const images = property.images && property.images.length > 0
    ? property.images
    : [
        {
          id: 'def_1',
          propertyId: property.id,
          storageKey: 'def.jpg',
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
          sortOrder: 0,
          isCover: true,
          createdAt: '',
        },
      ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.propertyName,
        text: `Check out this 0% brokerage rental on RoomSetu: ${property.propertyName} in ${property.locality}, ${property.city}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  const getAmenityLabel = (amenity: Amenity) => {
    return amenity.replace(/_/g, ' ');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white z-20">
          <div className="flex items-center gap-2">
            <span className="bg-slate-100 text-slate-800 text-xs font-semibold px-2.5 py-0.5 rounded-md border border-slate-200">
              Verified Direct Owner
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">0% Brokerage Marketplace</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="detail-share-btn"
              onClick={handleShare}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Share property"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="detail-save-btn"
              onClick={() => onToggleSave?.(property.id)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isSaved ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Save to wishlist"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button
              id="detail-close-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Gallery */}
          <div className="space-y-2">
            <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-900">
              <img
                src={images[activeImageIdx]?.url || images[0]?.url}
                alt={property.propertyName}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full">
                {activeImageIdx + 1} / {images.length}
              </div>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-slate-900 ring-2 ring-slate-400' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.thumbnailUrl || img.url} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key Pricing Card */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  {property.roomType}
                </span>
                <span className="bg-white text-slate-800 text-xs font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                  {property.propertyType.replace('_', ' ')}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                {property.propertyName}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{property.formattedAddress || `${property.address}, ${property.locality}, ${property.city}`}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs sm:min-w-60 text-right">
              <div className="text-2xl font-bold text-slate-900">
                ₹{property.monthlyRent.toLocaleString('en-IN')}
                <span className="text-xs font-normal text-slate-500"> / mo</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Security Deposit: <strong className="text-slate-800">₹{property.securityDeposit.toLocaleString('en-IN')}</strong>
              </div>
              {property.maintenanceCharge > 0 && (
                <div className="text-xs text-slate-500">
                  Maintenance: ₹{property.maintenanceCharge.toLocaleString('en-IN')}/mo
                </div>
              )}
              <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-700 font-semibold flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                <span>0 Brokerage Commission</span>
              </div>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Carpet Area</span>
              <span className="text-sm font-bold text-slate-900">{property.area} sq.ft</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Furnishing</span>
              <span className="text-sm font-bold text-slate-900">{property.furnishingStatus.replace('_', ' ')}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Preferred Tenants</span>
              <span className="text-sm font-bold text-slate-900">{property.tenantTypes?.join(', ') || 'Any'}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[11px] text-slate-500 font-semibold block">Available From</span>
              <span className="text-sm font-bold text-slate-900">{property.availableFrom || 'Immediate'}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Property Description
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
              {property.description}
            </p>
          </div>

          {/* Amenities Grid */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Amenities & Facilities
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                  >
                    <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span>{getAmenityLabel(amenity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Real Google Maps Geolocation Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                <span>Exact Location & Map</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {property.latitude.toFixed(4)}, {property.longitude.toFixed(4)}
              </span>
            </div>

            <GoogleMapWrapper
              center={{ lat: property.latitude, lng: property.longitude }}
              zoom={15}
              properties={[property]}
              selectedPropertyId={property.id}
              height="260px"
              showDirectionsButton={true}
            />

            <div className="mt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
              <span>📍 {property.formattedAddress || `${property.address}, ${property.locality}, ${property.city}`}</span>
              <button
                type="button"
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`, '_blank')}
                className="text-slate-900 hover:underline font-semibold flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Owner Profile Card */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                {property.ownerName ? property.ownerName[0] : 'O'}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">{property.ownerName || 'Verified Owner'}</h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-700" />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  RoomSetu Verified Landlord · Rating: ⭐ {property.ownerRating || 4.9}
                </div>
                <div className="text-xs text-slate-800 font-medium mt-1">
                  📞 {property.ownerPhone || '+91 98220 12345'}
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-right text-xs text-slate-500">
              Direct connection.<br />Zero agent interference.
            </div>
          </div>

          {/* Report Button */}
          <div className="text-center pt-1">
            <button
              id="report-property-btn"
              type="button"
              onClick={() => onReport?.(property)}
              className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Report this listing if information or location is incorrect</span>
            </button>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 z-20">
          <div className="hidden sm:block">
            <span className="text-[11px] text-slate-400 block">Monthly Rent</span>
            <span className="text-lg font-bold text-slate-900">
              ₹{property.monthlyRent.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-500"> / mo</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              id="request-visit-btn"
              type="button"
              onClick={handleVisitClick}
              className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-semibold px-4 py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-600" />
              <span>Schedule Visit</span>
            </button>

            <button
              id="send-inquiry-btn"
              type="button"
              onClick={handleInquiryClick}
              className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl shadow-2xs transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Contact Owner</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
