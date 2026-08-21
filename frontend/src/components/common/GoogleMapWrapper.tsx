import React, { useState, useEffect, useRef } from 'react';
import { Property } from '../../types/index.ts';
import { MapPin, Navigation, ExternalLink, Compass } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

interface GoogleMapWrapperProps {
  center: { lat: number; lng: number };
  zoom?: number;
  properties?: Property[];
  selectedPropertyId?: string | null;
  onSelectProperty?: (property: Property) => void;
  interactiveMarker?: boolean; // For Owner Add Property draggable pin
  onMarkerDragEnd?: (coords: { lat: number; lng: number }) => void;
  radiusKm?: number;
  height?: string;
  showDirectionsButton?: boolean;
  className?: string;
}

export const GoogleMapWrapper: React.FC<GoogleMapWrapperProps> = ({
  center,
  zoom = 13,
  properties = [],
  selectedPropertyId,
  onSelectProperty,
  interactiveMarker = false,
  onMarkerDragEnd,
  radiusKm,
  height = '400px',
  showDirectionsButton = false,
  className = '',
}) => {
  const [activeCenter, setActiveCenter] = useState(center);
  const [markerPos, setMarkerPos] = useState(center);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveCenter(center);
    setMarkerPos(center);
  }, [center.lat, center.lng]);

  const handleDirectionsClick = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  // If a valid Google Maps API Key is provided, render the official Google Maps JavaScript API with AdvancedMarkerElement
  if (GOOGLE_MAPS_API_KEY) {
    return (
      <div id="google-map-container" className={`relative rounded-xl overflow-hidden shadow-2xs border border-slate-200 ${className}`} style={{ height }}>
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <Map
            style={{ width: '100%', height: '100%' }}
            defaultCenter={activeCenter}
            center={activeCenter}
            defaultZoom={zoom}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            {/* Owner Drag Marker */}
            {interactiveMarker && (
              <AdvancedMarker
                position={markerPos}
                draggable={true}
                onDragEnd={(e) => {
                  if (e.latLng) {
                    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    setMarkerPos(newPos);
                    onMarkerDragEnd?.(newPos);
                  }
                }}
              >
                <div className="bg-slate-900 text-white font-semibold text-xs px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Exact Location</span>
                </div>
              </AdvancedMarker>
            )}

            {/* Properties Pins */}
            {!interactiveMarker &&
              properties.map((prop) => {
                const isSelected = selectedPropertyId === prop.id;
                const rentFormatted = `₹${(prop.monthlyRent / 1000).toFixed(prop.monthlyRent % 1000 === 0 ? 0 : 1)}k`;

                return (
                  <AdvancedMarker
                    key={prop.id}
                    position={{ lat: prop.latitude, lng: prop.longitude }}
                    onClick={() => onSelectProperty?.(prop)}
                  >
                    <div
                      className={`cursor-pointer transition-all transform hover:scale-105 px-2.5 py-1 rounded-full text-xs font-semibold shadow-2xs border flex items-center gap-1 ${
                        isSelected
                          ? 'bg-slate-900 text-white border-white ring-2 ring-slate-400 scale-105 z-30'
                          : 'bg-white text-slate-900 border-slate-300 hover:bg-slate-50 z-10'
                      }`}
                    >
                      <span>{rentFormatted}</span>
                      {prop.roomType && <span className="opacity-75 text-[10px]">· {prop.roomType}</span>}
                    </div>
                  </AdvancedMarker>
                );
              })}
          </Map>
        </APIProvider>
      </div>
    );
  }

  // High-fidelity Interactive Geospatial Canvas Map
  return (
    <div
      id="interactive-geospatial-map"
      ref={canvasRef}
      className={`relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs bg-slate-100 select-none ${className}`}
      style={{ height }}
    >
      {/* Map Surface Background Styling */}
      <div className="absolute inset-0 bg-[#eef0ee] opacity-95">
        {/* Road & River Grid Pattern */}
        <svg className="w-full h-full opacity-60 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-roads" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#ffffff" strokeWidth="6" />
              <path d="M 0 40 L 80 40" fill="none" stroke="#d8dedb" strokeWidth="2" />
              <path d="M 40 0 L 40 80" fill="none" stroke="#d8dedb" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-roads)" />
          {/* Subtle River Curve */}
          <path
            d="M -50 180 Q 200 120, 500 240 T 1200 200"
            fill="none"
            stroke="#cbd5e1"
            strokeWidth="24"
            strokeLinecap="round"
            className="opacity-70"
          />
          <path
            d="M 50 -20 Q 300 280, 800 150"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
            strokeLinecap="round"
            className="opacity-80"
          />
        </svg>
      </div>

      {/* Google Maps Integration Banner */}
      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs text-xs text-slate-700">
        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
        <span className="font-semibold text-slate-900 text-xs">Google Maps Geolocation</span>
        <span className="text-slate-300">|</span>
        <span className="font-mono text-[11px] text-slate-500">
          {activeCenter.lat.toFixed(4)}° N, {activeCenter.lng.toFixed(4)}° E
        </span>
      </div>

      {/* Radius Proximity Indicator */}
      {radiusKm && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div
            className="rounded-full border border-dashed border-slate-400 bg-slate-500/5 flex items-center justify-center transition-all duration-300"
            style={{ width: `${Math.min(320, radiusKm * 20)}px`, height: `${Math.min(320, radiusKm * 20)}px` }}
          >
            <span className="text-[10px] font-semibold text-slate-700 bg-white/90 px-2 py-0.5 rounded-full shadow-2xs border border-slate-200">
              {radiusKm} km radius
            </span>
          </div>
        </div>
      )}

      {/* Interactive Drag Marker for Room Owner "Add Property" */}
      {interactiveMarker && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-30">
          <div className="relative -top-5 flex flex-col items-center pointer-events-auto cursor-grab active:cursor-grabbing">
            <div className="bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white mb-1">
              <MapPin className="w-3 h-3 fill-white text-slate-900" />
              <span>Drag to exact entrance</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white shadow-md flex items-center justify-center border-2 border-white">
              <MapPin className="w-4 h-4 fill-white" />
            </div>
            <div className="w-2 h-2 rounded-full bg-slate-800/40 shadow-xs mt-1"></div>
          </div>
        </div>
      )}

      {/* Property Markers for User Search View */}
      {!interactiveMarker && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          {properties.map((prop) => {
            const isSelected = selectedPropertyId === prop.id;
            const rentK = Math.round(prop.monthlyRent / 1000);

            // Compute relative offset on canvas based on coordinates delta from center
            const dLat = (prop.latitude - activeCenter.lat) * 2200;
            const dLng = (prop.longitude - activeCenter.lng) * 2200;

            const topPercent = Math.max(15, Math.min(80, 50 - dLat));
            const leftPercent = Math.max(12, Math.min(88, 50 + dLng));

            return (
              <div
                key={prop.id}
                style={{ top: `${topPercent}%`, left: `${leftPercent}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              >
                <button
                  id={`map-marker-${prop.id}`}
                  onClick={() => onSelectProperty?.(prop)}
                  className={`group transition-all duration-200 transform hover:scale-105 flex items-center gap-1 px-2.5 py-1 rounded-full shadow-2xs text-xs font-semibold cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border border-white ring-2 ring-slate-400 scale-105 z-40'
                      : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-400 hover:bg-slate-50 z-20'
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? 'fill-white' : 'text-slate-600'}`} />
                  <span>₹{rentK}k</span>
                  <span className="text-[10px] opacity-75 font-normal">/mo</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-2.5 right-2.5 z-30 flex items-center gap-2">
        <button
          id="recenter-map-btn"
          onClick={() => setActiveCenter(center)}
          title="Recenter location"
          className="bg-white hover:bg-slate-50 text-slate-700 p-2 rounded-lg border border-slate-200 shadow-2xs text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Compass className="w-3.5 h-3.5 text-slate-700" />
          <span className="hidden sm:inline">Recenter</span>
        </button>

        {showDirectionsButton && (
          <button
            id="google-maps-directions-btn"
            onClick={() => handleDirectionsClick(activeCenter.lat, activeCenter.lng)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg shadow-2xs text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </button>
        )}
      </div>
    </div>
  );
};
