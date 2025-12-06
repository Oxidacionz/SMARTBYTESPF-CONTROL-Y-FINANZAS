/**
 * Hook para manejar tasas de cambio
 */

import { useState, useEffect } from 'react';
import { ExchangeRates } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const useExchangeRates = () => {
    const [rates, setRates] = useState<ExchangeRates>({
        usd_bcv: 52.50,
        eur_usd: 1.09,
        cop_usd: 4200,
        binance_buy: 52.80,
        binance_sell: 52.20,
        last_updated: new Date().toISOString()
    });

    /**
     * Obtiene las tasas de cambio del backend
     */
    const fetchRates = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/rates`);
            if (!response.ok) throw new Error('Failed to fetch rates');

            const data = await response.json();

            setRates({
                usd_bcv: data.usd_bcv || rates.usd_bcv,
                eur_usd: data.eur_usd || rates.eur_usd,
                cop_usd: data.cop_usd || rates.cop_usd,
                binance_buy: data.binance_buy || rates.binance_buy,
                binance_sell: data.binance_sell || rates.binance_sell,
                last_updated: data.last_updated || new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
        }
    };

    /**
     * Actualiza las tasas manualmente
     */
    const handleRateUpdate = (newRates: Partial<ExchangeRates>) => {
        setRates(prev => ({
            ...prev,
            ...newRates,
            last_updated: new Date().toISOString()
        }));
    };

    // Cargar tasas al montar el componente
    useEffect(() => {
        fetchRates();

        // Actualizar cada 5 minutos
        const interval = setInterval(fetchRates, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return {
        rates,
        setRates,
        handleRateUpdate,
        fetchRates,
    };
};
