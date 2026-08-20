import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, Check, Loader2 } from 'lucide-react';
import { api } from '../../services/api.ts';
import { LocationSuggestion } from '../../types/index.ts';

interface LocationSearchInputProps {
  initialValue?: string;
  onSelectLocation: (loc: {
    formattedAddress: string;
    locality: string;
    city: string;
    latitude: number;
    longitude: number;
    placeId?: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  initialValue = 'Wakad, Pune',
  onSelectLocation,
  placeholder = 'Search locality, landmark, or city (e.g. Wakad, Pune)...',
  className = '',
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced Autocomplete Search
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.getAutocompleteSuggestions(query);
        setSuggestions(res.suggestions);
      } catch (err) {
        console.error('Location autocomplete failed', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: LocationSuggestion) => {
    setQuery(`${item.mainText}, ${item.city}`);
    setIsOpen(false);
    onSelectLocation({
      formattedAddress: item.description,
      locality: item.locality,
      city: item.city,
      latitude: item.latitude,
      longitude: item.longitude,
      placeId: item.placeId,
    });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try {
          const res = await api.reverseGeocode(lat, lng);
          setQuery(res.formattedAddress);
          onSelectLocation({
            formattedAddress: res.formattedAddress,
            locality: res.locality,
            city: res.city,
            latitude: lat,
            longitude: lng,
          });
        } catch {
          // Fallback to Wakad coordinates if reverse geocode fails
          setQuery('Wakad, Pune, Maharashtra');
          onSelectLocation({
            formattedAddress: 'Wakad, Pune, Maharashtra 411057',
            locality: 'Wakad',
            city: 'Pune',
            latitude: 18.5987,
            longitude: 73.7634,
          });
        } finally {
          setIsLocating(false);
          setIsOpen(false);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setIsLocating(false);
        // Default to Wakad, Pune
        setQuery('Wakad, Pune');
        onSelectLocation({
          formattedAddress: 'Wakad, Pune, Maharashtra 411057',
          locality: 'Wakad',
          city: 'Pune',
          latitude: 18.5987,
          longitude: 73.7634,
        });
      },
      { timeout: 8000 }
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600 pointer-events-none" />
        <input
          id="location-search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-white pl-11 pr-24 py-3 rounded-xl border border-slate-300 text-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent shadow-sm placeholder:text-slate-400"
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {query && (
            <button
              id="clear-location-query-btn"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            id="gps-location-btn"
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            title="Use current GPS location"
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Near Me</span>
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {/* Quick Hubs */}
          <div className="p-2.5 bg-slate-50">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5 px-1">
              Popular Rental Hubs
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Wakad, Pune', lat: 18.5987, lng: 73.7634, locality: 'Wakad', city: 'Pune' },
                { name: 'Hinjawadi, Pune', lat: 18.5793, lng: 73.7389, locality: 'Hinjawadi', city: 'Pune' },
                { name: 'Baner, Pune', lat: 18.5596, lng: 73.7868, locality: 'Baner', city: 'Pune' },
                { name: 'Koramangala, BLR', lat: 12.9352, lng: 77.6245, locality: 'Koramangala', city: 'Bengaluru' },
                { name: 'Andheri West, MUM', lat: 19.1363, lng: 72.8277, locality: 'Andheri West', city: 'Mumbai' },
              ].map((hub) => (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => {
                    setQuery(hub.name);
                    setIsOpen(false);
                    onSelectLocation({
                      formattedAddress: `${hub.name}, India`,
                      locality: hub.locality,
                      city: hub.city,
                      latitude: hub.lat,
                      longitude: hub.lng,
                    });
                  }}
                  className="text-xs bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 shadow-xs transition-colors font-medium cursor-pointer"
                >
                  📍 {hub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Place Suggestions */}
          {isLoading ? (
            <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Searching Google Places...</span>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              {suggestions.map((item) => (
                <button
                  key={item.placeId}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-slate-50 flex items-start gap-3 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{item.mainText}</div>
                    <div className="text-xs text-slate-500">{item.secondaryText}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            query.length >= 2 && (
              <div className="p-3 text-center text-xs text-slate-500">
                Hit enter to search properties around "{query}"
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
