import { ExchangeRates } from '../types';

// Backend API endpoints - use environment variable in production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const RATES_API_URL = `${API_BASE_URL}/api/rates`;
const BINANCE_API_URL = `${API_BASE_URL}/p2p/promedio-usdt-ves`;

interface RatesApiResponse {
    success: boolean;
    data: {
        usd_bcv: number;
        eur_bcv: number;
        usd_binance: number | null;
        timestamp: string;
    };
    source: string;
}

export interface FetchBCVRatesResponse {
    success: boolean;
    data?: ExchangeRates;
    error?: string;
}

/**
 * Fetch exchange rates from backend API
 * This ensures all devices get the same rates from the database
 */
export const fetchBCVRates = async (): Promise<FetchBCVRatesResponse> => {
    try {
        const response = await fetch(RATES_API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const apiData: RatesApiResponse = await response.json();

        if (!apiData.success || !apiData.data) {
            return {
                success: false,
                error: 'Invalid response from server'
            };
        }

        // Transform API response to ExchangeRates format
        const rates: ExchangeRates = {
            usd_bcv: apiData.data.usd_bcv,
            eur_bcv: apiData.data.eur_bcv,
            usd_binance: apiData.data.usd_binance || 0,
            lastUpdated: apiData.data.timestamp
        };

        return {
            success: true,
            data: rates
        };

    } catch (error) {
        console.error('Error fetching rates from backend:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
};

/**
 * Legacy service object for backward compatibility
 * @deprecated Use fetchBCVRates instead
 */
export const bcvService = {
    getRates: async (): Promise<Partial<ExchangeRates> | null> => {
        const result = await fetchBCVRates();
        return result.success && result.data ? result.data : null;
    },

    getAllRates: async (): Promise<Partial<ExchangeRates> | null> => {
        try {
            // Fetch both rates from new API and Binance
            const [ratesResult, binanceResponse] = await Promise.all([
                fetchBCVRates(),
                fetch(BINANCE_API_URL).catch(() => null)
            ]);

            const result: Partial<ExchangeRates> = {};

            // Process rates from backend
            if (ratesResult.success && ratesResult.data) {
                result.usd_bcv = ratesResult.data.usd_bcv;
                result.eur_bcv = ratesResult.data.eur_bcv;
                result.usd_binance = ratesResult.data.usd_binance;
                result.lastUpdated = ratesResult.data.lastUpdated;
            }

            // Process Binance rates if available
            if (binanceResponse && binanceResponse.ok) {
                const binanceData = await binanceResponse.json();
                if (typeof binanceData.promedio_compra_ves === 'number' && typeof binanceData.promedio_venta_ves === 'number') {
                    // Use average of buy/sell for usd_binance
                    result.usd_binance = (binanceData.promedio_compra_ves + binanceData.promedio_venta_ves) / 2;
                }
            }

            return Object.keys(result).length > 0 ? result : null;
        } catch (error) {
            console.error('Error fetching all rates:', error);
            return null;
        }
    }
};
