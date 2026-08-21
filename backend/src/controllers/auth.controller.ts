import { Request, Response } from 'express';
import { otpService } from '../services/otp.service.ts';
import { authService } from '../services/auth.service.ts';
import { sendSuccess, sendCreated } from '../utils/response.ts';
import { BadRequestError, NotFoundError } from '../utils/errors.ts';

export const authController = {
  sendOtp(req: Request, res: Response): void {
    const { phone, role } = req.body;

    if (!phone || !/^\d{10}$/.test(phone)) {
      throw new BadRequestError('Please provide a valid 10-digit mobile number', 'INVALID_PHONE');
    }
    if (role !== 'USER' && role !== 'ROOM_OWNER') {
      throw new BadRequestError('Role must be USER or ROOM_OWNER', 'INVALID_ROLE');
    }

    const otpCode = otpService.generate(phone, role);

    sendSuccess(res, {
      message: `OTP sent successfully to +91 ${phone}`,
      devOtp: otpCode,
      expiresInSeconds: 600,
    });
  },

  verifyOtp(req: Request, res: Response): void {
    const { phone, role, code, name } = req.body;

    if (!phone || !code || !role) {
      throw new BadRequestError('Phone, role, and OTP code are required.', 'MISSING_FIELDS');
    }

    const isValid = otpService.verify(phone, role as 'USER' | 'ROOM_OWNER', code);
    if (!isValid) {
      throw new BadRequestError('Invalid or expired OTP. Please enter 123456.', 'INVALID_OTP');
    }

    let result: any;
    if (role === 'USER') {
      result = authService.loginOrRegisterUser(phone, name);
    } else {
      result = authService.loginOrRegisterOwner(phone, name);
    }

    sendSuccess(res, { token: result.token, user: result.user });
  },

  adminLogin(req: Request, res: Response): void {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required', 'MISSING_CREDENTIALS');
    }

    const { user, token } = authService.adminLogin(email, password);
    sendSuccess(res, { token, user });
  },

  getMe(req: Request, res: Response): void {
    const { id, role } = req.user!;
    const user = authService.getMe(id, role as any);

    if (!user) {
      throw new NotFoundError('User not found', 'USER_NOT_FOUND');
    }

    sendSuccess(res, { user });
  },

  demoSwitch(req: Request, res: Response): void {
    const { targetRole } = req.body;

    if (!['USER', 'ROOM_OWNER', 'ADMIN'].includes(targetRole)) {
      throw new BadRequestError('Invalid target role', 'INVALID_ROLE');
    }

    const { user, token } = authService.demoSwitch(targetRole);
    sendSuccess(res, { token, user });
  },
};
