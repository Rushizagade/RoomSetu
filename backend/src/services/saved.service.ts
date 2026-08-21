import crypto from 'crypto';
import { savedRepository } from '../repositories/saved.repository.ts';
import { propertyRepository } from '../repositories/property.repository.ts';
import { ownerRepository } from '../repositories/owner.repository.ts';
import { BadRequestError } from '../utils/errors.ts';
import { Property } from '../types/index.ts';

export const savedService = {
  getSavedProperties(userId: string): any[] {
    const saved = savedRepository.findByUserId(userId);

    return saved
      .map((sp) => {
        const prop = propertyRepository.findById(sp.propertyId);
        if (!prop) return null;
        const owner = ownerRepository.findById(prop.ownerId);
        return {
          ...prop,
          savedAt: sp.createdAt,
          ownerName: owner?.name || 'Verified Owner',
          ownerPhone: owner?.phone || '+91 98200 12345',
        };
      })
      .filter(Boolean);
  },

  toggle(userId: string, propertyId: string): { isSaved: boolean; message: string } {
    if (!propertyId) throw new BadRequestError('Property ID is required', 'MISSING_PROPERTY_ID');

    const existing = savedRepository.findByUserAndProperty(userId, propertyId);

    if (existing) {
      savedRepository.delete(existing.id);
      return { isSaved: false, message: 'Property removed from saved list' };
    }

    savedRepository.create({
      id: 'sav_' + crypto.randomUUID().slice(0, 8),
      userId,
      propertyId,
      createdAt: new Date().toISOString(),
    });

    return { isSaved: true, message: 'Property added to saved list' };
  },
};
