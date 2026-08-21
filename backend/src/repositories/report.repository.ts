import { db } from '../database/engine.ts';
import { PropertyReport } from '../types/index.ts';

export const reportRepository = {
  findById(id: string): PropertyReport | undefined {
    return db.reports.get(id);
  },

  findAll(): PropertyReport[] {
    return Array.from(db.reports.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  findPending(): PropertyReport[] {
    return this.findAll().filter((r) => r.status === 'PENDING');
  },

  create(report: PropertyReport): PropertyReport {
    db.reports.set(report.id, report);
    return report;
  },

  update(id: string, data: Partial<PropertyReport>): PropertyReport | undefined {
    const report = db.reports.get(id);
    if (!report) return undefined;
    Object.assign(report, data);
    return report;
  },
};
