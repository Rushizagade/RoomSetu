import { db } from '../database/engine.ts';
import { Inquiry } from '../types/index.ts';

export const inquiryRepository = {
  findById(id: string): Inquiry | undefined {
    return db.inquiries.get(id);
  },

  findAll(): Inquiry[] {
    return Array.from(db.inquiries.values());
  },

  findByUserId(userId: string): Inquiry[] {
    return Array.from(db.inquiries.values()).filter((i) => i.userId === userId);
  },

  findByOwnerId(ownerId: string): Inquiry[] {
    return Array.from(db.inquiries.values()).filter((i) => i.ownerId === ownerId);
  },

  findByPropertyId(propertyId: string): Inquiry[] {
    return Array.from(db.inquiries.values()).filter((i) => i.propertyId === propertyId);
  },

  create(inquiry: Inquiry): Inquiry {
    db.inquiries.set(inquiry.id, inquiry);
    return inquiry;
  },

  update(id: string, data: Partial<Inquiry>): Inquiry | undefined {
    const inquiry = db.inquiries.get(id);
    if (!inquiry) return undefined;
    Object.assign(inquiry, data);
    return inquiry;
  },
};
