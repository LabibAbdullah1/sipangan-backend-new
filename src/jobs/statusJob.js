import cron from 'node-cron';
import * as mapService from '../services/mapService.js';
import * as kaService from '../services/kaService.js';
import * as integrationService from '../services/integrationService.js';

// Helper untuk memberi jeda (breathing room) bagi CPU & RAM
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Job Utama SIPANGAN (Pekerjaan Belakang Layar)
 * Berjalan setiap jam 12 malam (00:00)
 */
export const runStatusUpdateJob = async () => {
    console.log('--- [KA JOB] STARTING PROCESSING ---');
    const startTime = Date.now();
    
    try {
        const commodities = await mapService.getAllCommodities();
        const regions = await mapService.getAllRegions();
        
        console.log(`[KA JOB] Processing ${commodities.length} commodities across ${regions.length} regions...`);

        for (const commodity of commodities) {
            console.log(`[KA JOB] -> Processing commodity: ${commodity.name}`);
            const mapStatus = [];

            // Kita proses region dalam kelompok kecil (misal: 5 region sekaligus) 
            // atau satu per satu dengan jeda untuk menjaga RAM
            for (const region of regions) {
                try {
                    // 1. Ambil data historis
                    const history = await mapService.getHistoricalPrices(region.id, commodity.id, 30);
                    if (history.length === 0) continue;

                    // 2. INTEGRASI KA: Push & Pull (FastAPI)
                    try {
                        await integrationService.syncDataToKAModel(region.id, commodity.id, history);
                        await integrationService.fetchAndSyncPredictions(region.id, commodity.id);
                    } catch (aiError) {
                        // Jika AI gagal, kita tetap lanjut dengan data yang ada
                        console.warn(`[KA JOB] AI Integration failed for region ${region.id}:`, aiError.message);
                    }

                    // 3. Kalkulasi Status Hibrida
                    const latestPrice = history[0].price;
                    const pricesOnly = history.slice(0, 7).map(h => h.price);
                    const ma7 = kaService.calculateMA(pricesOnly);

                    const predictions = await mapService.getKAPredictions(region.id, commodity.id, 3);

                    let kaTrend = 'STABLE';
                    if (predictions.length > 0) {
                        const predPricesOnly = predictions.map(p => p.price);
                        const avgPrediction = kaService.calculateMA(predPricesOnly);
                        if (avgPrediction > latestPrice) kaTrend = 'UP';
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

                    // BERI JEDA: Sangat penting untuk cPanel 2GB RAM
                    // Memberi waktu bagi Garbage Collector (GC) untuk bekerja
                    await sleep(50); 

                } catch (regionError) {
                    console.error(`[KA JOB] Error processing region ${region.id}:`, regionError.message);
                }
            }

            // 4. Update Cache Redis
            if (mapStatus.length > 0) {
                await mapService.updateMapStatusCache(commodity.id, mapStatus);
                console.log(`[KA JOB] Successfully updated cache for ${commodity.name}`);
            }

            // Jeda antar komoditas lebih lama sedikit
            await sleep(500);
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`--- [KA JOB] COMPLETED IN ${duration}s ---`);

    } catch (error) {
        console.error('[KA JOB] CRITICAL ERROR:', error);
    }
};

// Menjalankan pekerjaan di belakang layar setiap jam 12 malam
cron.schedule('0 0 * * *', runStatusUpdateJob);

export default runStatusUpdateJob;
