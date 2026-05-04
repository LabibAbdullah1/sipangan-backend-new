import { createClient } from 'redis';
import 'dotenv/config';

const client = createClient({
    socket: {
        path: process.env.REDIS_PATH || '/home/sublymyi/redis/redis.sock',
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('KA (Kecerdasan Artificial) Log - Redis: Max retries reached.');
                return new Error('Max retries reached');
            }
            return Math.min(retries * 500, 5000);
        },
        connectTimeout: 5000
    }
});

// Penanganan Event Tanpa Mengubah Properti Read-Only
client.on('error', (err) => {
    console.error('Redis Client Error:', err.message);
});

client.on('connect', () => {
    console.log('Redis Client Connecting...');
});

client.on('ready', () => {
    console.log('Connected to Redis (ESM) and Ready');
});

client.on('end', () => {
    console.log('Redis Connection Ended');
});

// Menjalankan koneksi tanpa blocking startup
client.connect().catch((err) => {
    console.error('Redis connection failed initially. Error:', err.message);
});

export default client;
