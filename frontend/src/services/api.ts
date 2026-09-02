import {
  AuthUser,
  Property,
  SearchFilters,
  SearchResponse,
  Inquiry,
  Visit,
  NotificationItem,
  PropertyReport,
  AuditLog,
  LocationSuggestion,
} from '../types/index.ts';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('roomsetu_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  // Guard against non-JSON responses (e.g. HTML error pages)
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error(
      `Server returned an unexpected response (${response.status}). ` +
      `Please check that the backend API is running and accessible.`
    );
  }

  const data = await response.json();

  if (!response.ok || data.success === false) {
    const errorMsg = data?.error?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  sendOtp: (phone: string, role: 'USER' | 'ROOM_OWNER') =>
    request<{ success: boolean; message: string; devOtp?: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    }),

  verifyOtp: (phone: string, role: 'USER' | 'ROOM_OWNER', code: string, name?: string) =>
    request<{ success: boolean; token: string; user: AuthUser }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, role, code, name }),
    }),

  adminLogin: (email: string, password: string) =>
    request<{ success: boolean; token: string; user: AuthUser }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  getMe: () => request<{ success: boolean; user: AuthUser }>('/auth/me'),

  demoSwitch: (targetRole: 'USER' | 'ROOM_OWNER' | 'ADMIN') =>
    request<{ success: boolean; token: string; user: AuthUser }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ targetRole }),
    }),

  getAutocompleteSuggestions: (q: string) =>
    request<{ success: boolean; suggestions: LocationSuggestion[] }>(
      `/locations/autocomplete?q=${encodeURIComponent(q)}`
    ),

  reverseGeocode: (lat: number, lng: number) =>
    request<{
      success: boolean;
      formattedAddress: string;
      locality: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }>(`/locations/reverse-geocode?lat=${lat}&lng=${lng}`),

  searchProperties: (filters: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters.latitude !== undefined) params.append('lat', filters.latitude.toString());
    if (filters.longitude !== undefined) params.append('lng', filters.longitude.toString());
    if (filters.radiusKm !== undefined) params.append('radius', filters.radiusKm.toString());
    if (filters.query) params.append('q', filters.query);
    if (filters.city) params.append('city', filters.city);
    if (filters.locality) params.append('locality', filters.locality);
    if (filters.minRent) params.append('minRent', filters.minRent.toString());
    if (filters.maxRent) params.append('maxRent', filters.maxRent.toString());
    if (filters.propertyType && filters.propertyType !== 'ALL')
      params.append('propertyType', filters.propertyType);
    if (filters.roomType && filters.roomType !== 'ALL') params.append('roomType', filters.roomType);
    if (filters.furnishingStatus && filters.furnishingStatus !== 'ALL')
      params.append('furnishingStatus', filters.furnishingStatus);
    if (filters.tenantType && filters.tenantType !== 'ALL')
      params.append('tenantType', filters.tenantType);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.amenities && filters.amenities.length > 0) {
      filters.amenities.forEach((a) => params.append('amenities', a));
    }
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    return request<SearchResponse>(`/properties/search?${params.toString()}`);
  },

  getPropertyDetails: (id: string) =>
    request<{ success: boolean; property: Property }>(`/properties/${id}`),

  reportProperty: (id: string, reason: string, description: string) =>
    request<{ success: boolean; message: string }>(`/properties/${id}/reports`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    }),

  getOwnerProperties: () =>
    request<{ success: boolean; properties: Property[] }>('/owner/properties'),

  getOwnerDashboard: () =>
    request<{
      success: boolean;
      stats: {
        totalProperties: number;
        activeProperties: number;
        pendingProperties: number;
        totalViews: number;
        totalInquiries: number;
        scheduledVisits: number;
      };
      recentInquiries: Inquiry[];
      upcomingVisits: Visit[];
    }>('/owner/dashboard'),

  createProperty: (data: Partial<Property> & { submitForReview?: boolean }) =>
    request<{ success: boolean; message: string; property: Property }>('/owner/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProperty: (id: string, data: Partial<Property>) =>
    request<{ success: boolean; message: string; property: Property }>(`/owner/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  submitPropertyForReview: (id: string) =>
    request<{ success: boolean; message: string; property: Property }>(
      `/owner/properties/${id}/submit`,
      { method: 'POST' }
    ),

  togglePropertyStatus: (id: string, data: { availabilityStatus?: string; listingStatus?: string }) =>
    request<{ success: boolean; property: Property }>(`/owner/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  uploadImage: (dataUrl: string, filename?: string) =>
    request<{ success: boolean; image: any }>('/uploads', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename }),
    }),

  getInquiries: () => request<{ success: boolean; inquiries: Inquiry[] }>('/inquiries'),

  sendInquiry: (data: {
    propertyId: string;
    message: string;
    moveInDate?: string;
    tenantProfile?: string;
  }) =>
    request<{ success: boolean; message: string; inquiry: Inquiry }>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  respondToInquiry: (id: string, responseText: string, status?: string) =>
    request<{ success: boolean; inquiry: Inquiry }>(`/inquiries/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ responseText, status }),
    }),

  getVisits: () => request<{ success: boolean; visits: Visit[] }>('/visits'),

  requestVisit: (data: {
    propertyId: string;
    visitDate: string;
    visitTimeSlot: string;
    note?: string;
  }) =>
    request<{ success: boolean; message: string; visit: Visit }>('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVisitStatus: (
    id: string,
    data: { status: string; ownerRemarks?: string; newVisitDate?: string; newVisitTimeSlot?: string }
  ) =>
    request<{ success: boolean; visit: Visit }>(`/visits/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getSavedProperties: () =>
    request<{ success: boolean; savedProperties: Property[] }>('/saved-properties'),

  toggleSaveProperty: (propertyId: string) =>
    request<{ success: boolean; isSaved: boolean; message: string }>('/saved-properties/toggle', {
      method: 'POST',
      body: JSON.stringify({ propertyId }),
    }),

  getNotifications: () =>
    request<{ success: boolean; notifications: NotificationItem[]; unreadCount: number }>(
      '/notifications'
    ),

  markNotificationsRead: (notificationId?: string) =>
    request<{ success: boolean }>('/notifications/mark-read', {
      method: 'PATCH',
      body: JSON.stringify({ notificationId }),
    }),

  getAdminDashboard: () =>
    request<{
      success: boolean;
      metrics: any;
      pendingQueue: Property[];
      recentReports: PropertyReport[];
      recentAuditLogs: AuditLog[];
    }>('/admin/dashboard'),

  getAdminPendingProperties: () =>
    request<{ success: boolean; pendingProperties: Property[] }>('/admin/properties/pending'),

  approveProperty: (id: string) =>
    request<{ success: boolean; message: string; property: Property }>(
      `/admin/properties/${id}/approve`,
      { method: 'POST' }
    ),

  rejectProperty: (id: string, reason: string) =>
    request<{ success: boolean; message: string; property: Property }>(
      `/admin/properties/${id}/reject`,
      { method: 'POST', body: JSON.stringify({ reason }) }
    ),

  getAdminProperties: (status?: string) =>
    request<{ success: boolean; properties: Property[] }>(
      `/admin/properties${status ? `?status=${status}` : ''}`
    ),

  setAdminPropertyStatus: (id: string, listingStatus: string, reason?: string) =>
    request<{ success: boolean; property: Property }>(`/admin/properties/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ listingStatus, reason }),
    }),

  getAdminUsers: () => request<{ success: boolean; users: any[] }>('/admin/users'),

  getAdminOwners: () => request<{ success: boolean; owners: any[] }>('/admin/owners'),

  setAccountStatus: (type: 'user' | 'owner', id: string, status: 'ACTIVE' | 'SUSPENDED') =>
    request<{ success: boolean }>(`/admin/accounts/${type}/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getAdminReports: () => request<{ success: boolean; reports: PropertyReport[] }>('/admin/reports'),

  moderateReport: (id: string, status: string, adminNotes?: string) =>
    request<{ success: boolean; report: PropertyReport }>(`/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    }),

  getAdminAuditLogs: () => request<{ success: boolean; logs: AuditLog[] }>('/admin/audit-logs'),
};
