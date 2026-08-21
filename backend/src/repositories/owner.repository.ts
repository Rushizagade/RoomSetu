import { db } from '../database/engine.ts';
import { RoomOwner } from '../types/index.ts';

export const ownerRepository = {
  findById(id: string): RoomOwner | undefined {
    return db.owners.get(id);
  },

  findByPhone(phone: string): RoomOwner | undefined {
    return Array.from(db.owners.values()).find((o) => o.phone === phone);
  },

  findAll(): RoomOwner[] {
    return Array.from(db.owners.values());
  },

  create(owner: RoomOwner): RoomOwner {
    db.owners.set(owner.id, owner);
    return owner;
  },

  update(id: string, data: Partial<RoomOwner>): RoomOwner | undefined {
    const owner = db.owners.get(id);
    if (!owner) return undefined;
    Object.assign(owner, data);
    return owner;
  },
};
