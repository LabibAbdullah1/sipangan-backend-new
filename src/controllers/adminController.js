import * as adminService from '../services/adminService.js';
import { success, error } from '../utils/response.js';

/**
 * Controller untuk Pengelolaan Data Admin
 */

// --- Region Handlers ---
export const addRegion = async (req, res, next) => {
    try {
        const id = await adminService.createRegion(req.body);
        return success(res, { id }, 'Region created successfully', 201);
    } catch (err) {
        next(err);
    }
};

export const editRegion = async (req, res, next) => {
    try {
        await adminService.updateRegion(req.params.id, req.body);
        return success(res, null, 'Region updated successfully');
    } catch (err) {
        next(err);
    }
};

export const removeRegion = async (req, res, next) => {
    try {
        await adminService.deleteRegion(req.params.id);
        return success(res, null, 'Region deleted successfully');
    } catch (err) {
        next(err);
    }
};

// --- Price & Bulk Handlers ---
export const bulkUploadPrices = async (req, res, next) => {
    const { prices } = req.body; // Expecting array of objects

    if (!Array.isArray(prices) || prices.length === 0) {
        return error(res, 'Prices array is required', 400);
    }

    try {
        // Map objects to array of arrays for MySQL bulk insert
        const data = prices.map(p => [
            p.region_id, 
            p.commodity_id, 
            p.price_date, 
            p.price
        ]);

        const affectedRows = await adminService.bulkInsertPrices(data);
        return success(res, { affectedRows }, `${affectedRows} prices synchronized successfully`);
    } catch (err) {
        next(err);
    }
};

export const bulkUploadPredictions = async (req, res, next) => {
    const { predictions } = req.body;

    if (!Array.isArray(predictions) || predictions.length === 0) {
        return error(res, 'Predictions array is required', 400);
    }

    try {
        const data = predictions.map(p => [
            p.region_id, 
            p.commodity_id, 
            p.target_date, 
            p.predicted_price
        ]);

        const affectedRows = await adminService.bulkInsertPredictions(data);
        return success(res, { affectedRows }, `${affectedRows} KA predictions synchronized successfully`);
    } catch (err) {
        next(err);
    }
};
