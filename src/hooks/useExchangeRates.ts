import { useState, useCallback, useEffect } from 'react';
import { ExchangeRates } from '../types';
import { dbRates } from '../services/db';
import { forceRefreshRates } from '../services/bcvService';
import { APP_CONSTANTS } from '../config/constants';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error' | 'event';
    date: string;
    read: boolean;
}

const INITIAL_RATES: ExchangeRates = {
    usd_bcv: 45.50, eur_bcv: 49.20, usd_binance_buy: 46.80, usd_binance_sell: 47.10, lastUpdated: new Date().toISOString()
};

export const useExchangeRates = (
    addNotification: (notification: Notification) => void
) => {
    const [rates, setRates] = useState<ExchangeRates>(INITIAL_RATES);
    const [isUpdating, setIsUpdating] = useState(false);
    const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

    const updateReview = useCallback(async (newRates: ExchangeRates) => {
        setRates(newRates);
        setSyncStatus('syncing');
        try {
            await dbRates.update(newRates);
            setSyncStatus('synced');
        } catch (e) {
            console.warn("Rate update failed on server", e);
            setSyncStatus('synced'); // Optimistic
        }
    }, []);

    const fetchLatestRates = useCallback(async () => {
        try {
            const cloudRates = await dbRates.get();
            if (cloudRates) {
                setRates(prevRates => ({
                    ...prevRates,
                    ...cloudRates
                }));
                console.log("🔄 Auto-sync: Tasas actualizadas desde Supabase");
            }
        } catch (e) {
            console.error("Auto-sync rates error:", e);
        }
    }, []);

    const forceUpdate = useCallback(async () => {
        setIsUpdating(true);
        try {
            console.log("🔄 Buscando tasas actualizadas en Supabase...");
            // 1. Try Supabase
            const supabaseData = await dbRates.get();
            if (supabaseData) {
                console.log("✅ Datos encontrados en Supabase:", supabaseData);
                setRates(prev => ({ ...prev, ...supabaseData }));
                setSyncStatus('synced');
                addNotification({
                    id: `rates-supa-${Date.now()}`,
                    title: 'Tasas Sincronizadas (Nube)',
                    message: 'Se han obtenido las tasas más recientes desde la base de datos.',
                    type: 'success',
                    date: 'Ahora',
                    read: false
                });
                return;
            }

            // 2. Fallback to Backend Scrape
            console.warn("⚠️ No se encontraron tasas en Supabase. Intentando forzar scrape local...");
            const result = await forceRefreshRates();
            if (result.success && result.data) {
                setRates(result.data);
                await dbRates.update(result.data);
                setSyncStatus('synced');
                addNotification({
                    id: `rates-updated-local-${Date.now()}`,
                    title: 'Tasas Actualizadas (Local)',
                    message: 'Se forzó una actualización local exitosa.',
                    type: 'success',
                    date: 'Ahora',
                    read: false
                });
            } else {
                setSyncStatus('error');
            }
        } catch (e) {
            console.error("Error forcing rates update:", e);
            setSyncStatus('error');
        } finally {
            setIsUpdating(false);
        }
    }, [addNotification]);

    // Auto-sync effect
    useEffect(() => {
        fetchLatestRates();
        const intervalId = setInterval(fetchLatestRates, APP_CONSTANTS.RATES_SYNC_INTERVAL);
        return () => clearInterval(intervalId);
    }, [fetchLatestRates]);

    return {
        rates,
        setRates,
        isUpdating,
        syncStatus,
        setSyncStatus,
        handleRateUpdate: updateReview,
        forceUpdate
    };
};
