/**
 * Hook para manejar tasas de cambio
 * Lee directamente de Supabase para asegurar sincronización entre dispositivos
 */

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ExchangeRates } from '../types';

export const useExchangeRates = () => {
    const [rates, setRates] = useState<ExchangeRates>({
        usd_bcv: 52.50,
        eur_usd: 1.09,
        cop_usd: 4200,
        binance_buy: 52.80,
        binance_sell: 52.20,
        last_updated: new Date().toISOString()
    });

    const [isLoading, setIsLoading] = useState(true);

    /**
     * Obtiene las tasas de cambio de Supabase
     */
    const fetchRates = async () => {
        try {
            // 1. Intentar leer el registro específico de Railway (ID fijo)
            const { data: railwayData } = await supabase
                .from('exchange_rates')
                .select('*')
                .eq('id', '00000000-0000-0000-0000-000000000001')
                .single();

            if (railwayData) {
                setRates({
                    usd_bcv: railwayData.usd_bcv || rates.usd_bcv,
                    eur_usd: railwayData.eur_bcv || railwayData.eur_usd || rates.eur_usd,
                    eur_bcv: railwayData.eur_bcv || railwayData.eur_usd || rates.eur_usd, // Compatibilidad
                    cop_usd: railwayData.cop_usd || rates.cop_usd,
                    binance_buy: railwayData.usd_binance_buy || railwayData.binance_buy || rates.binance_buy,
                    binance_sell: railwayData.usd_binance_sell || railwayData.binance_sell || rates.binance_sell,
                    last_updated: railwayData.last_updated || new Date().toISOString()
                });
                return;
            }

            // 2. Si falla, intentar leer el último registro actualizado (fallback)
            const { data, error } = await supabase
                .from('exchange_rates')
                .select('*')
                .limit(1)
                .order('last_updated', { ascending: false })
                .single();

            if (error) throw error;

            if (data) {
                setRates({
                    usd_bcv: data.usd_bcv || rates.usd_bcv,
                    eur_usd: data.eur_usd || data.eur_bcv || rates.eur_usd,
                    eur_bcv: data.eur_bcv || data.eur_usd || rates.eur_usd,
                    cop_usd: data.cop_usd || rates.cop_usd,
                    binance_buy: data.binance_buy || data.usd_binance_buy || rates.binance_buy,
                    binance_sell: data.binance_sell || data.usd_binance_sell || rates.binance_sell,
                    last_updated: data.last_updated || new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error fetching rates from Supabase:', error);
            fetchFromBackend();
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fallback: lee del backend local
     */
    const fetchFromBackend = async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
            const response = await fetch(`${backendUrl}/rates`);
            if (response.ok) {
                const data = await response.json();
                setRates(prev => ({
                    ...prev,
                    usd_bcv: data.usd_bcv || prev.usd_bcv,
                    eur_usd: data.eur_usd || data.eur_bcv || prev.eur_usd,
                    binance_buy: data.binance_buy || prev.binance_buy,
                    binance_sell: data.binance_sell || prev.binance_sell,
                    last_updated: data.last_updated || new Date().toISOString()
                }));
            }
        } catch (e) {
            // Silencioso si falla
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

    // Cargar tasas al montar
    useEffect(() => {
        fetchRates();

        const subscription = supabase
            .channel('public:exchange_rates')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'exchange_rates' }, (payload) => {
                const newData = payload.new;
                setRates(prev => ({
                    ...prev,
                    usd_bcv: newData.usd_bcv || prev.usd_bcv,
                    eur_usd: newData.eur_usd || newData.eur_bcv || prev.eur_usd,
                    cop_usd: newData.cop_usd || prev.cop_usd,
                    binance_buy: newData.binance_buy || newData.usd_binance_buy || prev.binance_buy,
                    binance_sell: newData.binance_sell || newData.usd_binance_sell || prev.binance_sell,
                    last_updated: newData.last_updated || new Date().toISOString()
                }));
            })
            .subscribe();

        const interval = setInterval(fetchRates, 5 * 60 * 1000);

        return () => {
            subscription.unsubscribe();
            clearInterval(interval);
        };
    }, []);

    return {
        rates,
        setRates,
        handleRateUpdate,
        fetchRates,
        isLoading
    };
};
