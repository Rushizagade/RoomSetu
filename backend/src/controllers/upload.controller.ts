import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service.ts';
import { sendSuccess } from '../utils/response.ts';

export const uploadController = {
  uploadImage(req: Request, res: Response): void {
    const { dataUrl, filename } = req.body;
    const image = uploadService.uploadImage(dataUrl, filename);
    sendSuccess(res, { image });
  },
};
