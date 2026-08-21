import crypto from 'crypto';
import { propertyRepository } from '../repositories/property.repository.ts';
import { ownerRepository } from '../repositories/owner.repository.ts';
import { inquiryRepository } from '../repositories/inquiry.repository.ts';
import { visitRepository } from '../repositories/visit.repository.ts';
import { savedRepository } from '../repositories/saved.repository.ts';
import { auditRepository } from '../repositories/audit.repository.ts';
import { calculateDistanceKm } from '../utils/geo.ts';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.ts';
import {
  Property,
  SearchFilters,
  SearchResponse,
  Amenity,
} from '../types/index.ts';
import { DEFAULT_SEARCH_RADIUS_KM, DEFAULT_PAGE_SIZE } from '../constants/index.ts';

function enrichWithOwner(property: Property) {
  const owner = ownerRepository.findById(property.ownerId);
  return {
    ...property,
    ownerName: owner?.name || 'Verified Owner',
    ownerPhone: owner?.phone || '+91 98200 12345',
    ownerRating: owner?.rating || 4.8,
    ownerTotalListings: owner?.totalListings || 1,
  };
}

export const propertyService = {
  search(filters: SearchFilters, viewerUserId?: string): SearchResponse {
    let list = propertyRepository.findActive();

    // Geo filter
    if (filters.latitude !== undefined && filters.longitude !== undefined) {
      const radius = filters.radiusKm ?? DEFAULT_SEARCH_RADIUS_KM;
      list = list
        .map((p) => ({
          ...p,
          distanceKm: calculateDistanceKm(filters.latitude!, filters.longitude!, p.latitude, p.longitude),
        }))
        .filter((p) => (p.distanceKm ?? Infinity) <= radius);
    } else if (filters.query || filters.city || filters.locality) {
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

    if (filters.minRent && filters.minRent > 0) list = list.filter((p) => p.monthlyRent >= filters.minRent!);
    if (filters.maxRent && filters.maxRent > 0) list = list.filter((p) => p.monthlyRent <= filters.maxRent!);
    if (filters.propertyType && filters.propertyType !== 'ALL') list = list.filter((p) => p.propertyType === filters.propertyType);
    if (filters.roomType && filters.roomType !== 'ALL') list = list.filter((p) => p.roomType === filters.roomType);
    if (filters.furnishingStatus && filters.furnishingStatus !== 'ALL') list = list.filter((p) => p.furnishingStatus === filters.furnishingStatus);
    if (filters.tenantType && filters.tenantType !== 'ALL') {
      list = list.filter((p) => p.tenantTypes.includes('ANY') || p.tenantTypes.includes(filters.tenantType as any));
    }
    if (filters.amenities && filters.amenities.length > 0) {
      list = list.filter((p) => filters.amenities!.every((a) => p.amenities.includes(a)));
    }
    if (filters.availabilityStatus && filters.availabilityStatus !== 'ALL') {
      list = list.filter((p) => p.availabilityStatus === filters.availabilityStatus);
    }

    // Sort
    const sort = filters.sortBy || 'recommended';
    if (sort === 'nearest' && filters.latitude && filters.longitude) {
      list.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    } else if (sort === 'rentLowToHigh') {
      list.sort((a, b) => a.monthlyRent - b.monthlyRent);
    } else if (sort === 'rentHighToLow') {
      list.sort((a, b) => b.monthlyRent - a.monthlyRent);
    } else if (sort === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      list.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
    }

    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.max(1, Math.min(filters.pageSize || DEFAULT_PAGE_SIZE, 100));
    const total = list.length;
    const start = (page - 1) * pageSize;
    const paged = list.slice(start, start + pageSize);

    const enriched = paged.map((p) => {
      const owner = ownerRepository.findById(p.ownerId);
      return {
        ...p,
        ownerName: owner?.name || 'Verified Owner',
        ownerPhone: owner?.phone || '+91 98200 12345',
        ownerRating: owner?.rating || 4.8,
        inquiriesCount: inquiryRepository.findByPropertyId(p.id).length,
      };
    });

    return {
      success: true,
      properties: enriched,
      items: enriched,
      page,
      pageSize,
      total,
      hasMore: start + pageSize < total,
    };
  },

  getById(id: string, viewerUserId?: string): any {
    const property = propertyRepository.findById(id);
    if (!property) throw new NotFoundError('Property could not be found.', 'PROPERTY_NOT_FOUND');

    property.viewsCount = (property.viewsCount || 0) + 1;

    const owner = ownerRepository.findById(property.ownerId);
    let isSaved = false;
    if (viewerUserId) {
      isSaved = !!savedRepository.findByUserAndProperty(viewerUserId, id);
    }

    return {
      ...property,
      ownerName: owner?.name || 'Verified Room Owner',
      ownerPhone: owner?.phone || '+91 98200 12345',
      ownerRating: owner?.rating || 4.8,
      ownerTotalListings: owner?.totalListings || 1,
      isSaved,
    };
  },

  createProperty(ownerId: string, ownerName: string, body: any): Property {
    const {
      propertyName, propertyType, roomType, description, monthlyRent, securityDeposit,
      maintenanceCharge, area, bedrooms, bathrooms, furnishingStatus, tenantTypes, amenities,
      address, locality, city, state, postalCode, country, latitude, longitude, googlePlaceId,
      formattedAddress, availableFrom, images, submitForReview,
    } = body;

    if (!propertyName || !monthlyRent || latitude === undefined || longitude === undefined || !address || !locality) {
      throw new BadRequestError(
        'Property name, rent, location, and Google Maps coordinates are required.',
        'INVALID_PROPERTY_DATA'
      );
    }

    const propId = 'prop_' + crypto.randomUUID().slice(0, 8);
    const status = submitForReview ? 'PENDING_REVIEW' : 'DRAFT';

    const property: Property = {
      id: propId,
      ownerId,
      propertyName: String(propertyName).trim(),
      propertyType: propertyType || 'APARTMENT',
      roomType: roomType || '1BHK',
      description: description || 'Spacious room in excellent neighbourhood.',
      monthlyRent: Number(monthlyRent),
      securityDeposit: Number(securityDeposit || monthlyRent * 2),
      maintenanceCharge: Number(maintenanceCharge || 0),
      area: Number(area || 500),
      bedrooms: Number(bedrooms || 1),
      bathrooms: Number(bathrooms || 1),
      furnishingStatus: furnishingStatus || 'SEMI_FURNISHED',
      tenantTypes: tenantTypes || ['ANY'],
      amenities: amenities || ['WIFI', 'PARKING', 'SECURITY'],
      address: String(address).trim(),
      locality: String(locality).trim(),
      city: city?.trim() || 'Pune',
      state: state?.trim() || 'Maharashtra',
      country: country || 'India',
      postalCode: postalCode?.trim() || '411057',
      latitude: Number(latitude),
      longitude: Number(longitude),
      googlePlaceId: googlePlaceId || undefined,
      formattedAddress: formattedAddress || `${address}, ${locality}, ${city || 'Pune'}`,
      availabilityStatus: 'AVAILABLE',
      availableFrom: availableFrom || new Date().toISOString().split('T')[0],
      listingStatus: status as any,
      viewsCount: 0,
      images: Array.isArray(images) && images.length > 0 ? images : [
        {
          id: 'img_' + crypto.randomUUID().slice(0, 6),
          propertyId: propId,
          storageKey: 'default_room.jpg',
          url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80',
          thumbnailUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&auto=format&fit=crop&q=80',
          sortOrder: 0,
          isCover: true,
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    propertyRepository.create(property);

    // Update owner listing count
    ownerRepository.update(ownerId, { totalListings: (ownerRepository.findById(ownerId)?.totalListings || 0) + 1 });

    auditRepository.create(
      ownerId, ownerName, 'ROOM_OWNER',
      submitForReview ? 'SUBMIT_PROPERTY' : 'CREATE_PROPERTY_DRAFT',
      'PROPERTY', propId,
      `Created "${property.propertyName}" in ${property.locality} (${status})`
    );

    return property;
  },

  updateProperty(id: string, ownerId: string, ownerName: string, body: any): Property {
    const property = propertyRepository.findById(id);
    if (!property) throw new NotFoundError('Property not found', 'PROPERTY_NOT_FOUND');
    if (property.ownerId !== ownerId) throw new ForbiddenError('You do not own this property');

    const allowed = [
      'propertyName', 'propertyType', 'roomType', 'description', 'monthlyRent',
      'securityDeposit', 'maintenanceCharge', 'area', 'bedrooms', 'bathrooms',
      'furnishingStatus', 'tenantTypes', 'amenities', 'address', 'locality', 'city',
      'state', 'postalCode', 'latitude', 'longitude', 'formattedAddress', 'availableFrom',
      'availabilityStatus', 'images',
    ];

    const updates: Partial<Property> = { updatedAt: new Date().toISOString() };
    allowed.forEach((key) => { if (body[key] !== undefined) (updates as any)[key] = body[key]; });

    propertyRepository.update(id, updates);
    auditRepository.create(ownerId, ownerName, 'ROOM_OWNER', 'UPDATE_PROPERTY', 'PROPERTY', id, 'Updated property details');

    return propertyRepository.findById(id)!;
  },

  submitForReview(id: string, ownerId: string, ownerName: string): Property {
    const property = propertyRepository.findById(id);
    if (!property) throw new NotFoundError('Property not found', 'PROPERTY_NOT_FOUND');
    if (property.ownerId !== ownerId) throw new ForbiddenError('You can only submit your own properties');

    propertyRepository.update(id, {
      listingStatus: 'PENDING_REVIEW',
      rejectionReason: undefined,
      updatedAt: new Date().toISOString(),
    });

    auditRepository.create(ownerId, ownerName, 'ROOM_OWNER', 'SUBMIT_FOR_REVIEW', 'PROPERTY', id, 'Submitted for Admin Review');
    return propertyRepository.findById(id)!;
  },

  patchStatus(id: string, ownerId: string, body: { availabilityStatus?: string; listingStatus?: string }): Property {
    const property = propertyRepository.findById(id);
    if (!property) throw new NotFoundError('Property not found', 'PROPERTY_NOT_FOUND');
    if (property.ownerId !== ownerId) throw new ForbiddenError('Unauthorized');

    const updates: Partial<Property> = { updatedAt: new Date().toISOString() };
    if (body.availabilityStatus) updates.availabilityStatus = body.availabilityStatus as any;
    if (body.listingStatus) updates.listingStatus = body.listingStatus as any;

    propertyRepository.update(id, updates);
    return propertyRepository.findById(id)!;
  },

  getOwnerDashboard(ownerId: string) {
    const properties = propertyRepository.findByOwnerId(ownerId);
    const inquiries = inquiryRepository.findByOwnerId(ownerId);
    const visits = visitRepository.findByOwnerId(ownerId);

    return {
      stats: {
        totalProperties: properties.length,
        activeProperties: properties.filter((p) => p.listingStatus === 'ACTIVE').length,
        pendingProperties: properties.filter((p) => p.listingStatus === 'PENDING_REVIEW').length,
        totalViews: properties.reduce((acc, p) => acc + (p.viewsCount || 0), 0),
        totalInquiries: inquiries.length,
        scheduledVisits: visits.filter((v) => v.status === 'ACCEPTED' || v.status === 'REQUESTED').length,
      },
      recentInquiries: [...inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
      upcomingVisits: visits.filter((v) => v.status === 'ACCEPTED').slice(0, 5),
    };
  },

  getOwnerProperties(ownerId: string) {
    const properties = propertyRepository.findByOwnerId(ownerId);
    return properties.map((p) => ({
      ...p,
      inquiriesCount: inquiryRepository.findByPropertyId(p.id).length,
      visitsCount: visitRepository.findByPropertyId(p.id).length,
    }));
  },
};
