import cron from 'node-cron';
import * as mapService from '../services/mapService.js';
import * as kaService from '../services/kaService.js';
import * as integrationService from '../services/integrationService.js';

/**
 * Job Utama SIPANGAN (Pekerjaan Belakang Layar)
 * Berjalan setiap jam 12 malam (00:00)
 * Tugas: 
 * 1. Sync data ke model KA (FastAPI)
 * 2. Ambil prediksi terbaru dari model KA
 * 3. Hitung status level hibrida
 * 4. Update Cache Redis untuk Dashboard
 */
export const runStatusUpdateJob = async () => {
    console.log('--- STARTING MIDNIGHT KA PROCESSING ---');
    
    try {
        const commodities = await mapService.getAllCommodities();
        const regions = await mapService.getAllRegions();
        
        for (const commodity of commodities) {
            const mapStatus = [];

            for (const region of regions) {
                // 1. Ambil data historis terbaru
                const history = await mapService.getHistoricalPrices(region.id, commodity.id, 30); // Ambil 30 hari terakhir
                if (history.length === 0) continue;

                // 2. INTEGRASI KA: Push data ke FastAPI & Tarik Prediksi (Pekerjaan Belakang Layar)
                try {
                    // Kita kirim data historis ke AI untuk dianalisa
                    await integrationService.syncDataToKAModel(region.id, commodity.id, history);
                    
                    // Kita tarik hasil prediksi terbaru (3 hari ke depan)
                    await integrationService.fetchAndSyncPredictions(region.id, commodity.id);
                } catch (aiError) {
                    console.warn(`AI Integration skipped for region ${region.id}:`, aiError.message);
                    // Tetap lanjut meskipun AI gagal, menggunakan data yang ada
                }

                // 3. Ambil data setelah disinkronisasi untuk kalkulasi status
                const latestPrice = history[0].price;
                const pricesOnly = history.slice(0, 7).map(h => h.price); // MA 7 hari
                const ma7 = kaService.calculateMA(pricesOnly);

                // Ambil prediksi KA terbaru dari DB (yang baru saja ditarik dari AI)
                const predictions = await mapService.getKAPredictions(region.id, commodity.id, 3);

                let kaTrend = 'STABLE';
                if (predictions.length > 0) {
                    const predPricesOnly = predictions.map(p => p.price);
                    const avgPrediction = kaService.calculateMA(predPricesOnly);
                    if (avgPrediction > latestPrice) {
                        kaTrend = 'UP';
                    }
                }

                const statusLevel = kaService.calculateStatusLevel(
                    ma7, 
                    latestPrice, 
                    commodity.het, 
                    kaTrend
                );

                mapStatus.push({
                    region_id: region.id,
                    region_name: region.name,
                    latest_price: latestPrice,
                    status_level: statusLevel
                });
            }

            // 4. Update Cache Redis (Untuk performa sub-50ms)
            if (mapStatus.length > 0) {
                await mapService.updateMapStatusCache(commodity.id, mapStatus);
                console.log(`Successfully updated Map Status for ${commodity.name}`);
            }
        }
        console.log('--- MIDNIGHT KA PROCESSING COMPLETED ---');
    } catch (error) {
        console.error('Critical Error in Midnight Job:', error);
    }
};

// Menjalankan pekerjaan di belakang layar setiap jam 12 malam
cron.schedule('0 0 * * *', runStatusUpdateJob);

export default runStatusUpdateJob;
