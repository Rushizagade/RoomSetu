import crypto from 'crypto';
import { visitRepository } from '../repositories/visit.repository.ts';
import { propertyRepository } from '../repositories/property.repository.ts';
import { ownerRepository } from '../repositories/owner.repository.ts';
import { auditRepository } from '../repositories/audit.repository.ts';
import { notificationRepository } from '../repositories/notification.repository.ts';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors.ts';
import { Visit } from '../types/index.ts';

export const visitService = {
  getForUser(userId: string): Visit[] {
    return visitRepository.findByUserId(userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getForOwner(ownerId: string): Visit[] {
    return visitRepository.findByOwnerId(ownerId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getAll(): Visit[] {
    return visitRepository.findAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  request(
    userId: string,
    userName: string,
    userPhone: string | undefined,
    body: { propertyId: string; visitDate: string; visitTimeSlot: string; note?: string }
  ): Visit {
    const { propertyId, visitDate, visitTimeSlot, note } = body;

    if (!propertyId || !visitDate || !visitTimeSlot) {
      throw new BadRequestError('Property ID, visit date, and time slot are required.', 'MISSING_FIELDS');
    }

    const property = propertyRepository.findById(propertyId);
    if (!property) throw new NotFoundError('Property not found.', 'PROPERTY_NOT_FOUND');

    const owner = ownerRepository.findById(property.ownerId);

    const visit: Visit = {
      id: 'vis_' + crypto.randomUUID().slice(0, 8),
      userId,
      userName,
      userPhone,
      ownerId: property.ownerId,
      ownerName: owner?.name || 'Verified Owner',
      ownerPhone: owner?.phone || '+91 98200 12345',
      propertyId: property.id,
      propertyName: property.propertyName,
      propertyAddress: `${property.address}, ${property.locality}`,
      propertyCoverImage: property.images[0]?.thumbnailUrl || property.images[0]?.url,
      visitDate,
      visitTimeSlot,
      note: note?.trim() || undefined,
      status: 'REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    visitRepository.create(visit);

    notificationRepository.create(
      property.ownerId, 'ROOM_OWNER', 'VISIT_REQUESTED',
      'New Property Visit Request',
      `${userName} requested a visit for "${property.propertyName}" on ${visitDate} at ${visitTimeSlot}.`,
      visit.id, 'VISIT'
    );

    auditRepository.create(userId, userName, 'USER', 'REQUEST_VISIT', 'PROPERTY', property.id, `Requested visit for ${visitDate}`);

    return visit;
  },

  updateStatus(
    visitId: string,
    ownerId: string,
    ownerName: string,
    body: { status: string; ownerRemarks?: string; newVisitDate?: string; newVisitTimeSlot?: string }
  ): Visit {
    const visit = visitRepository.findById(visitId);
    if (!visit) throw new NotFoundError('Visit request not found.', 'VISIT_NOT_FOUND');
    if (visit.ownerId !== ownerId) throw new ForbiddenError('Unauthorized');

    const updates: Partial<Visit> = {
      status: body.status as any,
      updatedAt: new Date().toISOString(),
    };
    if (body.ownerRemarks) updates.ownerRemarks = body.ownerRemarks;
    if (body.newVisitDate) updates.visitDate = body.newVisitDate;
    if (body.newVisitTimeSlot) updates.visitTimeSlot = body.newVisitTimeSlot;

    visitRepository.update(visitId, updates);
    const updated = visitRepository.findById(visitId)!;

    const notifTypeMap: Record<string, any> = {
      ACCEPTED: 'VISIT_ACCEPTED',
      REJECTED: 'VISIT_REJECTED',
      RESCHEDULED: 'VISIT_RESCHEDULED',
    };

    const notifMsgMap: Record<string, string> = {
      ACCEPTED: `Your visit for ${updated.propertyName} is confirmed for ${updated.visitDate} (${updated.visitTimeSlot}).`,
      REJECTED: `Owner could not accommodate visit: ${body.ownerRemarks || 'Slot unavailable'}.`,
      RESCHEDULED: `Visit rescheduled to ${updated.visitDate} (${updated.visitTimeSlot}).`,
    };

    const notifType = notifTypeMap[body.status] || 'VISIT_RESCHEDULED';
    const notifMsg = notifMsgMap[body.status] || `Visit status updated to ${body.status}.`;

    notificationRepository.create(visit.userId, 'USER', notifType, 'Property Visit Update', notifMsg, visitId, 'VISIT');

    return updated;
  },
};
