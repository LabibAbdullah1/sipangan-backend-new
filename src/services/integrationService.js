import axios from 'axios';
import * as adminService from './adminService.js';

/**
 * Service untuk integrasi dengan Model KA (Kecerdasan Artificial)
 * Menghubungkan Backend Node.js dengan FastAPI (Python) LSTM
 */
const KA_MODEL_URL = process.env.KA_MODEL_URL || 'http://localhost:8000';

/**
 * Mengirim data historis ke FastAPI untuk diproses oleh model LSTM
 * @param {number} regionId 
 * @param {number} commodityId 
 * @param {Array} history Data historis harga
 */
export const syncDataToKAModel = async (regionId, commodityId, history) => {
    try {
        console.log(`Pushing data to KA Model for region ${regionId}...`);
        
        const response = await axios.post(`${KA_MODEL_URL}/analyze`, {
            region_id: regionId,
            commodity_id: commodityId,
            data: history
        });

        return response.data;
    } catch (error) {
        console.error('Error syncing to KA Model:', error.message);
        throw new Error('KA Model Integration Failed');
    }
};

/**
 * Mengambil hasil prediksi dari FastAPI dan menyimpannya ke MySQL
 */
export const fetchAndSyncPredictions = async (regionId, commodityId) => {
    try {
        console.log(`Fetching predictions from KA Model for region ${regionId}...`);
        
        const response = await axios.get(`${KA_MODEL_URL}/predict`, {
            params: { region_id: regionId, commodity_id: commodityId }
        });

        const predictions = response.data.predictions; // Expecting [{ date, price }, ...]

        if (predictions && predictions.length > 0) {
            // Format data untuk bulk insert
            const bulkData = predictions.map(p => [
                regionId,
                commodityId,
                p.date,
                p.price
            ]);

            await adminService.bulkInsertPredictions(bulkData);
            console.log(`Predictions for region ${regionId} synced successfully.`);
        }

        return predictions;
    } catch (error) {
        console.error('Error fetching from KA Model:', error.message);
        return null;
    }
};
