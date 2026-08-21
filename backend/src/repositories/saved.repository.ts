import { db } from '../database/engine.ts';
import { SavedProperty } from '../types/index.ts';

export const savedRepository = {
  findByUserId(userId: string): SavedProperty[] {
    return Array.from(db.savedProperties.values()).filter((sp) => sp.userId === userId);
  },

  findByUserAndProperty(userId: string, propertyId: string): SavedProperty | undefined {
    return Array.from(db.savedProperties.values()).find(
      (sp) => sp.userId === userId && sp.propertyId === propertyId
    );
  },

  create(saved: SavedProperty): SavedProperty {
    db.savedProperties.set(saved.id, saved);
    return saved;
  },

  delete(id: string): boolean {
    return db.savedProperties.delete(id);
  },
};
