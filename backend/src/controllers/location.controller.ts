import { Request, Response } from 'express';
import { locationService } from '../services/location.service.ts';
import { sendSuccess } from '../utils/response.ts';
import { BadRequestError } from '../utils/errors.ts';

export const locationController = {
  autocomplete(req: Request, res: Response): void {
    const query = (req.query.q as string) || '';
    const suggestions = locationService.autocomplete(query);
    sendSuccess(res, { suggestions });
  },

  reverseGeocode(req: Request, res: Response): void {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);

    if (isNaN(lat) || isNaN(lng)) {
      throw new BadRequestError('Valid lat/lng required', 'INVALID_COORDS');
    }

    const result = locationService.reverseGeocode(lat, lng);
    sendSuccess(res, result);
  },
};
