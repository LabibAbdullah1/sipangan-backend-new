import pool from '../config/database.js';

/**
 * Service untuk Pengelolaan Data (CRUD) oleh Admin
 */

// --- Regions CRUD ---
export const createRegion = async (data) => {
    const { name, type, latitude, longitude } = data;
    const [result] = await pool.query(
        'INSERT INTO regions (name, type, latitude, longitude) VALUES (?, ?, ?, ?)',
        [name, type, latitude, longitude]
    );
    return result.insertId;
};

export const updateRegion = async (id, data) => {
    const { name, type, latitude, longitude } = data;
    await pool.query(
        'UPDATE regions SET name = ?, type = ?, latitude = ?, longitude = ? WHERE id = ?',
        [name, type, latitude, longitude, id]
    );
};

export const deleteRegion = async (id) => {
    await pool.query('DELETE FROM regions WHERE id = ?', [id]);
};

// --- Price Management & Bulking ---
/**
 * Bulk insert untuk data harga historis
 * @param {Array} data Array of [region_id, commodity_id, price_date, price]
 */
export const bulkInsertPrices = async (data) => {
    const [result] = await pool.query(
        'INSERT INTO historical_prices (region_id, commodity_id, price_date, price) VALUES ? ' +
        'ON DUPLICATE KEY UPDATE price = VALUES(price)',
        [data]
    );
    return result.affectedRows;
};

/**
 * Bulk insert untuk data prediksi KA
 * @param {Array} data Array of [region_id, commodity_id, target_date, predicted_price]
 */
export const bulkInsertPredictions = async (data) => {
    const [result] = await pool.query(
        'INSERT INTO prediction_prices (region_id, commodity_id, target_date, predicted_price) VALUES ? ' +
        'ON DUPLICATE KEY UPDATE predicted_price = VALUES(predicted_price)',
        [data]
    );
    return result.affectedRows;
};

export const createPrice = async (data) => {
    const { region_id, commodity_id, price_date, price } = data;
    await pool.query(
        'INSERT INTO historical_prices (region_id, commodity_id, price_date, price) VALUES (?, ?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE price = ?',
        [region_id, commodity_id, price_date, price, price]
    );
};
