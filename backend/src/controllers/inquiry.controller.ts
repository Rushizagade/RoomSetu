import { Request, Response } from 'express';
import { inquiryService } from '../services/inquiry.service.ts';
import { sendSuccess, sendCreated } from '../utils/response.ts';

export const inquiryController = {
  getInquiries(req: Request, res: Response): void {
    const { id, role } = req.user!;
    let inquiries;

    if (role === 'USER') {
      inquiries = inquiryService.getForUser(id);
    } else if (role === 'ROOM_OWNER') {
      inquiries = inquiryService.getForOwner(id);
    } else {
      inquiries = inquiryService.getAll();
    }

    sendSuccess(res, { inquiries });
  },

  sendInquiry(req: Request, res: Response): void {
    const inquiry = inquiryService.send(
      req.user!.id,
      req.user!.name,
      req.user!.phone,
      req.body
    );

    sendCreated(res, {
      message: 'Inquiry sent directly to the owner! You will receive updates here.',
      inquiry,
    });
  },

  respondToInquiry(req: Request, res: Response): void {
    const { responseText, status } = req.body;
    const inquiry = inquiryService.respond(
      req.params.id,
      req.user!.id,
      req.user!.name,
      responseText,
      status
    );
    sendSuccess(res, { inquiry });
  },
};
