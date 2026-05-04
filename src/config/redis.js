import { createClient } from 'redis';
import 'dotenv/config';

const client = createClient({
    // url: process.env.REDIS_URL,
    socket: {
        path: '/home/sublymyi/redis/redis.sock',
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redis: Max retries reached. Stopping reconnection.');
                return new Error('Max retries reached');
            }
            return Math.min(retries * 500, 5000);
        },
        connectTimeout: 5000
    }
});

client.isReady = false;

client.on('error', (err) => {
    client.isReady = false;
    console.error('Redis Client Error:', err.message);
});

client.on('connect', () => {
    client.isReady = true;
    console.log('Connected to Redis (ESM)');
});

client.on('ready', () => {
    client.isReady = true;
});

client.on('end', () => {
    client.isReady = false;
});

// We don't await connect() here to prevent blocking app startup
client.connect().catch((err) => {
    console.error('Redis connection failed initially, but app will continue. Error:', err.message);
});

export default client;
