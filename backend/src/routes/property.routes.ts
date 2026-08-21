import { Router } from 'express';
import { propertyController } from '../controllers/property.controller.ts';
import { authenticateToken, optionalAuth } from '../middlewares/authenticate.ts';
import { requireRole } from '../middlewares/authorize.ts';

const router = Router();

// GET /api/properties/search  (public, optional auth to tag isSaved)
router.get('/search', optionalAuth, (req, res) => propertyController.search(req, res));

// GET /api/properties/:id  (public, optional auth)
router.get('/:id', optionalAuth, (req, res) => propertyController.getById(req, res));

// POST /api/properties/:id/reports  (USER only)
router.post(
  '/:id/reports',
  authenticateToken,
  requireRole(['USER']),
  (req, res) => propertyController.reportProperty(req, res)
);

export default router;
