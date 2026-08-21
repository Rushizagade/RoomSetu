import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';
import { userRepository } from '../repositories/user.repository.ts';
import { ownerRepository } from '../repositories/owner.repository.ts';
import { adminRepository } from '../repositories/admin.repository.ts';
import { auditRepository } from '../repositories/audit.repository.ts';
import { UnauthorizedError, BadRequestError } from '../utils/errors.ts';
import { User, RoomOwner, AdminUser } from '../types/index.ts';

export interface AuthTokenPayload {
  id: string;
  role: 'USER' | 'ROOM_OWNER' | 'ADMIN';
  phone?: string;
  email?: string;
  name: string;
}

function signToken(payload: AuthTokenPayload, expiresIn: string): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn } as any);
}

export const authService = {
  /** Find or create a USER from OTP login. */
  loginOrRegisterUser(phone: string, name?: string): { user: User; token: string; isNew: boolean } {
    let user = userRepository.findByPhone(phone);
    let isNew = false;

    if (!user) {
      user = userRepository.create({
        id: 'usr_' + crypto.randomUUID().slice(0, 8),
        name: name?.trim() || `User ${phone.slice(-4)}`,
        phone,
        role: 'USER',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
      auditRepository.create(user.id, user.name, 'USER', 'REGISTER', 'USER', user.id, 'User registered via OTP');
      isNew = true;
    }

    const token = signToken(
      { id: user.id, role: 'USER', phone: user.phone, name: user.name, email: user.email },
      env.JWT_EXPIRES_IN
    );

    return { user, token, isNew };
  },

  /** Find or create a ROOM_OWNER from OTP login. */
  loginOrRegisterOwner(phone: string, name?: string): { user: RoomOwner; token: string; isNew: boolean } {
    let owner = ownerRepository.findByPhone(phone);
    let isNew = false;

    if (!owner) {
      owner = ownerRepository.create({
        id: 'own_' + crypto.randomUUID().slice(0, 8),
        name: name?.trim() || `Owner ${phone.slice(-4)}`,
        phone,
        role: 'ROOM_OWNER',
        status: 'ACTIVE',
        verifiedStatus: 'VERIFIED',
        rating: 5.0,
        totalListings: 0,
        createdAt: new Date().toISOString(),
      });
      auditRepository.create(owner.id, owner.name, 'ROOM_OWNER', 'REGISTER', 'ROOM_OWNER', owner.id, 'Room Owner registered via OTP');
      isNew = true;
    }

    const token = signToken(
      { id: owner.id, role: 'ROOM_OWNER', phone: owner.phone, name: owner.name, email: owner.email },
      env.JWT_EXPIRES_IN
    );

    return { user: owner, token, isNew };
  },

  /** Admin email + password login. */
  adminLogin(email: string, password: string): { user: AdminUser; token: string } {
    const record = adminRepository.findByEmail(email);
    if (!record || !bcrypt.compareSync(password, record.passwordHash)) {
      throw new UnauthorizedError('Invalid admin email or password', 'INVALID_CREDENTIALS');
    }

    const token = signToken(
      { id: record.user.id, role: 'ADMIN', email: record.user.email, name: record.user.name },
      env.JWT_ADMIN_EXPIRES_IN
    );

    auditRepository.create(record.user.id, record.user.name, 'ADMIN', 'ADMIN_LOGIN', 'ADMIN', record.user.id, 'Admin logged in');

    return { user: record.user, token };
  },

  /** Demo switch — instantly log in as a seeded persona (dev helper). */
  demoSwitch(targetRole: 'USER' | 'ROOM_OWNER' | 'ADMIN'): { user: any; token: string } {
    let userEntity: any;
    let expiresIn = env.JWT_EXPIRES_IN;

    if (targetRole === 'ADMIN') {
      const record = adminRepository.findFirst();
      if (!record) throw new BadRequestError('No admin found');
      userEntity = record.user;
      expiresIn = env.JWT_ADMIN_EXPIRES_IN;
    } else if (targetRole === 'ROOM_OWNER') {
      userEntity = ownerRepository.findById('own_rajesh_01') || ownerRepository.findAll()[0];
    } else {
      userEntity = userRepository.findById('usr_rushikesh_01') || userRepository.findAll()[0];
    }

    if (!userEntity) throw new BadRequestError('No demo user found for role: ' + targetRole);

    const token = signToken(
      { id: userEntity.id, role: targetRole, phone: userEntity.phone, name: userEntity.name, email: userEntity.email },
      expiresIn
    );

    return { user: userEntity, token };
  },

  /** Get current authenticated user profile. */
  getMe(id: string, role: 'USER' | 'ROOM_OWNER' | 'ADMIN'): any {
    if (role === 'USER') return userRepository.findById(id);
    if (role === 'ROOM_OWNER') return ownerRepository.findById(id);
    if (role === 'ADMIN') return adminRepository.findByUserId(id)?.user;
    return null;
  },
};
