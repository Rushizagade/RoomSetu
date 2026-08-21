import crypto from 'crypto';
import { inquiryRepository } from '../repositories/inquiry.repository.ts';
import { propertyRepository } from '../repositories/property.repository.ts';
import { ownerRepository } from '../repositories/owner.repository.ts';
import { auditRepository } from '../repositories/audit.repository.ts';
import { notificationRepository } from '../repositories/notification.repository.ts';
import { adminRepository } from '../repositories/admin.repository.ts';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.ts';
import { Inquiry } from '../types/index.ts';

export const inquiryService = {
  getForUser(userId: string): Inquiry[] {
    return inquiryRepository.findByUserId(userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getForOwner(ownerId: string): Inquiry[] {
    return inquiryRepository.findByOwnerId(ownerId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getAll(): Inquiry[] {
    return inquiryRepository.findAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  send(
    userId: string,
    userName: string,
    userPhone: string | undefined,
    body: { propertyId: string; message: string; moveInDate?: string; tenantProfile?: string }
  ): Inquiry {
    const { propertyId, message, moveInDate, tenantProfile } = body;

    if (!propertyId || !message?.trim()) {
      throw new BadRequestError('Property ID and message are required.', 'MISSING_FIELDS');
    }

    const property = propertyRepository.findById(propertyId);
    if (!property) throw new NotFoundError('Property not found.', 'PROPERTY_NOT_FOUND');

    if (property.listingStatus !== 'ACTIVE') {
      throw new BadRequestError('This property is not currently accepting inquiries.', 'PROPERTY_NOT_ACTIVE');
    }

    const inquiry: Inquiry = {
      id: 'inq_' + crypto.randomUUID().slice(0, 8),
      userId,
      userName,
      userPhone,
      ownerId: property.ownerId,
      propertyId: property.id,
      propertyName: property.propertyName,
      propertyAddress: `${property.address}, ${property.locality}`,
      propertyCoverImage: property.images[0]?.thumbnailUrl || property.images[0]?.url,
      propertyRent: property.monthlyRent,
      message: message.trim(),
      moveInDate: moveInDate || undefined,
      tenantProfile: tenantProfile?.trim() || undefined,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    inquiryRepository.create(inquiry);

    notificationRepository.create(
      property.ownerId, 'ROOM_OWNER', 'NEW_INQUIRY',
      'New Direct Inquiry',
      `${userName} sent an inquiry for "${property.propertyName}".`,
      inquiry.id, 'INQUIRY'
    );

    auditRepository.create(userId, userName, 'USER', 'SEND_INQUIRY', 'PROPERTY', property.id, 'Sent direct inquiry to owner');

    return inquiry;
  },

  respond(
    inquiryId: string,
    ownerId: string,
    ownerName: string,
    responseText: string,
    status?: string
  ): Inquiry {
    const inquiry = inquiryRepository.findById(inquiryId);
    if (!inquiry) throw new NotFoundError('Inquiry not found', 'INQUIRY_NOT_FOUND');
    if (inquiry.ownerId !== ownerId) throw new ForbiddenError('Unauthorized');

    inquiryRepository.update(inquiryId, {
      ownerResponse: responseText,
      status: (status || 'RESPONDED') as any,
      updatedAt: new Date().toISOString(),
    });

    notificationRepository.create(
      inquiry.userId, 'USER', 'INQUIRY_RESPONSE',
      'Owner Responded to Your Inquiry',
      `Owner responded: "${responseText?.slice(0, 80)}..."`,
      inquiryId, 'INQUIRY'
    );

    return inquiryRepository.findById(inquiryId)!;
  },
};
