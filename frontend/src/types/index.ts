export type UserRole = 'USER' | 'ROOM_OWNER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'USER';
  status: UserStatus;
  createdAt: string;
}

export interface RoomOwner {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  role: 'ROOM_OWNER';
  status: UserStatus;
  verifiedStatus: 'VERIFIED' | 'PENDING' | 'UNVERIFIED';
  rating: number;
  totalListings: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN';
  createdAt: string;
}

export type AuthUser = User | RoomOwner | AdminUser;

export type PropertyType =
  | 'APARTMENT'
  | 'INDEPENDENT_HOUSE'
  | 'PG_CO_LIVING'
  | 'PG'
  | 'VILLA'
  | 'SINGLE_ROOM'
  | string;

export type RoomType =
  | '1 RK'
  | '1 BHK'
  | '2 BHK'
  | '3 BHK'
  | '4 BHK+'
  | 'Private Room'
  | 'Studio'
  | '1RK'
  | '1BHK'
  | '2BHK'
  | '3BHK'
  | '4BHK+'
  | 'PRIVATE_ROOM'
  | 'SHARED_BED'
  | string;

export type FurnishingStatus =
  | 'FULLY_FURNISHED'
  | 'FURNISHED'
  | 'SEMI_FURNISHED'
  | 'UNFURNISHED'
  | string;

export type TenantType =
  | 'BACHELOR'
  | 'BACHELOR_MALE'
  | 'BACHELOR_FEMALE'
  | 'FAMILY'
  | 'GIRLS_ONLY'
  | 'WORKING_PROFESSIONALS'
  | 'ANY'
  | string;

export type Amenity =
  | 'WIFI'
  | 'AC'
  | 'PARKING'
  | 'PARKING_4W'
  | 'PARKING_2W'
  | 'POWER_BACKUP'
  | 'SECURITY'
  | 'SECURITY_24X7'
  | 'LIFT'
  | 'WATER_24X7'
  | 'WATER_SUPPLY_24X7'
  | 'BALCONY'
  | 'GEYSER'
  | 'WASHING_MACHINE'
  | 'REFRIGERATOR'
  | 'TV'
  | 'MODULAR_KITCHEN'
  | 'GYM'
  | 'ATTACHED_BATHROOM'
  | 'CCTV'
  | 'KITCHEN'
  | string;

export type ListingStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'REJECTED'
  | 'PAUSED'
  | 'RENTED'
  | 'ARCHIVED';

export type AvailabilityStatus =
  | 'VACANT'
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'RENTED_OUT'
  | 'UNDER_MAINTENANCE';

export interface PropertyImage {
  id: string;
  propertyId: string;
  storageKey: string;
  url: string;
  thumbnailUrl: string;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerRating?: number;
  propertyName: string;
  propertyType: PropertyType;
  roomType: RoomType;
  description: string;
  monthlyRent: number;
  securityDeposit: number;
  maintenanceCharge: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  furnishingStatus: FurnishingStatus;
  tenantTypes: TenantType[];
  amenities: Amenity[];
  address: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  pincode?: string;
  latitude: number;
  longitude: number;
  googlePlaceId?: string;
  formattedAddress: string;
  availabilityStatus: AvailabilityStatus;
  availableFrom: string;
  listingStatus: ListingStatus;
  rejectionReason?: string;
  viewsCount: number;
  inquiriesCount?: number;
  images: PropertyImage[];
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

export type InquiryStatus =
  | 'SENT'
  | 'VIEWED'
  | 'RESPONDED'
  | 'VISIT_REQUESTED'
  | 'VISIT_SCHEDULED'
  | 'CLOSED';

export interface Inquiry {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  ownerId: string;
  propertyId: string;
  propertyName?: string;
  propertyAddress?: string;
  propertyCoverImage?: string;
  propertyRent?: number;
  message: string;
  moveInDate?: string;
  tenantProfile?: string;
  status: InquiryStatus;
  ownerResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export type VisitStatus =
  | 'REQUESTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'RESCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Visit {
  id: string;
  inquiryId?: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  ownerId: string;
  ownerName?: string;
  ownerPhone?: string;
  propertyId: string;
  propertyName?: string;
  propertyAddress?: string;
  propertyCoverImage?: string;
  visitDate: string;
  visitTimeSlot: string;
  note?: string;
  status: VisitStatus;
  ownerRemarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedProperty {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  type:
    | 'PROPERTY_APPROVED'
    | 'PROPERTY_REJECTED'
    | 'NEW_INQUIRY'
    | 'INQUIRY_RESPONSE'
    | 'VISIT_REQUESTED'
    | 'VISIT_ACCEPTED'
    | 'VISIT_REJECTED'
    | 'VISIT_RESCHEDULED'
    | 'PROPERTY_REPORTED'
    | 'SYSTEM_ALERT';
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: 'PROPERTY' | 'INQUIRY' | 'VISIT' | 'REPORT';
  isRead: boolean;
  createdAt: string;
}

export type ReportReason =
  | 'INCORRECT_LOCATION'
  | 'BROKER_DISGUISED'
  | 'FAKE_PRICING'
  | 'MISLEADING_PHOTOS'
  | 'MISLEADING_INFO'
  | 'FAKE_LOCATION'
  | 'INCORRECT_RENT'
  | 'SUSPECTED_SCAM'
  | 'ALREADY_RENTED'
  | 'HARASSMENT'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface PropertyReport {
  id: string;
  propertyId: string;
  propertyName?: string;
  reporterUserId: string;
  reporterName?: string;
  reporterPhone?: string;
  reason: ReportReason;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  details: any;
  ipAddress?: string;
  timestamp: string;
  createdAt?: string;
}

export interface SearchFilters {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  query?: string;
  city?: string;
  locality?: string;
  minRent?: number;
  maxRent?: number;
  propertyType?: PropertyType | 'ALL';
  roomType?: RoomType | 'ALL';
  furnishingStatus?: FurnishingStatus | 'ALL';
  tenantType?: TenantType | 'ALL';
  amenities?: Amenity[];
  availabilityStatus?: AvailabilityStatus | 'ALL';
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResponse {
  success: boolean;
  properties: Property[];
  items?: Property[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  searchedLocation?: {
    latitude: number;
    longitude: number;
    formattedAddress: string;
  };
}

export interface LocationSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  description: string;
  latitude: number;
  longitude: number;
  city: string;
  locality: string;
  state: string;
  country: string;
}
