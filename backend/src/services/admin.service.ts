import { propertyRepository } from '../repositories/property.repository.ts';
import { ownerRepository } from '../repositories/owner.repository.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { inquiryRepository } from '../repositories/inquiry.repository.ts';
import { visitRepository } from '../repositories/visit.repository.ts';
import { reportRepository } from '../repositories/report.repository.ts';
import { savedRepository } from '../repositories/saved.repository.ts';
import { auditRepository } from '../repositories/audit.repository.ts';
import { notificationRepository } from '../repositories/notification.repository.ts';
import { adminRepository } from '../repositories/admin.repository.ts';
import { NotFoundError, BadRequestError } from '../utils/errors.ts';
import { Property, PropertyReport } from '../types/index.ts';

function enrichPropertyWithOwner(p: Property) {
  const owner = ownerRepository.findById(p.ownerId);
  return {
    ...p,
    ownerName: owner?.name || 'Owner',
    ownerPhone: owner?.phone || '',
    ownerEmail: owner?.email || '',
    ownerRating: owner?.rating || 4.8,
    ownerTotalListings: owner?.totalListings || 1,
  };
}

export const adminService = {
  getDashboard() {
    const allProps = propertyRepository.findAll();
    const allUsers = userRepository.findAll();
    const allOwners = ownerRepository.findAll();
    const allInquiries = inquiryRepository.findAll();
    const allVisits = visitRepository.findAll();
    const allReports = reportRepository.findAll();

    return {
      metrics: {
        totalProperties: allProps.length,
        activeProperties: allProps.filter((p) => p.listingStatus === 'ACTIVE').length,
        pendingReviewProperties: allProps.filter((p) => p.listingStatus === 'PENDING_REVIEW').length,
        rejectedProperties: allProps.filter((p) => p.listingStatus === 'REJECTED').length,
        totalUsers: allUsers.length,
        totalOwners: allOwners.length,
        totalInquiries: allInquiries.length,
        totalVisits: allVisits.length,
        pendingReports: allReports.filter((r) => r.status === 'PENDING').length,
      },
      pendingQueue: allProps.filter((p) => p.listingStatus === 'PENDING_REVIEW').map(enrichPropertyWithOwner),
      recentReports: allReports.slice(0, 5),
      recentAuditLogs: auditRepository.findRecent(8),
    };
  },

  getPendingProperties() {
    return propertyRepository.findByStatus('PENDING_REVIEW').map(enrichPropertyWithOwner);
  },

  approveProperty(id: string, adminId: string, adminName: string): Property {
    const property = propertyRepository.findById(id);
    if (!property) throw new NotFoundError('Property not found', 'PROPERTY_NOT_FOUND');

    propertyRepository.update(id, {
      listingStatus: 'ACTIVE',
      rejectionReason: undefined,
      updatedAt: new Date().toISOString(),
    });

    auditRepository.create(adminId, adminName, 'ADMIN', 'APPROVE_PROPERTY', 'PROPERTY', id,
      `Approved "${property.propertyName}" in ${property.locality}, ${property.city}`);

    notificationRepository.create(
      property.ownerId, 'ROOM_OWNER', 'PROPERTY_APPROVED',
      'Property Approved & Live!',
      `Congratulations! "${property.propertyName}" has been approved and is now live on RoomSetu.`,
      id, 'PROPERTY'
    );

    return propertyRepository.findById(id)!;
  },

  rejectProperty(id: string, reason: string, adminId: string, adminName: string): Property {
    if (!reason?.trim()) {
      throw new BadRequestError('A rejection reason is mandatory for auditing and owner notification.', 'MISSING_REASON');
    }

    const property = propertyRepository.findById(id);
    if (!property) throw new NotFoundError('Property not found', 'PROPERTY_NOT_FOUND');

    propertyRepository.update(id, {
      listingStatus: 'REJECTED',
      rejectionReason: reason.trim(),
      updatedAt: new Date().toISOString(),
    });

    auditRepository.create(adminId, adminName, 'ADMIN', 'REJECT_PROPERTY', 'PROPERTY', id, `Rejected property. Reason: ${reason}`);

    notificationRepository.create(
      property.ownerId, 'ROOM_OWNER', 'PROPERTY_REJECTED',
      'Property Needs Changes',
      `Your listing "${property.propertyName}" was rejected: ${reason}. Please edit and resubmit.`,
      id, 'PROPERTY'
    );

    return propertyRepository.findById(id)!;
  },

  getAllProperties(status?: string) {
    const list = status && status !== 'ALL'
      ? propertyRepository.findByStatus(status)
      : propertyRepository.findAll();
    return list.map(enrichPropertyWithOwner);
  },

  setPropertyStatus(id: string, listingStatus: string, reason: string | undefined, adminId: string, adminName: string): Property {
    const property = propertyRepository.findById(id);
    if (!property) throw new NotFoundError('Property not found', 'PROPERTY_NOT_FOUND');

    const updates: Partial<Property> = { listingStatus: listingStatus as any, updatedAt: new Date().toISOString() };
    if (reason) updates.rejectionReason = reason;
    propertyRepository.update(id, updates);

    auditRepository.create(adminId, adminName, 'ADMIN', `SET_STATUS_${listingStatus}`, 'PROPERTY', id, `Admin set status to ${listingStatus}`);

    return propertyRepository.findById(id)!;
  },

  getUsers() {
    return userRepository.findAll().map((u) => ({
      ...u,
      savedCount: savedRepository.findByUserId(u.id).length,
      inquiriesCount: inquiryRepository.findByUserId(u.id).length,
    }));
  },

  getOwners() {
    return ownerRepository.findAll().map((o) => ({
      ...o,
      propertiesCount: propertyRepository.findByOwnerId(o.id).length,
      activeCount: propertyRepository.findByOwnerId(o.id).filter((p) => p.listingStatus === 'ACTIVE').length,
    }));
  },

  setAccountStatus(type: 'user' | 'owner', id: string, status: 'ACTIVE' | 'SUSPENDED', adminId: string, adminName: string) {
    if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
      throw new BadRequestError('Status must be ACTIVE or SUSPENDED', 'INVALID_STATUS');
    }

    if (type === 'user') {
      const u = userRepository.findById(id);
      if (!u) throw new NotFoundError('User not found', 'NOT_FOUND');
      userRepository.update(id, { status });
      auditRepository.create(adminId, adminName, 'ADMIN', `ACCOUNT_${status}`, 'USER', id, `Changed user status to ${status}`);
      return { user: userRepository.findById(id) };
    }

    const o = ownerRepository.findById(id);
    if (!o) throw new NotFoundError('Owner not found', 'NOT_FOUND');
    ownerRepository.update(id, { status });
    auditRepository.create(adminId, adminName, 'ADMIN', `ACCOUNT_${status}`, 'ROOM_OWNER', id, `Changed owner status to ${status}`);
    return { owner: ownerRepository.findById(id) };
  },

  getReports(): PropertyReport[] {
    return reportRepository.findAll();
  },

  moderateReport(id: string, status: string, adminNotes: string | undefined, adminId: string, adminName: string): PropertyReport {
    const report = reportRepository.findById(id);
    if (!report) throw new NotFoundError('Report not found', 'REPORT_NOT_FOUND');

    reportRepository.update(id, {
      status: status as any,
      adminNotes,
      updatedAt: new Date().toISOString(),
    });

    auditRepository.create(adminId, adminName, 'ADMIN', 'MODERATE_REPORT', 'REPORT', id, `Report status → ${status}`);
    return reportRepository.findById(id)!;
  },

  getAuditLogs() {
    return auditRepository.findAll();
  },
};
