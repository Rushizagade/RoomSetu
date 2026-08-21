import React from 'react';
import { Property } from '../../types/index.ts';
import {
  Heart,
  MapPin,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onToggleSave?: (propertyId: string, e: React.MouseEvent) => void;
  isSaved?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  onToggleSave,
  isSaved = false,
}) => {
  const coverImage =
    property.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80';

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={() => onSelect(property)}
      className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={property.propertyName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
        />

        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-300" />
              <span>Direct Owner</span>
            </span>
            <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
              {property.roomType}
            </span>
          </div>

          {/* Bookmark Heart */}
          <button
            id={`bookmark-btn-${property.id}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave?.(property.id, e);
            }}
            className={`pointer-events-auto p-2 rounded-full backdrop-blur-md shadow-2xs transition-all cursor-pointer ${
              isSaved
                ? 'bg-slate-900 text-white'
                : 'bg-white/90 text-slate-700 hover:bg-white hover:text-slate-900'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Image Info */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white pointer-events-none">
          <div>
            <div className="text-lg font-bold tracking-tight">
              ₹{property.monthlyRent.toLocaleString('en-IN')}
              <span className="text-xs font-normal text-slate-300"> / mo</span>
            </div>
            <div className="text-[10px] text-slate-300 font-medium">
              Deposit: ₹{property.securityDeposit.toLocaleString('en-IN')}
            </div>
          </div>

          {property.distanceKm !== undefined && (
            <span className="bg-white/90 backdrop-blur-xs text-slate-900 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs">
              {property.distanceKm} km away
            </span>
          )}
        </div>
      </div>

      {/* Body Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm line-clamp-1 group-hover:text-slate-700 transition-colors">
            {property.propertyName}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{property.locality}, {property.city}</span>
          </div>

          {/* Key Specs Pills */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[11px] text-slate-600">
            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
              {property.furnishingStatus.replace('_', ' ')}
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
              {property.area} sq.ft
            </span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
              {property.bedrooms} Bed · {property.bathrooms} Bath
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-600">
            <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center border border-slate-200">
              {property.ownerName ? property.ownerName[0] : 'O'}
            </div>
            <span className="font-medium text-slate-700 text-xs truncate max-w-[120px]">
              {property.ownerName || 'Verified Host'}
            </span>
          </div>

          <span className="font-semibold text-slate-900 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
            <span>View Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
