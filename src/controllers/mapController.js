import * as mapService from '../services/mapService.js';
import { success, error } from '../utils/response.js';

/**
 * Controller untuk menangani data pemetaan dan tren SIPANGAN (ESM)
 */
export const getMapStatus = async (req, res, next) => {
    const { commodity_id } = req.query;

    if (!commodity_id) {
        return error(res, 'commodity_id is required', 400);
    }

    try {
        const cachedData = await mapService.getCachedMapStatus(commodity_id);

        if (!cachedData) {
            return error(res, 'Data not found in cache. Ensure Cron Job has run.', 404);
        }

        return success(res, cachedData, 'Map status fetched successfully');
    } catch (err) {
        next(err);
    }
};

export const getRegionTrend = async (req, res, next) => {
    const { regionId } = req.params;
    const { commodity_id } = req.query;

    if (!commodity_id) {
        return error(res, 'commodity_id is required', 400);
    }

    try {
        const history = await mapService.getHistoricalPrices(regionId, commodity_id);
        const predictions = await mapService.getKAPredictions(regionId, commodity_id);

        const data = {
            region_id: regionId,
            commodity_id: commodity_id,
            historical: history.reverse(),
            ka_predictions: predictions
        };

        return success(res, data, 'Region trend fetched successfully');
    } catch (err) {
        next(err);
    }
};
