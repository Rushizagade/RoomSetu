import { Request, Response } from 'express';
import { savedService } from '../services/saved.service.ts';
import { sendSuccess } from '../utils/response.ts';

export const savedController = {
  getSavedProperties(req: Request, res: Response): void {
    const savedProperties = savedService.getSavedProperties(req.user!.id);
    sendSuccess(res, { savedProperties });
  },

  toggleSave(req: Request, res: Response): void {
    const { propertyId } = req.body;
    const result = savedService.toggle(req.user!.id, propertyId);
    sendSuccess(res, result);
  },
};
