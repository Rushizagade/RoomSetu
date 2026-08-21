import { Request, Response } from 'express';
import { visitService } from '../services/visit.service.ts';
import { sendSuccess, sendCreated } from '../utils/response.ts';

export const visitController = {
  getVisits(req: Request, res: Response): void {
    const { id, role } = req.user!;
    let visits;

    if (role === 'USER') {
      visits = visitService.getForUser(id);
    } else if (role === 'ROOM_OWNER') {
      visits = visitService.getForOwner(id);
    } else {
      visits = visitService.getAll();
    }

    sendSuccess(res, { visits });
  },

  requestVisit(req: Request, res: Response): void {
    const visit = visitService.request(
      req.user!.id,
      req.user!.name,
      req.user!.phone,
      req.body
    );

    sendCreated(res, {
      message: 'Visit requested! The owner will confirm the schedule.',
      visit,
    });
  },

  updateVisitStatus(req: Request, res: Response): void {
    const visit = visitService.updateStatus(
      req.params.id,
      req.user!.id,
      req.user!.name,
      req.body
    );
    sendSuccess(res, { visit });
  },
};
