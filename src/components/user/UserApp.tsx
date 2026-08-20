import React, { useState, useEffect, useCallback } from 'react';
import { Property, SearchFilters, RoomType, FurnishingStatus, TenantType } from '../../types/index.ts';
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
  Sparkles,
  MapPin,
  Compass,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  Building2,
  Heart,
  MessageSquare,
  ShieldCheck,
  Check,
  X,
  LogIn,
  UserCheck,
} from 'lucide-react';

interface UserAppProps {
  initialTab?: 'search' | 'saved' | 'inquiries';
}

export const UserApp: React.FC<UserAppProps> = ({ initialTab = 'search' }) => {
  const { user, navigateTo, openAuthModal } = useAuth();
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
      {/* Sub Navigation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto py-2.5">
            <button
              id="user-tab-search"
              onClick={() => setActiveTab('search')}
              className={`text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Find Properties</span>
            </button>

            <button
              id="user-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Saved Wishlist ({savedPropertyIds.size})</span>
            </button>

            <button
              id="user-tab-inquiries"
              onClick={() => setActiveTab('inquiries')}
              className={`text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>My Inquiries & Visits</span>
            </button>
          </div>

          {activeTab === 'search' && (
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                id="view-split-btn"
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Split View (List + Map)"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Split</span>
              </button>
              <button
                id="view-list-btn"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'list' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="List View"
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
              <button
                id="view-map-btn"
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  viewMode === 'map' ? 'bg-white shadow-xs text-emerald-700' : 'text-slate-600 hover:text-slate-900'
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
        {/* Guest Banner Notice */}
        {!user && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-emerald-950">
                  Exploring RoomSetu as Guest · 0% Brokerage
                </h4>
                <p className="text-[11px] text-emerald-800">
                  Sign in to contact verified property owners directly or schedule free room visits.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('USER_LOGIN')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                Tenant Login
              </button>
              <button
                onClick={() => navigateTo('OWNER_LOGIN')}
                className="bg-white hover:bg-slate-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Owner Login
              </button>
            </div>
          </div>
        )}

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
            {/* Search Header Bar (Google Places Autocomplete) */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
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
                    className={`flex-1 lg:flex-none px-4 py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      activeFiltersCount > 0
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
                    <span>Filters</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* Sort By Dropdown */}
                  <div className="relative">
                    <select
                      id="sort-by-select"
                      value={sortBy}
                      onChange={(e: any) => setSortBy(e.target.value)}
                      className="px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    >
                      <option value="distance">📍 Nearest First</option>
                      <option value="price_asc">💰 Rent: Low to High</option>
                      <option value="price_desc">💎 Rent: High to Low</option>
                      <option value="newest">✨ Newly Listed</option>
                    </select>
                  </div>

                  <button
                    id="refresh-search-btn"
                    onClick={fetchProperties}
                    disabled={isLoading}
                    title="Refresh results"
                    className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Quick Room Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase mr-1 shrink-0">
                  Room Type:
                </span>
                {['ALL', '1 RK', '1 BHK', '2 BHK', '3 BHK', 'Private Room', 'Studio'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedRoomType(type)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all shrink-0 cursor-pointer ${
                      selectedRoomType === type
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Expandable Advanced Filters Tray */}
              {isFilterDrawerOpen && (
                <div className="pt-4 mt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
                  {/* Search Radius */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Proximity Radius</span>
                      <span className="text-emerald-700 font-extrabold">{radiusKm} km</span>
                    </div>
                    <input
                      id="filter-radius-slider"
                      type="range"
                      min="2"
                      max="30"
                      step="1"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>2 km</span>
                      <span>15 km</span>
                      <span>30 km</span>
                    </div>
                  </div>

                  {/* Monthly Rent Range */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>Max Monthly Rent</span>
                      <span className="text-emerald-700 font-extrabold">₹{maxRent.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      id="filter-rent-slider"
                      type="range"
                      min="5000"
                      max="75000"
                      step="2000"
                      value={maxRent}
                      onChange={(e) => setMaxRent(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                      <span>₹5k</span>
                      <span>₹40k</span>
                      <span>₹75k</span>
                    </div>
                  </div>

                  {/* Furnishing Status */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Furnishing</label>
                    <select
                      id="filter-furnishing-select"
                      value={selectedFurnishing}
                      onChange={(e) => setSelectedFurnishing(e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      <option value="ALL">All Furnishings</option>
                      <option value="FULLY_FURNISHED">Fully Furnished</option>
                      <option value="SEMI_FURNISHED">Semi Furnished</option>
                      <option value="UNFURNISHED">Unfurnished</option>
                    </select>
                  </div>

                  {/* Preferred Tenants */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Tenants</label>
                    <select
                      id="filter-tenant-select"
                      value={selectedTenantType}
                      onChange={(e) => setSelectedTenantType(e.target.value)}
                      className="w-full p-2 bg-white rounded-lg border border-slate-300 text-xs font-semibold"
                    >
                      <option value="ALL">Any Tenant</option>
                      <option value="BACHELOR">Bachelors (Men / Women)</option>
                      <option value="FAMILY">Family Only</option>
                      <option value="GIRLS_ONLY">Girls Only</option>
                      <option value="WORKING_PROFESSIONALS">Working Professionals</option>
                    </select>
                  </div>

                  {/* Reset Filter Button */}
                  <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                    <button
                      id="clear-all-filters-btn"
                      type="button"
                      onClick={clearAllFilters}
                      className="text-xs font-bold text-slate-500 hover:text-rose-600 underline cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Status Bar */}
            <div className="flex items-center justify-between text-xs text-slate-600 px-1">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-sm">{totalCount} Active Verified Properties</span>
                <span>around</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  📍 {selectedLocation.locality || selectedLocation.city} ({radiusKm} km radius)
                </span>
              </div>

              {isLoading && (
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Searching active properties...</span>
                </span>
              )}
            </div>

            {/* Layout: Split View (List + Interactive Map) */}
            {viewMode === 'split' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Properties List */}
                <div className="lg:col-span-7 space-y-4">
                  {properties.length === 0 && !isLoading ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                      <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-base font-bold text-slate-800">No properties found in this radius</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        Try expanding your proximity radius slider to 15km - 20km or clearing filter constraints.
                      </p>
                      <button
                        onClick={() => {
                          setRadiusKm(20);
                          clearAllFilters();
                        }}
                        className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200"
                      >
                        Expand Search Radius to 20 km
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

                {/* Right Column: Sticky Google Map with interactive Markers */}
                <div className="lg:col-span-5 sticky top-36">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <MapIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Interactive Map & Markers</span>
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Click pins to preview room
                      </span>
                    </div>

                    <GoogleMapWrapper
                      center={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                      zoom={13}
                      properties={properties}
                      selectedPropertyId={selectedProperty?.id}
                      onSelectProperty={(p) => setSelectedProperty(p)}
                      radiusKm={radiusKm}
                      height="540px"
                      showDirectionsButton={true}
                    />
                  </div>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              /* List Only View */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : (
              /* Fullscreen Map Only View */
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <GoogleMapWrapper
                  center={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                  zoom={14}
                  properties={properties}
                  selectedPropertyId={selectedProperty?.id}
                  onSelectProperty={(p) => setSelectedProperty(p)}
                  radiusKm={radiusKm}
                  height="650px"
                  showDirectionsButton={true}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onOpenInquiry={handleOpenInquiry}
        onOpenVisit={handleOpenVisit}
        onToggleSave={handleToggleSave}
        isSaved={selectedProperty ? savedPropertyIds.has(selectedProperty.id) : false}
        onReport={(p) => setSelectedPropertyForReport(p)}
      />

      <InquiryModal
        property={selectedPropertyForInquiry}
        onClose={() => setSelectedPropertyForInquiry(null)}
      />

      <VisitScheduleModal
        property={selectedPropertyForVisit}
        onClose={() => setSelectedPropertyForVisit(null)}
      />

      <ReportModal
        property={selectedPropertyForReport}
        onClose={() => setSelectedPropertyForReport(null)}
      />
    </div>
  );
};
