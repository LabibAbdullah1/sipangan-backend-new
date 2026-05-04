/**
 * Service untuk logika Kecerdasan Artificial (KA) - ESM
 */
export const calculateStatusLevel = (ma7, latestPrice, het, kaTrend) => {
    const diffPercent = ((latestPrice - ma7) / ma7) * 100;

    // BAHAYA: Harga melonjak >5% dari MA DAN harga aktual > HET
    if (diffPercent > 5 && latestPrice > het) {
        return 'BAHAYA';
    }

    // WASPADA: Harga naik 2%-5% dari MA, ATAU model KA memprediksi tren kenaikan untuk 3 hari ke depan
    if ((diffPercent >= 2 && diffPercent <= 5) || kaTrend === 'UP') {
        return 'WASPADA';
    }

    // AMAN: Harga stabil (-2% hingga +1% dari MA) ATAU harga di bawah Harga Eceran Tertinggi (HET)
    if ((diffPercent >= -2 && diffPercent <= 1) || latestPrice <= het) {
        return 'AMAN';
    }

    return 'AMAN';
};

export const calculateMA = (prices) => {
    if (!prices || prices.length === 0) return 0;
    const sum = prices.reduce((acc, p) => acc + parseFloat(p), 0);
    return sum / prices.length;
};
