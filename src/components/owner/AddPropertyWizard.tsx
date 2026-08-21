import React, { useState } from 'react';
import { Property, RoomType, PropertyType, FurnishingStatus, TenantType, Amenity } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { LocationSearchInput } from '../common/LocationSearchInput.tsx';
import { GoogleMapWrapper } from '../common/GoogleMapWrapper.tsx';
import { useNotifications } from '../../context/NotificationContext.tsx';
import {
  X,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  ShieldCheck,
  Compass,
  Loader2,
  Trash2,
  Check,
} from 'lucide-react';

interface AddPropertyWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (property: Property) => void;
}

export const AddPropertyWizard: React.FC<AddPropertyWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const { showToast } = useNotifications();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [propertyName, setPropertyName] = useState('2 BHK Luxury Flat near Datta Mandir');
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [roomType, setRoomType] = useState<RoomType>('2 BHK');
  const [furnishingStatus, setFurnishingStatus] = useState<FurnishingStatus>('FULLY_FURNISHED');
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(2);
  const [area, setArea] = useState(980);
  const [monthlyRent, setMonthlyRent] = useState(24000);
  const [securityDeposit, setSecurityDeposit] = useState(50000);
  const [maintenanceCharge, setMaintenanceCharge] = useState(1500);
  const [description, setDescription] = useState(
    'Spacious, well-ventilated 2 BHK flat on 4th floor with modular kitchen, private balcony, covered 4-wheeler parking, 24/7 water supply and security. Prime location in Wakad close to Mumbai-Pune highway and Hinjawadi IT hub.'
  );
  const [tenantTypes, setTenantTypes] = useState<TenantType[]>(['FAMILY', 'WORKING_PROFESSIONALS']);

  // Google Maps Location State
  const [locationState, setLocationState] = useState<{
    address: string;
    formattedAddress: string;
    locality: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    googlePlaceId: string;
    isLocationConfirmed: boolean;
  }>({
    address: 'Datta Mandir Road, Shankar Kalat Nagar, Wakad',
    formattedAddress: 'Datta Mandir Rd, Shankar Kalat Nagar, Wakad, Pimpri-Chinchwad, Pune, Maharashtra 411057',
    locality: 'Wakad',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    latitude: 18.5987,
    longitude: 73.7634,
    googlePlaceId: 'ChIJc-wakad_pune_geo_01',
    isLocationConfirmed: true,
  });

  // Amenities
  const allAmenities: Amenity[] = [
    'WIFI',
    'AC',
    'PARKING_4W',
    'PARKING_2W',
    'GEYSER',
    'REFRIGERATOR',
    'WASHING_MACHINE',
    'TV',
    'POWER_BACKUP',
    'LIFT',
    'SECURITY_24X7',
    'WATER_24X7',
    'BALCONY',
    'MODULAR_KITCHEN',
    'GYM',
  ];
  const [selectedAmenities, setSelectedAmenities] = useState<Amenity[]>([
    'WIFI',
    'AC',
    'PARKING_4W',
    'PARKING_2W',
    'GEYSER',
    'REFRIGERATOR',
    'POWER_BACKUP',
    'LIFT',
    'SECURITY_24X7',
    'BALCONY',
    'MODULAR_KITCHEN',
  ]);

  // Images State
  const [uploadedImages, setUploadedImages] = useState<
    Array<{ url: string; thumbnailUrl: string; isCover: boolean }>
  >([
    {
      url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
      isCover: true,
    },
    {
      url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&auto=format&fit=crop&q=80',
      isCover: false,
    },
    {
      url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&auto=format&fit=crop&q=80',
      thumbnailUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=80',
      isCover: false,
    },
  ]);

  const handleAmenityToggle = (amenity: Amenity) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  const handleTenantToggle = (tenant: TenantType) => {
    if (tenantTypes.includes(tenant)) {
      setTenantTypes(tenantTypes.filter((t) => t !== tenant));
    } else {
      setTenantTypes([...tenantTypes, tenant]);
    }
  };

  // Google Places Selection Handler
  const handleLocationSelect = async (loc: {
    formattedAddress: string;
    locality: string;
    city: string;
    latitude: number;
    longitude: number;
    placeId?: string;
  }) => {
    setLocationState((prev) => ({
      ...prev,
      formattedAddress: loc.formattedAddress,
      address: loc.formattedAddress.split(',')[0],
      locality: loc.locality || 'Wakad',
      city: loc.city || 'Pune',
      latitude: loc.latitude,
      longitude: loc.longitude,
      googlePlaceId: loc.placeId || `place_${Date.now()}`,
      isLocationConfirmed: false,
    }));
  };

  // Reverse geocode when pin is dragged
  const handleMarkerDrag = async (coords: { lat: number; lng: number }) => {
    try {
      const res = await api.reverseGeocode(coords.lat, coords.lng);
      setLocationState((prev) => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
        formattedAddress: res.formattedAddress,
        locality: res.locality || prev.locality,
        city: res.city || prev.city,
        isLocationConfirmed: false,
      }));
    } catch {
      setLocationState((prev) => ({
        ...prev,
        latitude: coords.lat,
        longitude: coords.lng,
        isLocationConfirmed: false,
      }));
    }
  };

  // Handle Photo Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        try {
          const uploadRes = await api.uploadImage(base64, file.name);
          setUploadedImages((prev) => [
            ...prev,
            {
              url: uploadRes.image.url,
              thumbnailUrl: uploadRes.image.thumbnailUrl,
              isCover: prev.length === 0,
            },
          ]);
        } catch {
          setUploadedImages((prev) => [
            ...prev,
            { url: base64, thumbnailUrl: base64, isCover: prev.length === 0 },
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Final Submit
  const handleFinalSubmit = async (submitForReview: boolean = true) => {
    setIsLoading(true);
    try {
      const payload: Partial<Property> & { submitForReview?: boolean } = {
        propertyName,
        propertyType,
        roomType,
        furnishingStatus,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        area: Number(area),
        monthlyRent: Number(monthlyRent),
        securityDeposit: Number(securityDeposit),
        maintenanceCharge: Number(maintenanceCharge),
        description,
        address: locationState.address,
        locality: locationState.locality,
        city: locationState.city,
        state: locationState.state,
        pincode: locationState.pincode,
        latitude: locationState.latitude,
        longitude: locationState.longitude,
        googlePlaceId: locationState.googlePlaceId,
        formattedAddress: locationState.formattedAddress,
        amenities: selectedAmenities,
        tenantTypes,
        images: uploadedImages.map((img, idx) => ({
          id: `img_${Date.now()}_${idx}`,
          propertyId: '',
          storageKey: `key_${idx}.jpg`,
          url: img.url,
          thumbnailUrl: img.thumbnailUrl,
          sortOrder: idx,
          isCover: img.isCover,
          createdAt: new Date().toISOString(),
        })),
        submitForReview,
      };

      const res = await api.createProperty(payload);
      showToast(
        submitForReview ? 'Property Submitted for Review' : 'Draft Saved',
        `Your listing "${propertyName}" in ${locationState.locality} is registered.`,
        'success'
      );
      onSuccess(res.property);
      onClose();
    } catch (err: any) {
      showToast('Error saving property', err.message, 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-10 max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">List Your Property Free</h2>
            <p className="text-xs text-slate-500">
              0% Brokerage · Direct connection with verified tenants
            </p>
          </div>

          <button
            id="close-add-wizard-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
          <div
            className={`flex items-center gap-2 ${
              currentStep >= 1 ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 1 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </span>
            <span>1. Basic Info</span>
          </div>

          <div className="h-px w-8 bg-slate-300" />

          <div
            className={`flex items-center gap-2 ${
              currentStep >= 2 ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 2 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span>2. Google Map & Location</span>
          </div>

          <div className="h-px w-8 bg-slate-300" />

          <div
            className={`flex items-center gap-2 ${
              currentStep >= 3 ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentStep >= 3 ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span>3. Photos & Amenities</span>
          </div>
        </div>

        {/* Form Body Steps */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* STEP 1: Basic Specifications & Rent */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Title / Listing Headline
                </label>
                <input
                  id="prop-title-input"
                  type="text"
                  required
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  placeholder="e.g. 2 BHK Semi-Furnished Flat in Wakad"
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room / BHK Type</label>
                  <select
                    id="prop-room-type-select"
                    value={roomType}
                    onChange={(e: any) => setRoomType(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                  >
                    <option value="1 RK">1 RK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="2 BHK">2 BHK</option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="Private Room">Private Room</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
                  <select
                    id="prop-category-select"
                    value={propertyType}
                    onChange={(e: any) => setPropertyType(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                  >
                    <option value="APARTMENT">Apartment / Flat</option>
                    <option value="INDEPENDENT_HOUSE">Independent House</option>
                    <option value="VILLA">Villa</option>
                    <option value="PG">PG / Co-Living</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Furnishing</label>
                  <select
                    id="prop-furnish-select"
                    value={furnishingStatus}
                    onChange={(e: any) => setFurnishingStatus(e.target.value)}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                  >
                    <option value="FULLY_FURNISHED">Fully Furnished</option>
                    <option value="SEMI_FURNISHED">Semi Furnished</option>
                    <option value="UNFURNISHED">Unfurnished</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Rent (₹)
                  </label>
                  <input
                    id="prop-rent-input"
                    type="number"
                    required
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Security Deposit (₹)
                  </label>
                  <input
                    id="prop-deposit-input"
                    type="number"
                    required
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Maintenance Charge (₹/mo)
                  </label>
                  <input
                    id="prop-maintenance-input"
                    type="number"
                    value={maintenanceCharge}
                    onChange={(e) => setMaintenanceCharge(Number(e.target.value))}
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Specs & Description */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Carpet Area (sq.ft)</label>
                  <input
                    id="prop-area-input"
                    type="number"
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
                  <input
                    id="prop-bedrooms-input"
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
                  <input
                    id="prop-bathrooms-input"
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                    className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Tenants</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'FAMILY', label: 'Families' },
                    { key: 'BACHELOR', label: 'Bachelors' },
                    { key: 'GIRLS_ONLY', label: 'Girls Only' },
                    { key: 'WORKING_PROFESSIONALS', label: 'Working Professionals' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => handleTenantToggle(t.key as any)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                        tenantTypes.includes(t.key as any)
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  id="prop-desc-textarea"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:border-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: GOOGLE MAPS LOCATION WORKFLOW */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs text-slate-800 flex items-start gap-2.5">
                <Compass className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Google Maps & Places Geolocation</span>
                  <span className="text-slate-500">
                    Search your property address using Google Places Autocomplete, then confirm or drag the
                    pin on Google Maps to record precise coordinates for accurate tenant navigation.
                  </span>
                </div>
              </div>

              {/* Search Address in Google Maps */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  1. Search Address in Google Maps (Places Autocomplete)
                </label>
                <LocationSearchInput
                  initialValue={`${locationState.locality}, ${locationState.city}`}
                  onSelectLocation={handleLocationSelect}
                  placeholder="Type building, society, or landmark (e.g. Datta Mandir, Wakad, Pune)..."
                />
              </div>

              {/* Formatted Address Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Selected Address:</span>
                  <span className="font-semibold text-slate-900">{locationState.formattedAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Locality & City:</span>
                  <span className="font-semibold text-slate-900">{locationState.locality}, {locationState.city}</span>
                </div>
              </div>

              {/* Google Maps Marker & Pin Canvas */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-700" />
                    <span>2. Google Maps Marker (Drag to exact entrance)</span>
                  </label>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    Lat: {locationState.latitude.toFixed(5)}, Lng: {locationState.longitude.toFixed(5)}
                  </span>
                </div>

                <GoogleMapWrapper
                  center={{ lat: locationState.latitude, lng: locationState.longitude }}
                  zoom={16}
                  interactiveMarker={true}
                  onMarkerDragEnd={handleMarkerDrag}
                  height="280px"
                  showDirectionsButton={true}
                />
              </div>

              {/* 3. Confirm Location Button */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                <div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-5 h-5 ${locationState.isLocationConfirmed ? 'text-slate-100' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm">
                      {locationState.isLocationConfirmed ? 'Location Coordinates Verified' : 'Confirm Exact Location'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                    Place ID: {locationState.googlePlaceId} · {locationState.latitude.toFixed(4)}° N, {locationState.longitude.toFixed(4)}° E
                  </p>
                </div>

                <button
                  id="confirm-location-btn"
                  type="button"
                  onClick={() => {
                    setLocationState((prev) => ({ ...prev, isLocationConfirmed: true }));
                    showToast('Location Confirmed', 'Latitude, Longitude & Place ID locked for listing.', 'success');
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    locationState.isLocationConfirmed
                      ? 'bg-white text-slate-900 hover:bg-slate-100'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                >
                  {locationState.isLocationConfirmed ? '✓ Location Confirmed' : 'Confirm Location'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Amenities & Photos */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Photo Upload Area */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Property Photos ({uploadedImages.length} uploaded)
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-slate-400 transition-colors bg-slate-50">
                  <Upload className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-700">Drag & drop photos or click to upload</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Upload clear photos of the room, kitchen, and bathroom</p>
                  <input
                    id="property-images-file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="mt-2 text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300"
                  />
                </div>

                {/* Uploaded Gallery Preview */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-3">
                    {uploadedImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 group">
                        <img src={img.url} alt="prop" className="w-full h-full object-cover" />
                        {img.isCover && (
                          <span className="absolute top-1 left-1 bg-slate-900 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-slate-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities Grid */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Available Amenities ({selectedAmenities.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {allAmenities.map((amenity) => {
                    const isSelected = selectedAmenities.includes(amenity);
                    return (
                      <button
                        key={amenity}
                        type="button"
                        onClick={() => handleAmenityToggle(amenity)}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{amenity.replace(/_/g, ' ')}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              id="wizard-prev-btn"
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {currentStep < 3 ? (
              <button
                id="wizard-next-btn"
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Continue to {currentStep === 1 ? 'Location & Map' : 'Photos & Amenities'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="save-draft-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleFinalSubmit(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200"
                >
                  Save as Draft
                </button>

                <button
                  id="submit-review-btn"
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleFinalSubmit(true)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>Publish / Submit for Review</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
