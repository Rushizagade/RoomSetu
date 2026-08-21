import { Router } from 'express';
import { authController } from '../controllers/auth.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';

const router = Router();

// POST /api/auth/send-otp
router.post('/send-otp', (req, res) => authController.sendOtp(req, res));

// POST /api/auth/verify-otp
router.post('/verify-otp', (req, res) => authController.verifyOtp(req, res));

// POST /api/auth/admin-login
router.post('/admin-login', (req, res) => authController.adminLogin(req, res));

// GET /api/auth/me  (protected)
router.get('/me', authenticateToken, (req, res) => authController.getMe(req, res));

// POST /api/auth/demo-switch  (dev helper — no auth required)
router.post('/demo-switch', (req, res) => authController.demoSwitch(req, res));

export default router;
