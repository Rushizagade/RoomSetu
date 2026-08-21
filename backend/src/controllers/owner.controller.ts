import { Request, Response } from 'express';
import { propertyService } from '../services/property.service.ts';
import { sendSuccess, sendCreated } from '../utils/response.ts';
import { adminRepository } from '../repositories/admin.repository.ts';
import { notificationRepository } from '../repositories/notification.repository.ts';

export const ownerController = {
  getDashboard(req: Request, res: Response): void {
    const result = propertyService.getOwnerDashboard(req.user!.id);
    sendSuccess(res, result);
  },

  getProperties(req: Request, res: Response): void {
    const properties = propertyService.getOwnerProperties(req.user!.id);
    sendSuccess(res, { properties });
  },

  createProperty(req: Request, res: Response): void {
    const property = propertyService.createProperty(req.user!.id, req.user!.name, req.body);

    if (req.body.submitForReview) {
      const admin = adminRepository.findFirst();
      if (admin) {
        notificationRepository.create(
          admin.user.id, 'ADMIN', 'SYSTEM_ALERT',
          'New Listing Awaiting Approval',
          `"${property.propertyName}" by ${req.user!.name} is ready for review.`,
          property.id, 'PROPERTY'
        );
      }
    }

    sendCreated(res, {
      message: req.body.submitForReview
        ? 'Property submitted for Admin Review! It will go live once verified.'
        : 'Property saved as draft.',
      property,
    });
  },

  updateProperty(req: Request, res: Response): void {
    const property = propertyService.updateProperty(req.params.id, req.user!.id, req.user!.name, req.body);
    sendSuccess(res, { message: 'Property updated successfully', property });
  },

  submitForReview(req: Request, res: Response): void {
    const property = propertyService.submitForReview(req.params.id, req.user!.id, req.user!.name);

    const admin = adminRepository.findFirst();
    if (admin) {
      notificationRepository.create(
        admin.user.id, 'ADMIN', 'SYSTEM_ALERT',
        'Listing Submitted for Review',
        `"${property.propertyName}" by ${req.user!.name} submitted for approval.`,
        property.id, 'PROPERTY'
      );
    }

    sendSuccess(res, { message: 'Property submitted for Admin Review!', property });
  },

  patchStatus(req: Request, res: Response): void {
    const property = propertyService.patchStatus(req.params.id, req.user!.id, req.body);
    sendSuccess(res, { property });
  },
};
