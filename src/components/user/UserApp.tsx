import React, { useState, useEffect, useCallback } from 'react';
import { Property, SearchFilters } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { LocationSearchInput } from '../common/LocationSearchInput.tsx';
import { GoogleMapWrapper } from '../common/GoogleMapWrapper.tsx';
import { PropertyCard } from './PropertyCard.tsx';
import { PropertyDetailModal } from './PropertyDetailModal.tsx';
import { InquiryModal } from './InquiryModal.tsx';
import { VisitScheduleModal } from './VisitScheduleModal.tsx';
import { UserInquiriesView } from './UserInquiriesView.tsx';
import { UserSavedView } from './UserSavedView.tsx';
import { ReportModal } from './ReportModal.tsx';
import {
  Search,
  SlidersHorizontal,
  Map as MapIcon,
  List,
  MapPin,
  RefreshCw,
  Loader2,
  Heart,
  MessageSquare,
  X,
  ArrowRight,
} from 'lucide-react';

interface UserAppProps {
  initialTab?: 'search' | 'saved' | 'inquiries';
}

export const UserApp: React.FC<UserAppProps> = ({ initialTab = 'search' }) => {
  const { user, navigateTo } = useAuth();
  const [activeTab, setActiveTab] = useState<'search' | 'saved' | 'inquiries'>(initialTab);
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');

  // Search State - Default to Wakad, Pune workflow
  const [selectedLocation, setSelectedLocation] = useState<{
    formattedAddress: string;
    locality: string;
    city: string;
    latitude: number;
    longitude: number;
  }>({
    formattedAddress: 'Wakad, Pune, Maharashtra, India',
    locality: 'Wakad',
    city: 'Pune',
    latitude: 18.5987,
    longitude: 73.7634,
  });

  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');
  const [selectedFurnishing, setSelectedFurnishing] = useState<string>('ALL');
  const [selectedTenantType, setSelectedTenantType] = useState<string>('ALL');
  const [minRent, setMinRent] = useState<number>(5000);
  const [maxRent, setMaxRent] = useState<number>(55000);
  const [sortBy, setSortBy] = useState<'distance' | 'price_asc' | 'price_desc' | 'newest'>('distance');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Selected Property for Details
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedPropertyForInquiry, setSelectedPropertyForInquiry] = useState<Property | null>(null);
  const [selectedPropertyForVisit, setSelectedPropertyForVisit] = useState<Property | null>(null);
  const [selectedPropertyForReport, setSelectedPropertyForReport] = useState<Property | null>(null);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());

  // Execute Backend Search
  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: SearchFilters = {
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        radiusKm,
        locality: selectedLocation.locality,
        city: selectedLocation.city,
        minRent,
        maxRent,
        propertyType: 'ALL',
        roomType: selectedRoomType as any,
        furnishingStatus: selectedFurnishing as any,
        tenantType: selectedTenantType as any,
        sortBy,
      };

      const res = await api.searchProperties(filters);
      setProperties(res.properties);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Failed to fetch properties', err);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedLocation.latitude,
    selectedLocation.longitude,
    selectedLocation.locality,
    selectedLocation.city,
    radiusKm,
    selectedRoomType,
    selectedFurnishing,
    selectedTenantType,
    minRent,
    maxRent,
    sortBy,
  ]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Load Saved property IDs for heart badges
  const loadSavedIds = async () => {
    if (!user) return;
    try {
      const res = await api.getSavedProperties();
      setSavedPropertyIds(new Set(res.savedProperties.map((p) => p.id)));
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    loadSavedIds();
  }, [user]);

  const handleToggleSave = async (propertyId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user) {
      navigateTo('USER_LOGIN');
      return;
    }
    try {
      const res = await api.toggleSaveProperty(propertyId);
      setSavedPropertyIds((prev) => {
        const next = new Set(prev);
        if (res.isSaved) next.add(propertyId);
        else next.delete(propertyId);
        return next;
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenInquiry = (prop: Property) => {
    if (!user) {
      navigateTo('USER_LOGIN');
      return;
    }
    setSelectedPropertyForInquiry(prop);
  };

  const handleOpenVisit = (prop: Property) => {
    if (!user) {
      navigateTo('USER_LOGIN');
      return;
    }
    setSelectedPropertyForVisit(prop);
  };

  const activeFiltersCount =
    (selectedRoomType !== 'ALL' ? 1 : 0) +
    (selectedFurnishing !== 'ALL' ? 1 : 0) +
    (selectedTenantType !== 'ALL' ? 1 : 0) +
    (minRent > 5000 || maxRent < 55000 ? 1 : 0) +
    (radiusKm !== 10 ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedRoomType('ALL');
    setSelectedFurnishing('ALL');
    setSelectedTenantType('ALL');
    setMinRent(5000);
    setMaxRent(55000);
    setRadiusKm(10);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sub Navigation Bar in White & Grey */}
      <div className="bg-white border-b border-slate-200/80 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2.5">
            <button
              id="user-tab-search"
              onClick={() => setActiveTab('search')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Properties</span>
            </button>

            <button
              id="user-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Saved Wishlist ({savedPropertyIds.size})</span>
            </button>

            <button
              id="user-tab-inquiries"
              onClick={() => setActiveTab('inquiries')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Inquiries & Visits</span>
            </button>
          </div>

          {activeTab === 'search' && (
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/60">
              <button
                id="view-split-btn"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Split View (List + Map)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
              <button
                id="view-list-btn"
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                id="view-map-btn"
                onClick={() => setViewMode('map')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-white shadow-2xs text-slate-900' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Map View"
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'saved' ? (
          <UserSavedView
            onSelectProperty={(p) => setSelectedProperty(p)}
            onExplore={() => setActiveTab('search')}
          />
        ) : activeTab === 'inquiries' ? (
          <UserInquiriesView />
        ) : (
          /* Search & Discovery Workflow */
          <div className="space-y-4">
            {/* Search Header Bar in White & Grey */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex flex-col lg:flex-row items-center gap-3">
                {/* Location Search Input */}
                <div className="flex-1 w-full">
                  <LocationSearchInput
                    initialValue={`${selectedLocation.locality}, ${selectedLocation.city}`}
                    onSelectLocation={(loc) => {
                      setSelectedLocation(loc);
                    }}
                    placeholder="Search locality in Pune (e.g. Wakad, Hinjawadi, Baner)..."
                  />
                </div>

                {/* Filter Trigger Button */}
                <div className="flex items-center gap-2 w-full lg:w-auto">
                  <button
                    id="open-filters-drawer-btn"
                    onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
                    className={`flex-1 lg:flex-none px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      activeFiltersCount > 0
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-white text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  <select
                    id="sort-by-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    aria-label="Sort properties by"
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="distance">Nearest First (Distance)</option>
                    <option value="price_asc">Rent: Low to High</option>
                    <option value="price_desc">Rent: High to Low</option>
                    <option value="newest">Newly Listed</option>
                  </select>

                  <button
                    id="refresh-search-btn"
                    onClick={fetchProperties}
                    disabled={isLoading}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    title="Refresh results"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Quick Preset Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Popular:</span>
                {[
                  { label: 'All Types', val: 'ALL' },
                  { label: '1 BHK', val: '1BHK' },
                  { label: '2 BHK', val: '2BHK' },
                  { label: '1 RK / Room', val: '1RK' },
                  { label: 'Single Room (PG)', val: 'SINGLE_ROOM' },
                  { label: 'Shared Bed (PG)', val: 'SHARED_BED' },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setSelectedRoomType(item.val)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      selectedRoomType === item.val
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Drawer */}
            {isFilterDrawerOpen && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                    <span>Filter Room Results</span>
                  </h3>
                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                      >
                        Reset All
                      </button>
                    )}
                    <button
                      onClick={() => setIsFilterDrawerOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  {/* Furnishing */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Furnishing Status
                    </label>
                    <select
                      value={selectedFurnishing}
                      onChange={(e) => setSelectedFurnishing(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                    >
                      <option value="ALL">Any Furnishing</option>
                      <option value="FULLY_FURNISHED">Fully Furnished</option>
                      <option value="SEMI_FURNISHED">Semi-Furnished</option>
                      <option value="UNFURNISHED">Unfurnished</option>
                    </select>
                  </div>

                  {/* Tenant Preference */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Preferred Tenant
                    </label>
                    <select
                      value={selectedTenantType}
                      onChange={(e) => setSelectedTenantType(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 font-medium text-slate-900 focus:outline-none focus:border-slate-400"
                    >
                      <option value="ALL">Anyone Welcome</option>
                      <option value="BACHELORS_MALE">Bachelors (Male)</option>
                      <option value="BACHELORS_FEMALE">Bachelors (Female)</option>
                      <option value="FAMILY">Family Preferred</option>
                      <option value="STUDENTS">Students Only</option>
                    </select>
                  </div>

                  {/* Search Radius */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Search Distance: <span className="font-bold text-slate-900">{radiusKm} km</span>
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>1 km</span>
                      <span>15 km</span>
                      <span>30 km</span>
                    </div>
                  </div>

                  {/* Monthly Rent Range */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">
                      Max Monthly Rent: <span className="font-bold text-slate-900">₹{maxRent.toLocaleString('en-IN')}</span>
                    </label>
                    <input
                      type="range"
                      min={5000}
                      max={75000}
                      step={1000}
                      value={maxRent}
                      onChange={(e) => setMaxRent(Number(e.target.value))}
                      className="w-full accent-slate-900 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>₹5k</span>
                      <span>₹40k</span>
                      <span>₹75k</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Overview Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-700" />
                <span>
                  Showing <strong className="text-slate-900">{properties.length}</strong> available properties in{' '}
                  <strong className="text-slate-900">{selectedLocation.locality}</strong> (within {radiusKm} km)
                </span>
              </div>

              {isLoading && (
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>

            {/* Layout Views */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Property List Column */}
                <div className="lg:col-span-6 space-y-4 overflow-y-auto max-h-[calc(100vh-16rem)] pr-1">
                  {properties.length === 0 && !isLoading ? (
                    <div className="bg-white rounded-2xl p-10 border border-slate-200/80 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                        <Search className="w-6 h-6" />
                      </div>
                      <h4 className="text-base font-bold text-slate-900">No matching rooms found</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try expanding your search radius or selecting 'All Types' to explore other listings in Pune.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {properties.map((prop) => (
                        <PropertyCard
                          key={prop.id}
                          property={prop}
                          onSelect={(p) => setSelectedProperty(p)}
                          onToggleSave={handleToggleSave}
                          isSaved={savedPropertyIds.has(prop.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Google Map Column */}
                <div className="lg:col-span-6 sticky top-36 h-[calc(100vh-16rem)] bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  <GoogleMapWrapper
                    center={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                    zoom={13}
                    properties={properties}
                    selectedPropertyId={selectedProperty?.id}
                    onSelectProperty={(p) => setSelectedProperty(p)}
                    radiusKm={radiusKm}
                  />
                </div>
              </div>
            )}

            {viewMode === 'list' && (
              <div className="space-y-4">
                {properties.length === 0 && !isLoading ? (
                  <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
                      <Search className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-slate-900">No properties match your filter</h4>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {properties.map((prop) => (
                      <PropertyCard
                        key={prop.id}
                        property={prop}
                        onSelect={(p) => setSelectedProperty(p)}
                        onToggleSave={handleToggleSave}
                        isSaved={savedPropertyIds.has(prop.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === 'map' && (
              <div className="w-full h-[calc(100vh-16rem)] bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                <GoogleMapWrapper
                  center={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                  zoom={13}
                  properties={properties}
                  selectedPropertyId={selectedProperty?.id}
                  onSelectProperty={(p) => setSelectedProperty(p)}
                  radiusKm={radiusKm}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onInquire={() => handleOpenInquiry(selectedProperty)}
          onScheduleVisit={() => handleOpenVisit(selectedProperty)}
          onReport={() => setSelectedPropertyForReport(selectedProperty)}
          isSaved={savedPropertyIds.has(selectedProperty.id)}
          onToggleSave={() => handleToggleSave(selectedProperty.id)}
        />
      )}

      {/* Inquiry Modal */}
      {selectedPropertyForInquiry && (
        <InquiryModal
          property={selectedPropertyForInquiry}
          onClose={() => setSelectedPropertyForInquiry(null)}
          onSuccess={() => setSelectedPropertyForInquiry(null)}
        />
      )}

      {/* Visit Schedule Modal */}
      {selectedPropertyForVisit && (
        <VisitScheduleModal
          property={selectedPropertyForVisit}
          onClose={() => setSelectedPropertyForVisit(null)}
          onSuccess={() => setSelectedPropertyForVisit(null)}
        />
      )}

      {/* Report Listing Modal */}
      {selectedPropertyForReport && (
        <ReportModal
          property={selectedPropertyForReport}
          onClose={() => setSelectedPropertyForReport(null)}
        />
      )}
    </div>
  );
};
