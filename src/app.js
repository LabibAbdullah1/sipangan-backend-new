import express from 'express';
import cors from 'cors';
import 'dotenv/config';

// Connections
import './config/database.js';
import './config/redis.js';

// Jobs
import './jobs/statusJob.js';

// Routes & Middleware
import apiRoutes from './routes/api.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Log Memory Usage on Startup
const memoryUsage = process.memoryUsage();
console.log('--- SYSTEM STATUS ---');
console.log(`Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
console.log(`Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
console.log(`RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
console.log('---------------------');

// API Routes
app.use('/api/v1', apiRoutes);

// Health Check (Penting untuk monitoring di cPanel)
app.get('/api/v1/health', (req, res) => {
    res.json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        memory: {
            heapUsed: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
            rss: `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`
        }
    });
});

// Root
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to SIPANGAN API',
        version: '1.0.0',
        engine: 'KA (Kecerdasan Artificial) Optimized',
        module_type: 'ESM',
        environment: process.env.NODE_ENV
    });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`SIPANGAN Backend is running on port http://localhost:${PORT} (ESM Mode)`);
    console.log('Optimization: 2GB RAM & cPanel Ready');
});

export default app;
