import { Request, Response } from 'express';
import { propertyService } from '../services/property.service.ts';
import { reportService } from '../services/report.service.ts';
import { sendSuccess } from '../utils/response.ts';
import { SearchFilters, Amenity } from '../types/index.ts';

export const propertyController = {
  search(req: Request, res: Response): void {
    const filters: SearchFilters = {
      latitude: req.query.lat ? parseFloat(req.query.lat as string) : undefined,
      longitude: req.query.lng ? parseFloat(req.query.lng as string) : undefined,
      radiusKm: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
      query: (req.query.q as string) || undefined,
      city: (req.query.city as string) || undefined,
      locality: (req.query.locality as string) || undefined,
      minRent: req.query.minRent ? parseInt(req.query.minRent as string, 10) : undefined,
      maxRent: req.query.maxRent ? parseInt(req.query.maxRent as string, 10) : undefined,
      propertyType: (req.query.propertyType as any) || 'ALL',
      roomType: (req.query.roomType as any) || 'ALL',
      furnishingStatus: (req.query.furnishingStatus as any) || 'ALL',
      tenantType: (req.query.tenantType as any) || 'ALL',
      amenities: req.query.amenities
        ? (Array.isArray(req.query.amenities) ? req.query.amenities as Amenity[] : [req.query.amenities as Amenity])
        : undefined,
      availabilityStatus: (req.query.availability as any) || 'ALL',
      sortBy: (req.query.sortBy as string) || 'recommended',
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20,
    };

    const viewerUserId = req.user?.role === 'USER' ? req.user.id : undefined;
    const result = propertyService.search(filters, viewerUserId);
    sendSuccess(res, result);
  },

  getById(req: Request, res: Response): void {
    const viewerUserId = req.user?.role === 'USER' ? req.user.id : undefined;
    const property = propertyService.getById(req.params.id, viewerUserId);
    sendSuccess(res, { property });
  },

  reportProperty(req: Request, res: Response): void {
    const { reason, description } = req.body;
    const report = reportService.create(
      req.user!.id,
      req.user!.name,
      req.user!.phone,
      req.params.id,
      reason,
      description
    );
    sendSuccess(res, {
      message: 'Report submitted successfully. Our safety team will review it.',
      report,
    });
  },
};
