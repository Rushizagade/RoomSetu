import { db } from '../database/engine.ts';
import { AuditLog } from '../types/index.ts';

export const auditRepository = {
  findAll(): AuditLog[] {
    return db.auditLogs;
  },

  findRecent(limit = 8): AuditLog[] {
    return db.auditLogs.slice(0, limit);
  },

  create(actorId: string, actorName: string, actorRole: any, action: string, targetType: string, targetId: string, details: string, ipAddress?: string): AuditLog {
    return db.logAudit(actorId, actorName, actorRole, action, targetType, targetId, details, ipAddress);
  },
};
