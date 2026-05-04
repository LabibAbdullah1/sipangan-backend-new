import express from 'express';
import * as adminController from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Semua route di sini diproteksi oleh authMiddleware
router.use(authMiddleware);

// Region CRUD
router.post('/regions', adminController.addRegion);
router.put('/regions/:id', adminController.editRegion);
router.delete('/regions/:id', adminController.removeRegion);

// Bulk Upload Prices (Historis)
router.post('/prices/bulk', adminController.bulkUploadPrices);

// Bulk Upload Predictions (KA)
router.post('/predictions/bulk', adminController.bulkUploadPredictions);

export default router;
