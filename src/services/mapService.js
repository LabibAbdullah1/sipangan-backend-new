import pool from '../config/database.js';
import redisClient from '../config/redis.js';

/**
 * Service untuk menangani data pemetaan dan harga (ESM)
 */
export const getCachedMapStatus = async (commodityId) => {
    const data = await redisClient.get(`sipangan:map_status:commodity_${commodityId}`);
    return data ? JSON.parse(data) : null;
};

export const getHistoricalPrices = async (regionId, commodityId, limit = 7) => {
    const [rows] = await pool.query(
        `SELECT price_date as date, price 
         FROM historical_prices 
         WHERE region_id = ? AND commodity_id = ? 
         ORDER BY price_date DESC LIMIT ?`,
        [regionId, commodityId, limit]
    );
    return rows;
};

export const getKAPredictions = async (regionId, commodityId, limit = 3) => {
    const [rows] = await pool.query(
        `SELECT target_date as date, predicted_price as price 
         FROM prediction_prices 
         WHERE region_id = ? AND commodity_id = ? AND target_date > CURDATE()
         ORDER BY target_date ASC LIMIT ?`,
        [regionId, commodityId, limit]
    );
    return rows;
};

export const getAllRegions = async () => {
    const [rows] = await pool.query('SELECT * FROM regions');
    return rows;
};

export const getAllCommodities = async () => {
    const [rows] = await pool.query('SELECT * FROM commodities');
    return rows;
};

export const updateMapStatusCache = async (commodityId, data) => {
    await redisClient.set(
        `sipangan:map_status:commodity_${commodityId}`,
        JSON.stringify(data)
    );
};
