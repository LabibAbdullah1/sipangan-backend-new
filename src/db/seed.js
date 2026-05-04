import pool from '../config/database.js';

/**
 * Script untuk membuat data dummy SIPANGAN (ESM)
 * Menghasilkan:
 * - 38 Wilayah (Jawa Timur)
 * - 1 Komoditas (Beras Medium)
 * - 100 Data Historis per wilayah (Total 3800)
 * - 3 Data Prediksi KA per wilayah
 */
const seedData = async () => {
    try {
        console.log('--- SIPANGAN SEEDER START ---');

        // 1. Daftar 38 Kabupaten/Kota di Jawa Timur
        const regions = [
            ['Kabupaten Bangkalan', 'KABUPATEN', -7.0455, 112.7475],
            ['Kabupaten Banyuwangi', 'KABUPATEN', -8.2192, 114.3691],
            ['Kabupaten Blitar', 'KABUPATEN', -8.1308, 112.2201],
            ['Kabupaten Bojonegoro', 'KABUPATEN', -7.1513, 111.8817],
            ['Kabupaten Bondowoso', 'KABUPATEN', -7.9135, 113.8215],
            ['Kabupaten Gresik', 'KABUPATEN', -7.1566, 112.6555],
            ['Kabupaten Jember', 'KABUPATEN', -8.1724, 113.7003],
            ['Kabupaten Jombang', 'KABUPATEN', -7.5461, 112.2331],
            ['Kabupaten Kediri', 'KABUPATEN', -7.8307, 112.0119],
            ['Kabupaten Lamongan', 'KABUPATEN', -7.1190, 112.4150],
            ['Kabupaten Lumajang', 'KABUPATEN', -8.1331, 113.2249],
            ['Kabupaten Madiun', 'KABUPATEN', -7.5503, 111.6603],
            ['Kabupaten Magetan', 'KABUPATEN', -7.6534, 111.3533],
            ['Kabupaten Malang', 'KABUPATEN', -8.1333, 112.5667],
            ['Kabupaten Mojokerto', 'KABUPATEN', -7.4727, 112.4381],
            ['Kabupaten Nganjuk', 'KABUPATEN', -7.6024, 111.9015],
            ['Kabupaten Ngawi', 'KABUPATEN', -7.4042, 111.4447],
            ['Kabupaten Pacitan', 'KABUPATEN', -8.2031, 111.0921],
            ['Kabupaten Pamekasan', 'KABUPATEN', -7.1554, 113.4820],
            ['Kabupaten Pasuruan', 'KABUPATEN', -7.6444, 112.9031],
            ['Kabupaten Ponorogo', 'KABUPATEN', -7.8669, 111.4666],
            ['Kabupaten Probolinggo', 'KABUPATEN', -7.7521, 113.2159],
            ['Kabupaten Sampang', 'KABUPATEN', -7.1479, 113.2431],
            ['Kabupaten Sidoarjo', 'KABUPATEN', -7.4478, 112.7183],
            ['Kabupaten Situbondo', 'KABUPATEN', -7.7068, 113.9961],
            ['Kabupaten Sumenep', 'KABUPATEN', -7.0084, 113.8621],
            ['Kabupaten Trenggalek', 'KABUPATEN', -8.0503, 111.7131],
            ['Kabupaten Tuban', 'KABUPATEN', -6.9014, 112.0573],
            ['Kabupaten Tulungagung', 'KABUPATEN', -8.0724, 111.9051],
            ['Kota Batu', 'KOTA', -7.8711, 112.5268],
            ['Kota Blitar', 'KOTA', -8.0983, 112.1681],
            ['Kota Kediri', 'KOTA', -7.8167, 112.0167],
            ['Kota Madiun', 'KOTA', -7.6298, 111.5239],
            ['Kota Malang', 'KOTA', -7.9839, 112.6214],
            ['Kota Mojokerto', 'KOTA', -7.4705, 112.4335],
            ['Kota Pasuruan', 'KOTA', -7.6449, 112.9037],
            ['Kota Probolinggo', 'KOTA', -7.7543, 113.2159],
            ['Kota Surabaya', 'KOTA', -7.2575, 112.7521]
        ];

        console.log('Inserting 38 Regions...');
        await pool.query('DELETE FROM historical_prices');
        await pool.query('DELETE FROM prediction_prices');
        await pool.query('DELETE FROM regions');
        await pool.query('INSERT INTO regions (name, type, latitude, longitude) VALUES ?', [regions]);

        // 2. Seed Commodities
        console.log('Inserting Commodity...');
        await pool.query('DELETE FROM commodities');
        await pool.query('INSERT INTO commodities (id, name, unit, het) VALUES (1, "Beras Medium", "kg", 10900)');

        const [regionRows] = await pool.query('SELECT id FROM regions');
        const historicalData = [];
        const predictionData = [];
        const today = new Date();

        console.log('Generating 100 days of history for each region...');
        for (const region of regionRows) {
            let lastPrice = 10500 + (Math.random() * 1000); // Start price around 10.5k - 11.5k

            for (let i = 99; i >= 0; i--) {
                const date = new Date();
                date.setDate(today.getDate() - i);
                const formattedDate = date.toISOString().split('T')[0];
                
                // Random walk price (volatility +/- 100 per day)
                const change = (Math.random() * 200) - 95;
                lastPrice += change;
                
                historicalData.push([region.id, 1, formattedDate, Math.max(9000, lastPrice)]);
            }

            // Generate 3 days prediction (KA Model)
            for (let j = 1; j <= 3; j++) {
                const date = new Date();
                date.setDate(today.getDate() + j);
                const formattedDate = date.toISOString().split('T')[0];
                
                // Trend based on last price
                const trend = (Math.random() * 300) - 100; // Slighly more likely to go up
                const predictedPrice = lastPrice + trend;
                
                predictionData.push([region.id, 1, formattedDate, Math.max(9000, predictedPrice)]);
            }
        }

        console.log(`Bulk inserting ${historicalData.length} historical records...`);
        // Batching for performance if needed, but 3800 is fine for bulk
        await pool.query('INSERT INTO historical_prices (region_id, commodity_id, price_date, price) VALUES ?', [historicalData]);

        console.log(`Bulk inserting ${predictionData.length} prediction records...`);
        await pool.query('INSERT INTO prediction_prices (region_id, commodity_id, target_date, predicted_price) VALUES ?', [predictionData]);

        console.log('--- SIPANGAN SEEDER COMPLETED ---');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
