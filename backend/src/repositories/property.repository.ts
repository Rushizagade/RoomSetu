import { db } from '../database/engine.ts';
import { Property } from '../types/index.ts';

export const propertyRepository = {
  findById(id: string): Property | undefined {
    return db.properties.get(id);
  },

  findAll(): Property[] {
    return Array.from(db.properties.values());
  },

  findByOwnerId(ownerId: string): Property[] {
    return Array.from(db.properties.values()).filter((p) => p.ownerId === ownerId);
  },

  findByStatus(status: string): Property[] {
    return Array.from(db.properties.values()).filter((p) => p.listingStatus === status);
  },

  findActive(): Property[] {
    return Array.from(db.properties.values()).filter((p) => p.listingStatus === 'ACTIVE');
  },

  create(property: Property): Property {
    db.properties.set(property.id, property);
    return property;
  },

  update(id: string, data: Partial<Property>): Property | undefined {
    const property = db.properties.get(id);
    if (!property) return undefined;
    Object.assign(property, data);
    return property;
  },

  delete(id: string): boolean {
    return db.properties.delete(id);
  },
};
