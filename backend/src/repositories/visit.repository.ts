import { db } from '../database/engine.ts';
import { Visit } from '../types/index.ts';

export const visitRepository = {
  findById(id: string): Visit | undefined {
    return db.visits.get(id);
  },

  findAll(): Visit[] {
    return Array.from(db.visits.values());
  },

  findByUserId(userId: string): Visit[] {
    return Array.from(db.visits.values()).filter((v) => v.userId === userId);
  },

  findByOwnerId(ownerId: string): Visit[] {
    return Array.from(db.visits.values()).filter((v) => v.ownerId === ownerId);
  },

  findByPropertyId(propertyId: string): Visit[] {
    return Array.from(db.visits.values()).filter((v) => v.propertyId === propertyId);
  },

  create(visit: Visit): Visit {
    db.visits.set(visit.id, visit);
    return visit;
  },

  update(id: string, data: Partial<Visit>): Visit | undefined {
    const visit = db.visits.get(id);
    if (!visit) return undefined;
    Object.assign(visit, data);
    return visit;
  },
};
