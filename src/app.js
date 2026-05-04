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

// API Routes
app.use('/api/v1', apiRoutes);

// Root
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to SIPANGAN API',
        version: '1.0.0',
        engine: 'KA (Kecerdasan Artificial) Optimized',
        module_type: 'ESM'
    });
});

// Global Error Handler
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`SIPANGAN Backend is running on port http://localhost:${PORT} (ESM Mode)`);
});

export default app;
