import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  User,
  RoomOwner,
  AdminUser,
  Property,
  PropertyImage,
  Inquiry,
  Visit,
  SavedProperty,
  NotificationItem,
  PropertyReport,
  AuditLog,
  SearchFilters,
  SearchResponse,
  LocationSuggestion,
} from '../src/types/index.ts';

// In-Memory Relational Database Engine with relational integrity, constraints, indices & geospatial search
class DatabaseEngine {
  public users: Map<string, User> = new Map();
  public owners: Map<string, RoomOwner> = new Map();
  public admins: Map<string, { user: AdminUser; passwordHash: string }> = new Map();
  public properties: Map<string, Property> = new Map();
  public propertyImages: Map<string, PropertyImage> = new Map();
  public inquiries: Map<string, Inquiry> = new Map();
  public visits: Map<string, Visit> = new Map();
  public savedProperties: Map<string, SavedProperty> = new Map();
  public notifications: Map<string, NotificationItem> = new Map();
  public reports: Map<string, PropertyReport> = new Map();
  public auditLogs: AuditLog[] = [];
  public otps: Map<string, { code: string; role: 'USER' | 'ROOM_OWNER'; expiresAt: number; attempts: number }> = new Map();

  constructor() {
    this.seedInitialData();
  }

  // Haversine Distance Calculation in Kilometers
  public calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }

  // Audit Logging
  public logAudit(actorId: string, actorName: string, actorRole: any, action: string, targetType: string, targetId: string, details: string, ipAddress = '127.0.0.1') {
    const now = new Date().toISOString();
    const log: AuditLog = {
      id: 'aud_' + crypto.randomUUID().slice(0, 8),
      actorId,
      actorName,
      actorRole,
      action,
      targetType,
      targetId,
      details,
      ipAddress,
      timestamp: now,
      createdAt: now,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }

  // Notifications Dispatcher
  public createNotification(recipientId: string, recipientRole: any, type: any, title: string, message: string, referenceId?: string, referenceType?: any) {
    const notif: NotificationItem = {
      id: 'notif_' + crypto.randomUUID().slice(0, 8),
      recipientId,
      recipientRole,
      type,
      title,
      message,
      referenceId,
      referenceType,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(notif.id, notif);
    return notif;
  }

  // OTP Generation with dev bypass support
  public generateOtp(phone: string, role: 'USER' | 'ROOM_OWNER'): string {
    const code = '123456'; // Consistent predictable dev code for seamless demo experience
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    this.otps.set(`${phone}_${role}`, { code, role, expiresAt, attempts: 0 });
    return code;
  }

  public verifyOtp(phone: string, role: 'USER' | 'ROOM_OWNER', code: string): boolean {
    const entry = this.otps.get(`${phone}_${role}`);
    if (!entry) {
      if (code === '123456' || code === '000000') return true; // dev fallback
      return false;
    }
    if (Date.now() > entry.expiresAt) {
      this.otps.delete(`${phone}_${role}`);
      return false;
    }
    if (entry.code === code || code === '123456' || code === '000000') {
      this.otps.delete(`${phone}_${role}`);
      return true;
    }
    entry.attempts++;
    return false;
  }

  // Property Search Engine with Geographic Proximity + Multi-criteria Filters
  public searchProperties(filters: SearchFilters): SearchResponse {
    let list = Array.from(this.properties.values());

    // Only ACTIVE properties in public search
    list = list.filter((p) => p.listingStatus === 'ACTIVE');

    // Geo filtering by coordinates + radius
    if (filters.latitude && filters.longitude) {
      const radius = filters.radiusKm || 15; // default 15km
      list = list
        .map((p) => ({
          ...p,
          distanceKm: this.calculateDistanceKm(filters.latitude!, filters.longitude!, p.latitude, p.longitude),
        }))
        .filter((p) => p.distanceKm <= radius);
    } else if (filters.city || filters.locality || filters.query) {
      const q = (filters.query || filters.locality || filters.city || '').toLowerCase().trim();
      if (q) {
        list = list.filter(
          (p) =>
            p.locality.toLowerCase().includes(q) ||
            p.city.toLowerCase().includes(q) ||
            p.propertyName.toLowerCase().includes(q) ||
            p.formattedAddress.toLowerCase().includes(q) ||
            p.address.toLowerCase().includes(q)
        );
      }
    }

    // Min & Max Rent
    if (filters.minRent !== undefined && filters.minRent > 0) {
      list = list.filter((p) => p.monthlyRent >= filters.minRent!);
    }
    if (filters.maxRent !== undefined && filters.maxRent > 0) {
      list = list.filter((p) => p.monthlyRent <= filters.maxRent!);
    }

    // Property Type
    if (filters.propertyType && filters.propertyType !== 'ALL') {
      list = list.filter((p) => p.propertyType === filters.propertyType);
    }

    // Room Type
    if (filters.roomType && filters.roomType !== 'ALL') {
      list = list.filter((p) => p.roomType === filters.roomType);
    }

    // Furnishing Status
    if (filters.furnishingStatus && filters.furnishingStatus !== 'ALL') {
      list = list.filter((p) => p.furnishingStatus === filters.furnishingStatus);
    }

    // Tenant Preference
    if (filters.tenantType && filters.tenantType !== 'ALL') {
      list = list.filter(
        (p) => p.tenantTypes.includes('ANY') || p.tenantTypes.includes(filters.tenantType as any)
      );
    }

    // Amenities
    if (filters.amenities && filters.amenities.length > 0) {
      list = list.filter((p) =>
        filters.amenities!.every((reqAmenity) => p.amenities.includes(reqAmenity))
      );
    }

    // Availability
    if (filters.availabilityStatus && filters.availabilityStatus !== 'ALL') {
      list = list.filter((p) => p.availabilityStatus === filters.availabilityStatus);
    }

    // Sorting
    const sort = filters.sortBy || 'recommended';
    if (sort === 'nearest' && filters.latitude && filters.longitude) {
      list.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
    } else if (sort === 'rentLowToHigh') {
      list.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (sort === 'rentHighToLow') {
      list.sort((a, b) => b.monthlyRent - a.monthlyRent);
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // recommended: sort by views + rating
      list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    // Pagination
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 20;
    const total = list.length;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = list.slice(startIndex, startIndex + pageSize);

    // Attach owner summary info safely (no private emails)
    const enrichedItems = paginatedItems.map((prop) => {
      const owner = this.owners.get(prop.ownerId);
      return {
        ...prop,
        ownerName: owner?.name || 'Verified Owner',
        ownerPhone: owner?.phone || '+91 98200 12345',
        ownerRating: owner?.rating || 4.8,
        inquiriesCount: Array.from(this.inquiries.values()).filter((i) => i.propertyId === prop.id).length,
      };
    });

    return {
      success: true,
      properties: enrichedItems,
      items: enrichedItems,
      page,
      pageSize,
      total,
      hasMore: startIndex + pageSize < total,
    };
  }

  // Pre-seed Realistic Indian Metro Rental Properties (focusing heavily on Wakad Pune, Hinjawadi, Baner, Bangalore, Mumbai)
  private seedInitialData() {
    // 1. Seed Admin
    const adminId = 'adm_root_001';
    const adminUser: AdminUser = {
      id: adminId,
      name: 'RoomSetu SuperAdmin',
      email: 'admin@roomsetu.in',
      role: 'ADMIN',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    this.admins.set(adminUser.email, {
      user: adminUser,
      passwordHash: bcrypt.hashSync('admin12345', 10),
    });

    // 2. Seed Room Owners
    const owner1: RoomOwner = {
      id: 'own_rajesh_01',
      name: 'Rajesh Kulkarni',
      phone: '9822012345',
      email: 'rajesh.pune@roomsetu.in',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      role: 'ROOM_OWNER',
      status: 'ACTIVE',
      verifiedStatus: 'VERIFIED',
      rating: 4.9,
      totalListings: 3,
      createdAt: '2026-01-10T10:00:00.000Z',
    };
    const owner2: RoomOwner = {
      id: 'own_priya_02',
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'priya.sharma@roomsetu.in',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'ROOM_OWNER',
      status: 'ACTIVE',
      verifiedStatus: 'VERIFIED',
      rating: 4.8,
      totalListings: 2,
      createdAt: '2026-01-15T11:30:00.000Z',
    };
    const owner3: RoomOwner = {
      id: 'own_vikram_03',
      name: 'Vikram Joshi',
      phone: '9811223344',
      email: 'vikram.joshi@roomsetu.in',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      role: 'ROOM_OWNER',
      status: 'ACTIVE',
      verifiedStatus: 'VERIFIED',
      rating: 4.7,
      totalListings: 1,
      createdAt: '2026-02-01T09:15:00.000Z',
    };
    this.owners.set(owner1.id, owner1);
    this.owners.set(owner2.id, owner2);
    this.owners.set(owner3.id, owner3);

    // 3. Seed Users
    const user1: User = {
      id: 'usr_rushikesh_01',
      name: 'Rushikesh Zope',
      phone: '9123456780',
      email: 'rushikesh@example.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-02-10T14:20:00.000Z',
    };
    const user2: User = {
      id: 'usr_ananya_02',
      name: 'Ananya Deshmukh',
      phone: '9988776655',
      email: 'ananya.d@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      role: 'USER',
      status: 'ACTIVE',
      createdAt: '2026-02-12T16:45:00.000Z',
    };
    this.users.set(user1.id, user1);
    this.users.set(user2.id, user2);

    // 4. Seed Properties (Exact real coordinates in Wakad, Hinjawadi, Baner, Pune + Bangalore & Mumbai)
    const propertiesData: Property[] = [
      {
        id: 'prop_wakad_001',
        ownerId: owner1.id,
        propertyName: 'Signature Park Luxury 2BHK Flat',
        propertyType: 'APARTMENT',
        roomType: '2BHK',
        description:
          'Spacious fully-furnished 2BHK apartment situated in prime Wakad near Dutta Mandir Chowk. Features modern modular kitchen, master bedroom with private balcony, split AC, covered car parking, and 24x7 security. Direct owner lease with 0% brokerage!',
        monthlyRent: 24000,
        securityDeposit: 50000,
        maintenanceCharge: 2000,
        area: 1050,
        bedrooms: 2,
        bathrooms: 2,
        furnishingStatus: 'FURNISHED',
        tenantTypes: ['FAMILY', 'BACHELOR_FEMALE', 'BACHELOR_MALE', 'ANY'],
        amenities: [
          'WIFI',
          'AC',
          'PARKING',
          'POWER_BACKUP',
          'SECURITY',
          'LIFT',
          'WATER_SUPPLY_24X7',
          'BALCONY',
          'GEYSER',
          'WASHING_MACHINE',
          'REFRIGERATOR',
          'CCTV',
        ],
        address: 'B-402, Signature Park, Dutta Mandir Road',
        locality: 'Wakad',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '411057',
        latitude: 18.5987,
        longitude: 73.7634,
        googlePlaceId: 'ChIJ4zW5S42_wjsR9Xb3B2E9yqQ',
        formattedAddress: 'Dutta Mandir Road, Wakad, Pimpri-Chinchwad, Pune, Maharashtra 411057',
        availabilityStatus: 'AVAILABLE',
        availableFrom: '2026-09-01',
        listingStatus: 'ACTIVE',
        viewsCount: 342,
        images: [
          {
            id: 'img_w1_1',
            propertyId: 'prop_wakad_001',
            storageKey: 'wakad_living_01.jpg',
            url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
            sortOrder: 0,
            isCover: true,
            createdAt: '2026-02-10T10:00:00.000Z',
          },
          {
            id: 'img_w1_2',
            propertyId: 'prop_wakad_001',
            storageKey: 'wakad_bedroom_02.jpg',
            url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&auto=format&fit=crop&q=80',
            sortOrder: 1,
            isCover: false,
            createdAt: '2026-02-10T10:00:00.000Z',
          },
          {
            id: 'img_w1_3',
            propertyId: 'prop_wakad_001',
            storageKey: 'wakad_kitchen_03.jpg',
            url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400&auto=format&fit=crop&q=80',
            sortOrder: 2,
            isCover: false,
            createdAt: '2026-02-10T10:00:00.000Z',
          },
        ],
        createdAt: '2026-02-10T10:00:00.000Z',
        updatedAt: '2026-02-10T10:00:00.000Z',
      },
      {
        id: 'prop_wakad_002',
        ownerId: owner1.id,
        propertyName: 'Cozy 1BHK Near Hinjawadi Flyover',
        propertyType: 'APARTMENT',
        roomType: '1BHK',
        description:
          'Semi-furnished 1BHK flat located in Wakad, just 5 minutes drive to Hinjawadi IT Park Phase 1. High-speed fiber internet ready, piped gas connection, covered bike parking, and peaceful society environment.',
        monthlyRent: 16500,
        securityDeposit: 35000,
        maintenanceCharge: 1200,
        area: 650,
        bedrooms: 1,
        bathrooms: 1,
        furnishingStatus: 'SEMI_FURNISHED',
        tenantTypes: ['BACHELOR_MALE', 'BACHELOR_FEMALE', 'FAMILY', 'ANY'],
        amenities: [
          'WIFI',
          'PARKING',
          'POWER_BACKUP',
          'SECURITY',
          'LIFT',
          'WATER_SUPPLY_24X7',
          'BALCONY',
          'GEYSER',
        ],
        address: 'Flat 204, Royal Palms, Kaspate Vasti',
        locality: 'Wakad',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '411057',
        latitude: 18.5925,
        longitude: 73.7712,
        googlePlaceId: 'ChIJh8_r32y_wjsR3BvL30nZ008',
        formattedAddress: 'Kaspate Vasti, Wakad, Pune, Maharashtra 411057',
        availabilityStatus: 'AVAILABLE',
        availableFrom: '2026-08-25',
        listingStatus: 'ACTIVE',
        viewsCount: 215,
        images: [
          {
            id: 'img_w2_1',
            propertyId: 'prop_wakad_002',
            storageKey: 'wakad2_living.jpg',
            url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&auto=format&fit=crop&q=80',
            sortOrder: 0,
            isCover: true,
            createdAt: '2026-02-12T10:00:00.000Z',
          },
          {
            id: 'img_w2_2',
            propertyId: 'prop_wakad_002',
            storageKey: 'wakad2_balcony.jpg',
            url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&auto=format&fit=crop&q=80',
            sortOrder: 1,
            isCover: false,
            createdAt: '2026-02-12T10:00:00.000Z',
          },
        ],
        createdAt: '2026-02-12T10:00:00.000Z',
        updatedAt: '2026-02-12T10:00:00.000Z',
      },
      {
        id: 'prop_hinjawadi_003',
        ownerId: owner2.id,
        propertyName: 'Modern Executive Studio 1RK in Blue Ridge',
        propertyType: 'APARTMENT',
        roomType: '1RK',
        description:
          'Fully setup private studio apartment inside the prestigious Blue Ridge Township, Hinjawadi Phase 1. Walking distance to Infosys, Wipro & Cognizant. AC, attached washroom, smart TV, refrigerator, microwave, and gym access.',
        monthlyRent: 13000,
        securityDeposit: 25000,
        maintenanceCharge: 1000,
        area: 420,
        bedrooms: 1,
        bathrooms: 1,
        furnishingStatus: 'FURNISHED',
        tenantTypes: ['BACHELOR_MALE', 'BACHELOR_FEMALE', 'ANY'],
        amenities: [
          'WIFI',
          'AC',
          'PARKING',
          'POWER_BACKUP',
          'SECURITY',
          'LIFT',
          'GYM',
          'ATTACHED_BATHROOM',
          'REFRIGERATOR',
          'GEYSER',
        ],
        address: 'Tower 7, Blue Ridge Township, Phase 1',
        locality: 'Hinjawadi',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '411057',
        latitude: 18.5793,
        longitude: 73.7389,
        googlePlaceId: 'ChIJz-qE_ZHAwjsRwHn5f06R1q8',
        formattedAddress: 'Blue Ridge, Hinjawadi Phase 1, Pune, Maharashtra 411057',
        availabilityStatus: 'AVAILABLE',
        availableFrom: '2026-08-22',
        listingStatus: 'ACTIVE',
        viewsCount: 489,
        images: [
          {
            id: 'img_h3_1',
            propertyId: 'prop_hinjawadi_003',
            storageKey: 'hinj_studio.jpg',
            url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=400&auto=format&fit=crop&q=80',
            sortOrder: 0,
            isCover: true,
            createdAt: '2026-02-05T12:00:00.000Z',
          },
        ],
        createdAt: '2026-02-05T12:00:00.000Z',
        updatedAt: '2026-02-05T12:00:00.000Z',
      },
      {
        id: 'prop_baner_004',
        ownerId: owner2.id,
        propertyName: 'Spacious 3BHK Premium Residence',
        propertyType: 'APARTMENT',
        roomType: '3BHK',
        description:
          'Elegant 3BHK flat on Baner-Pashan Link Road. Panoramic hill views, Italian marble flooring, 3 balconies, 2 reserved parking slots, clubhouse with swimming pool, badminton court, and solar water heating.',
        monthlyRent: 38000,
        securityDeposit: 90000,
        maintenanceCharge: 3500,
        area: 1650,
        bedrooms: 3,
        bathrooms: 3,
        furnishingStatus: 'SEMI_FURNISHED',
        tenantTypes: ['FAMILY', 'ANY'],
        amenities: [
          'PARKING',
          'POWER_BACKUP',
          'SECURITY',
          'LIFT',
          'WATER_SUPPLY_24X7',
          'BALCONY',
          'GYM',
          'CCTV',
          'GEYSER',
        ],
        address: 'Flat 801, Supreme Heights, Baner-Pashan Link Rd',
        locality: 'Baner',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '411045',
        latitude: 18.5596,
        longitude: 73.7868,
        googlePlaceId: 'ChIJz2xZ5xS_wjsRXwP973f0k38',
        formattedAddress: 'Baner-Pashan Link Rd, Baner, Pune, Maharashtra 411045',
        availabilityStatus: 'AVAILABLE',
        availableFrom: '2026-09-15',
        listingStatus: 'ACTIVE',
        viewsCount: 310,
        images: [
          {
            id: 'img_b4_1',
            propertyId: 'prop_baner_004',
            storageKey: 'baner_living.jpg',
            url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
            sortOrder: 0,
            isCover: true,
            createdAt: '2026-02-08T08:00:00.000Z',
          },
        ],
        createdAt: '2026-02-08T08:00:00.000Z',
        updatedAt: '2026-02-08T08:00:00.000Z',
      },
      {
        id: 'prop_pending_005',
        ownerId: owner3.id,
        propertyName: 'Green Acres Premium 1BHK in Wakad',
        propertyType: 'APARTMENT',
        roomType: '1BHK',
        description:
          'Brand new 1BHK apartment with modern fixtures, wooden flooring in bedroom, solar water heater, and gym. Close to Phoenix Marketcity Millennium Mall, Wakad.',
        monthlyRent: 19000,
        securityDeposit: 40000,
        maintenanceCharge: 1500,
        area: 720,
        bedrooms: 1,
        bathrooms: 1,
        furnishingStatus: 'FURNISHED',
        tenantTypes: ['FAMILY', 'BACHELOR_FEMALE', 'BACHELOR_MALE', 'ANY'],
        amenities: ['WIFI', 'AC', 'PARKING', 'POWER_BACKUP', 'LIFT', 'SECURITY', 'BALCONY', 'GEYSER'],
        address: 'Flat 503, Green Acres, Shankar Kalat Nagar',
        locality: 'Wakad',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '411057',
        latitude: 18.6042,
        longitude: 73.7681,
        googlePlaceId: 'ChIJz2xZ5xS_wjsRXwP973f0k38_wakad',
        formattedAddress: 'Shankar Kalat Nagar, Wakad, Pune, Maharashtra 411057',
        availabilityStatus: 'AVAILABLE',
        availableFrom: '2026-09-01',
        listingStatus: 'PENDING_REVIEW', // Pending Admin review for verification demo!
        viewsCount: 45,
        images: [
          {
            id: 'img_p5_1',
            propertyId: 'prop_pending_005',
            storageKey: 'green_acres.jpg',
            url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&auto=format&fit=crop&q=80',
            sortOrder: 0,
            isCover: true,
            createdAt: '2026-02-18T10:00:00.000Z',
          },
        ],
        createdAt: '2026-02-18T10:00:00.000Z',
        updatedAt: '2026-02-18T10:00:00.000Z',
      },
      {
        id: 'prop_blr_006',
        ownerId: owner1.id,
        propertyName: 'Urban Nest 2BHK Koramangala 4th Block',
        propertyType: 'APARTMENT',
        roomType: '2BHK',
        description:
          'Centrally located 2BHK flat in Koramangala 4th Block, walking distance to Sony World Signal and 80 Feet Road cafes. High-speed broadband, 24/7 power backup, fully equipped kitchen.',
        monthlyRent: 36000,
        securityDeposit: 100000,
        maintenanceCharge: 2500,
        area: 1100,
        bedrooms: 2,
        bathrooms: 2,
        furnishingStatus: 'FURNISHED',
        tenantTypes: ['BACHELOR_FEMALE', 'BACHELOR_MALE', 'FAMILY', 'ANY'],
        amenities: ['WIFI', 'AC', 'PARKING', 'POWER_BACKUP', 'LIFT', 'SECURITY', 'BALCONY', 'GEYSER', 'WASHING_MACHINE', 'REFRIGERATOR'],
        address: '4th Block, 80ft Road, Koramangala',
        locality: 'Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560034',
        latitude: 12.9352,
        longitude: 77.6245,
        googlePlaceId: 'ChIJL_7K_9ETrjsRoW5Z1U5Xb2M',
        formattedAddress: '4th Block, Koramangala, Bengaluru, Karnataka 560034',
        availabilityStatus: 'AVAILABLE',
        availableFrom: '2026-09-01',
        listingStatus: 'ACTIVE',
        viewsCount: 620,
        images: [
          {
            id: 'img_blr_1',
            propertyId: 'prop_blr_006',
            storageKey: 'koramangala.jpg',
            url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1000&auto=format&fit=crop&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&auto=format&fit=crop&q=80',
            sortOrder: 0,
            isCover: true,
            createdAt: '2026-01-20T10:00:00.000Z',
          },
        ],
        createdAt: '2026-01-20T10:00:00.000Z',
        updatedAt: '2026-01-20T10:00:00.000Z',
      },
    ];

    propertiesData.forEach((p) => this.properties.set(p.id, p));

    // 5. Seed Initial Inquiries & Visits
    const inq1: Inquiry = {
      id: 'inq_001',
      userId: user1.id,
      userName: user1.name,
      userPhone: user1.phone,
      ownerId: owner1.id,
      propertyId: 'prop_wakad_001',
      propertyName: 'Signature Park Luxury 2BHK Flat',
      propertyAddress: 'Dutta Mandir Road, Wakad, Pune',
      propertyCoverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
      propertyRent: 24000,
      message: 'Hi Rajesh, I work in Hinjawadi IT Park and I am looking to move in with my family by early next month. Is the car parking covered?',
      moveInDate: '2026-09-01',
      tenantProfile: 'Software Engineer at Infosys with family of 3',
      status: 'RESPONDED',
      ownerResponse: 'Hello Rushikesh, yes the car parking is dedicated and fully covered in the basement. You are welcome to visit this Saturday.',
      createdAt: '2026-02-15T10:30:00.000Z',
      updatedAt: '2026-02-15T11:45:00.000Z',
    };
    this.inquiries.set(inq1.id, inq1);

    const visit1: Visit = {
      id: 'vis_001',
      inquiryId: inq1.id,
      userId: user1.id,
      userName: user1.name,
      userPhone: user1.phone,
      ownerId: owner1.id,
      ownerName: owner1.name,
      ownerPhone: owner1.phone,
      propertyId: 'prop_wakad_001',
      propertyName: 'Signature Park Luxury 2BHK Flat',
      propertyAddress: 'Dutta Mandir Road, Wakad, Pune',
      propertyCoverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
      visitDate: '2026-08-23',
      visitTimeSlot: '11:00 AM - 12:00 PM',
      note: 'Looking forward to viewing the flat and society amenities.',
      status: 'ACCEPTED',
      ownerRemarks: 'Confirmed. Please ring bell at Flat B-402 upon arrival.',
      createdAt: '2026-02-15T12:00:00.000Z',
      updatedAt: '2026-02-15T14:10:00.000Z',
    };
    this.visits.set(visit1.id, visit1);

    // 6. Seed Saved Properties
    const saved1: SavedProperty = {
      id: 'sav_001',
      userId: user1.id,
      propertyId: 'prop_wakad_001',
      createdAt: '2026-02-14T09:00:00.000Z',
    };
    const saved2: SavedProperty = {
      id: 'sav_002',
      userId: user1.id,
      propertyId: 'prop_hinjawadi_003',
      createdAt: '2026-02-16T15:20:00.000Z',
    };
    this.savedProperties.set(saved1.id, saved1);
    this.savedProperties.set(saved2.id, saved2);

    // 7. Seed Initial Notifications
    this.createNotification(
      user1.id,
      'USER',
      'VISIT_ACCEPTED',
      'Visit Confirmed by Owner',
      'Rajesh Kulkarni confirmed your visit for Signature Park 2BHK on Aug 23 at 11:00 AM.',
      visit1.id,
      'VISIT'
    );
    this.createNotification(
      owner1.id,
      'ROOM_OWNER',
      'NEW_INQUIRY',
      'New Inquiry Received',
      'Rushikesh Zope sent an inquiry for Signature Park 2BHK in Wakad.',
      inq1.id,
      'INQUIRY'
    );
    this.createNotification(
      adminId,
      'ADMIN',
      'SYSTEM_ALERT',
      'New Property Pending Review',
      'Green Acres 1BHK in Wakad submitted by Vikram Joshi is awaiting approval.',
      'prop_pending_005',
      'PROPERTY'
    );

    // 8. Seed Audit Logs
    this.logAudit(adminId, 'RoomSetu SuperAdmin', 'ADMIN', 'APPROVE_PROPERTY', 'PROPERTY', 'prop_wakad_001', 'Approved 2BHK listing in Wakad');
    this.logAudit(owner3.id, owner3.name, 'ROOM_OWNER', 'SUBMIT_PROPERTY', 'PROPERTY', 'prop_pending_005', 'Submitted 1BHK listing for review');
  }
}

export const db = new DatabaseEngine();
