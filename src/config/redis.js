import { createClient } from 'redis';
import 'dotenv/config';

const client = createClient({
    url: process.env.REDIS_URL
});

client.on('error', (err) => console.error('Redis Client Error', err));

(async () => {
    try {
        await client.connect();
        console.log('Connected to Redis (ESM)');
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
})();

export default client;
