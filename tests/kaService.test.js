import { calculateStatusLevel, calculateMA } from '../src/services/kaService.js';

describe('KA Service - Status Level Calculation', () => {
    const HET = 10000;

    test('should return AMAN when price is stable (-1% from MA)', () => {
        const ma7 = 10000;
        const latestPrice = 9900;
        const result = calculateStatusLevel(ma7, latestPrice, HET, 'STABLE');
        expect(result).toBe('AMAN');
    });

    test('should return AMAN when price is below HET regardless of MA', () => {
        const ma7 = 8000;
        const latestPrice = 9000; // Above MA, but below HET
        const result = calculateStatusLevel(ma7, latestPrice, HET, 'STABLE');
        expect(result).toBe('AMAN');
    });

    test('should return WASPADA when price increases by 3% from MA', () => {
        const ma7 = 10000;
        const latestPrice = 10300; // 3% increase
        const result = calculateStatusLevel(ma7, latestPrice, HET, 'STABLE');
        expect(result).toBe('WASPADA');
    });

    test('should return WASPADA when KA trend is UP', () => {
        const ma7 = 10000;
        const latestPrice = 10000;
        const result = calculateStatusLevel(ma7, latestPrice, HET, 'UP');
        expect(result).toBe('WASPADA');
    });

    test('should return BAHAYA when price increases >5% AND above HET', () => {
        const ma7 = 10000;
        const latestPrice = 11000; // 10% increase AND > HET
        const result = calculateStatusLevel(ma7, latestPrice, HET, 'STABLE');
        expect(result).toBe('BAHAYA');
    });

    test('calculateMA should return correct average', () => {
        const prices = [100, 200, 300];
        expect(calculateMA(prices)).toBe(200);
    });
});
