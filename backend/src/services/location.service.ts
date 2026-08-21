import { LocationSuggestion } from '../types/index.ts';

const KNOWN_PLACES: LocationSuggestion[] = [
  { placeId: 'loc_wakad_pune', mainText: 'Wakad', secondaryText: 'Pune, Maharashtra, India', description: 'Wakad, Pune, Maharashtra, India', latitude: 18.5987, longitude: 73.7634, locality: 'Wakad', city: 'Pune', state: 'Maharashtra', country: 'India' },
  { placeId: 'loc_hinjawadi_pune', mainText: 'Hinjawadi IT Park', secondaryText: 'Pune, Maharashtra, India', description: 'Hinjawadi, Pune, Maharashtra, India', latitude: 18.5793, longitude: 73.7389, locality: 'Hinjawadi', city: 'Pune', state: 'Maharashtra', country: 'India' },
  { placeId: 'loc_baner_pune', mainText: 'Baner', secondaryText: 'Pune, Maharashtra, India', description: 'Baner, Pune, Maharashtra, India', latitude: 18.5596, longitude: 73.7868, locality: 'Baner', city: 'Pune', state: 'Maharashtra', country: 'India' },
  { placeId: 'loc_kothrud_pune', mainText: 'Kothrud', secondaryText: 'Pune, Maharashtra, India', description: 'Kothrud, Pune, Maharashtra, India', latitude: 18.5074, longitude: 73.8077, locality: 'Kothrud', city: 'Pune', state: 'Maharashtra', country: 'India' },
  { placeId: 'loc_viman_nagar_pune', mainText: 'Viman Nagar', secondaryText: 'Pune, Maharashtra, India', description: 'Viman Nagar, Pune, Maharashtra, India', latitude: 18.5679, longitude: 73.9143, locality: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', country: 'India' },
  { placeId: 'loc_koramangala_blr', mainText: 'Koramangala', secondaryText: 'Bengaluru, Karnataka, India', description: 'Koramangala, Bengaluru, Karnataka, India', latitude: 12.9352, longitude: 77.6245, locality: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  { placeId: 'loc_indiranagar_blr', mainText: 'Indiranagar', secondaryText: 'Bengaluru, Karnataka, India', description: 'Indiranagar, Bengaluru, Karnataka, India', latitude: 12.9784, longitude: 77.6408, locality: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', country: 'India' },
  { placeId: 'loc_andheri_mum', mainText: 'Andheri West', secondaryText: 'Mumbai, Maharashtra, India', description: 'Andheri West, Mumbai, Maharashtra, India', latitude: 19.1363, longitude: 72.8277, locality: 'Andheri West', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { placeId: 'loc_powai_mum', mainText: 'Powai', secondaryText: 'Mumbai, Maharashtra, India', description: 'Powai, Mumbai, Maharashtra, India', latitude: 19.1176, longitude: 72.9060, locality: 'Powai', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { placeId: 'loc_cyber_city_ggn', mainText: 'DLF Cyber City', secondaryText: 'Gurugram, Haryana, India', description: 'DLF Cyber City, Gurugram, Haryana, India', latitude: 28.4950, longitude: 77.0895, locality: 'Cyber City', city: 'Gurugram', state: 'Haryana', country: 'India' },
];

export const locationService = {
  autocomplete(query: string): LocationSuggestion[] {
    const q = query.toLowerCase().trim();
    if (!q) return KNOWN_PLACES.slice(0, 6);

    return KNOWN_PLACES.filter(
      (p) =>
        p.mainText.toLowerCase().includes(q) ||
        p.secondaryText.toLowerCase().includes(q) ||
        p.locality.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  },

  reverseGeocode(lat: number, lng: number) {
    // Best-effort locality match from known coordinates
    const nearest = KNOWN_PLACES.reduce<LocationSuggestion | null>((best, place) => {
      const dLat = place.latitude - lat;
      const dLng = place.longitude - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (!best) return place;
      const bLat = best.latitude - lat;
      const bLng = best.longitude - lng;
      const bDist = Math.sqrt(bLat * bLat + bLng * bLng);
      return dist < bDist ? place : best;
    }, null);

    if (nearest) {
      return {
        formattedAddress: `${nearest.locality}, ${nearest.city}, ${nearest.state}, India`,
        locality: nearest.locality,
        city: nearest.city,
        state: nearest.state,
        postalCode: '411057',
        country: 'India',
      };
    }

    return {
      formattedAddress: `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      locality: 'Selected Area',
      city: 'Pune',
      state: 'Maharashtra',
      postalCode: '411057',
      country: 'India',
    };
  },
};
