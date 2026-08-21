import { Router } from 'express';
import { locationController } from '../controllers/location.controller.ts';

const router = Router();

// GET /api/locations/autocomplete?q=wakad
router.get('/autocomplete', (req, res) => locationController.autocomplete(req, res));

// GET /api/locations/reverse-geocode?lat=18.59&lng=73.76
router.get('/reverse-geocode', (req, res) => locationController.reverseGeocode(req, res));

export default router;
