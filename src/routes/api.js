import express from 'express';
import * as mapController from '../controllers/mapController.js';
import * as authController from '../controllers/authController.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

// --- Public Routes ---
// Map Status & Trends
router.get('/map-status', mapController.getMapStatus);
router.get('/regions/:regionId/trend', mapController.getRegionTrend);

// Auth
router.post('/auth/login', authController.login);
router.post('/auth/register-dev-only', authController.register); // Untuk inisialisasi admin pertama kali

// --- Admin Routes (Protected) ---
router.use('/admin', adminRoutes);

export default router;
