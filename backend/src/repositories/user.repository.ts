import { db } from '../database/engine.ts';
import { User } from '../types/index.ts';

export const userRepository = {
  findById(id: string): User | undefined {
    return db.users.get(id);
  },

  findByPhone(phone: string): User | undefined {
    return Array.from(db.users.values()).find((u) => u.phone === phone);
  },

  findAll(): User[] {
    return Array.from(db.users.values());
  },

  create(user: User): User {
    db.users.set(user.id, user);
    return user;
  },

  update(id: string, data: Partial<User>): User | undefined {
    const user = db.users.get(id);
    if (!user) return undefined;
    Object.assign(user, data);
    return user;
  },
};
