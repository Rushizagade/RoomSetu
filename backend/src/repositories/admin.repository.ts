import { db } from '../database/engine.ts';
import { AdminUser } from '../types/index.ts';

export interface AdminRecord {
  user: AdminUser;
  passwordHash: string;
}

export const adminRepository = {
  findByEmail(email: string): AdminRecord | undefined {
    return db.admins.get(email.toLowerCase().trim());
  },

  findByUserId(id: string): AdminRecord | undefined {
    return Array.from(db.admins.values()).find((a) => a.user.id === id);
  },

  findFirst(): AdminRecord | undefined {
    return Array.from(db.admins.values())[0];
  },

  findAll(): AdminRecord[] {
    return Array.from(db.admins.values());
  },
};
