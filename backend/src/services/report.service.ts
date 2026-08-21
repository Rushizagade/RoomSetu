import crypto from 'crypto';
import { reportRepository } from '../repositories/report.repository.ts';
import { propertyRepository } from '../repositories/property.repository.ts';
import { auditRepository } from '../repositories/audit.repository.ts';
import { notificationRepository } from '../repositories/notification.repository.ts';
import { adminRepository } from '../repositories/admin.repository.ts';
import { BadRequestError, NotFoundError } from '../utils/errors.ts';
import { PropertyReport } from '../types/index.ts';

export const reportService = {
  create(
    userId: string,
    userName: string,
    userPhone: string | undefined,
    propertyId: string,
    reason: string,
    description: string
  ): PropertyReport {
    const property = propertyRepository.findById(propertyId);
    if (!property) throw new NotFoundError('Property not found.', 'PROPERTY_NOT_FOUND');

    const report: PropertyReport = {
      id: 'rep_' + crypto.randomUUID().slice(0, 8),
      propertyId,
      propertyName: property.propertyName,
      reporterUserId: userId,
      reporterName: userName,
      reporterPhone: userPhone,
      reason: (reason || 'MISLEADING_INFO') as any,
      description: description || 'Reported by user for review',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reportRepository.create(report);

    auditRepository.create(userId, userName, 'USER', 'REPORT_PROPERTY', 'PROPERTY', propertyId, `Reported: ${reason}`);

    // Notify first admin
    const admin = adminRepository.findFirst();
    if (admin) {
      notificationRepository.create(
        admin.user.id, 'ADMIN', 'PROPERTY_REPORTED',
        'Property Reported by User',
        `"${property.propertyName}" was reported for ${reason}.`,
        report.id, 'REPORT'
      );
    }

    return report;
  },
};
