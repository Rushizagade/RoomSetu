import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.ts';
import { authenticateToken } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

const router = Router();

// All admin routes require ADMIN role
router.use(authenticateToken, requireRole(['ADMIN']));

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => adminController.getDashboard(req, res));

// GET /api/admin/properties/pending  — must be before /properties/:id
router.get('/properties/pending', (req, res) => adminController.getPendingProperties(req, res));

// GET /api/admin/properties
router.get('/properties', (req, res) => adminController.getAllProperties(req, res));

// POST /api/admin/properties/:id/approve
router.post('/properties/:id/approve', (req, res) => adminController.approveProperty(req, res));

// POST /api/admin/properties/:id/reject
router.post('/properties/:id/reject', (req, res) => adminController.rejectProperty(req, res));

// PATCH /api/admin/properties/:id/status
router.patch('/properties/:id/status', (req, res) => adminController.setPropertyStatus(req, res));

// GET /api/admin/users
router.get('/users', (req, res) => adminController.getUsers(req, res));

// GET /api/admin/owners
router.get('/owners', (req, res) => adminController.getOwners(req, res));

// PATCH /api/admin/accounts/:type/:id/status
router.patch('/accounts/:type/:id/status', (req, res) => adminController.setAccountStatus(req, res));

// GET /api/admin/reports
router.get('/reports', (req, res) => adminController.getReports(req, res));

// PATCH /api/admin/reports/:id
router.patch('/reports/:id', (req, res) => adminController.moderateReport(req, res));

// GET /api/admin/audit-logs
router.get('/audit-logs', (req, res) => adminController.getAuditLogs(req, res));

export default router;
