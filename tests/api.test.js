import { jest } from '@jest/globals';
import request from 'supertest';

// Mocking the service instead of the low-level clients
jest.unstable_mockModule('../src/services/mapService.js', () => ({
    getCachedMapStatus: jest.fn(),
    getHistoricalPrices: jest.fn(),
    getKAPredictions: jest.fn(),
}));

// Mock the DB and Redis configs to prevent real connections
jest.unstable_mockModule('../src/config/database.js', () => ({
    default: { query: jest.fn(), execute: jest.fn() }
}));
jest.unstable_mockModule('../src/config/redis.js', () => ({
    default: { get: jest.fn(), set: jest.fn(), on: jest.fn(), connect: jest.fn() }
}));

// Now import the app and the mocked service
const app = (await import('../src/app.js')).default;
const mapService = await import('../src/services/mapService.js');

describe('SIPANGAN API Endpoints', () => {
    
    test('GET / should return welcome message', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.body.engine).toContain('KA');
    });

    test('GET /api/v1/map-status should return cached data', async () => {
        const mockData = [{ region_id: 1, status_level: 'AMAN' }];
        mapService.getCachedMapStatus.mockResolvedValue(mockData);

        const res = await request(app).get('/api/v1/map-status?commodity_id=1');
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toEqual(mockData);
    });

    test('GET /api/v1/map-status should return 404 if cache is empty', async () => {
        mapService.getCachedMapStatus.mockResolvedValue(null);

        const res = await request(app).get('/api/v1/map-status?commodity_id=1');
        
        expect(res.statusCode).toEqual(404);
    });
});
