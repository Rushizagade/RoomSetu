import { Request, Response } from 'express';
import { adminService } from '../services/admin.service.ts';
import { sendSuccess } from '../utils/response.ts';
import { BadRequestError } from '../utils/errors.ts';

export const adminController = {
  getDashboard(req: Request, res: Response): void {
    const result = adminService.getDashboard();
    sendSuccess(res, result);
  },

  getPendingProperties(req: Request, res: Response): void {
    const pendingProperties = adminService.getPendingProperties();
    sendSuccess(res, { pendingProperties });
  },

  approveProperty(req: Request, res: Response): void {
    const property = adminService.approveProperty(req.params.id, req.user!.id, req.user!.name);
    sendSuccess(res, {
      message: 'Property approved successfully! It is now ACTIVE and live in search.',
      property,
    });
  },

  rejectProperty(req: Request, res: Response): void {
    const { reason } = req.body;
    const property = adminService.rejectProperty(req.params.id, reason, req.user!.id, req.user!.name);
    sendSuccess(res, {
      message: 'Property rejected. The owner has been notified with the reason.',
      property,
    });
  },

  getAllProperties(req: Request, res: Response): void {
    const status = req.query.status as string | undefined;
    const properties = adminService.getAllProperties(status);
    sendSuccess(res, { properties });
  },

  setPropertyStatus(req: Request, res: Response): void {
    const { listingStatus, reason } = req.body;
    const property = adminService.setPropertyStatus(req.params.id, listingStatus, reason, req.user!.id, req.user!.name);
    sendSuccess(res, { property });
  },

  getUsers(req: Request, res: Response): void {
    const users = adminService.getUsers();
    sendSuccess(res, { users });
  },

  getOwners(req: Request, res: Response): void {
    const owners = adminService.getOwners();
    sendSuccess(res, { owners });
  },

  setAccountStatus(req: Request, res: Response): void {
    const { type, id } = req.params;
    const { status } = req.body;

    if (type !== 'user' && type !== 'owner') {
      throw new BadRequestError('Type must be user or owner', 'INVALID_TYPE');
    }

    const result = adminService.setAccountStatus(
      type as 'user' | 'owner',
      id,
      status,
      req.user!.id,
      req.user!.name
    );
    sendSuccess(res, result);
  },

  getReports(req: Request, res: Response): void {
    const reports = adminService.getReports();
    sendSuccess(res, { reports });
  },

  moderateReport(req: Request, res: Response): void {
    const { status, adminNotes } = req.body;
    const report = adminService.moderateReport(req.params.id, status, adminNotes, req.user!.id, req.user!.name);
    sendSuccess(res, { report });
  },

  getAuditLogs(req: Request, res: Response): void {
    const logs = adminService.getAuditLogs();
    sendSuccess(res, { logs });
  },
};
