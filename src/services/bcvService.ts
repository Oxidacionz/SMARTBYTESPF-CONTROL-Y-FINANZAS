import { ExchangeRates } from '../types';

const BCV_API_URL = 'http://localhost:8000/tasas';
const BINANCE_API_URL = 'http://localhost:8000/p2p/promedio-usdt-ves';

export const bcvService = {
    getRates: async (): Promise<Partial<ExchangeRates> | null> => {
        try {
            const response = await fetch(BCV_API_URL);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();

            // Validar datos
            if (typeof data.USD !== 'number' || typeof data.EUR !== 'number') {
                console.warn('Invalid data format from BCV API:', data);
                return null;
            }

            return {
                usd_bcv: data.USD,
                eur_bcv: data.EUR,
                lastUpdated: data.date
            };
        } catch (error) {
            console.error('Error fetching BCV rates:', error);
            return null;
        }
    },

    getAllRates: async (): Promise<Partial<ExchangeRates> | null> => {
        try {
            // Fetch both BCV and Binance rates in parallel
            const [bcvResponse, binanceResponse] = await Promise.all([
                fetch(BCV_API_URL),
                fetch(BINANCE_API_URL)
            ]);

            const result: Partial<ExchangeRates> = {};

            // Process BCV rates
            if (bcvResponse.ok) {
                const bcvData = await bcvResponse.json();
                if (typeof bcvData.USD === 'number' && typeof bcvData.EUR === 'number') {
                    result.usd_bcv = bcvData.USD;
                    result.eur_bcv = bcvData.EUR;
                    result.lastUpdated = bcvData.date;
                }
            }

            // Process Binance rates
            if (binanceResponse.ok) {
                const binanceData = await binanceResponse.json();
                if (typeof binanceData.promedio_compra_ves === 'number' && typeof binanceData.promedio_venta_ves === 'number') {
                    result.usd_binance_buy = binanceData.promedio_compra_ves;
                    result.usd_binance_sell = binanceData.promedio_venta_ves;
                }
            }

            return Object.keys(result).length > 0 ? result : null;
        } catch (error) {
            console.error('Error fetching rates:', error);
            return null;
        }
    }
};
