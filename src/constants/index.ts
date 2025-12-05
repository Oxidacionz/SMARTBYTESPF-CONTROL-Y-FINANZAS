/**
 * Application-wide constants for Smart Bytes
 */

import { FinancialItem, SpecialEvent, PhysicalAsset, ExchangeRates } from '../types';

/**
 * Initial financial data for new users
 */
export const INITIAL_DATA: FinancialItem[] = [
    { id: '1', name: 'Banco VNZ', amount: 19108.00, currency: 'VES', category: 'Bank', type: 'asset', isMonthly: false, note: 'Tasa oficial', customExchangeRate: undefined },
    { id: '2', name: 'Banco USA', amount: 500.00, currency: 'USD', category: 'Bank', type: 'asset', isMonthly: false },
    { id: '3', name: 'Efectivo', amount: 100.00, currency: 'USD', category: 'Cash', type: 'asset', isMonthly: false },
    { id: '4', name: 'Inversión Cripto', amount: 1200.00, currency: 'USD', category: 'Investment', type: 'asset', isMonthly: false },
    { id: '5', name: 'Préstamo Personal', amount: 300.00, currency: 'USD', category: 'Debt', type: 'liability', isMonthly: false },
    { id: '6', name: 'Tarjeta de Crédito', amount: 150.00, currency: 'USD', category: 'Debt', type: 'liability', isMonthly: false },
    { id: '7', name: 'Alquiler', amount: 200.00, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true, dayOfMonth: 1 },
    { id: '8', name: 'Servicios', amount: 50.00, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true, dayOfMonth: 5 },
    { id: '9', name: 'Comida', amount: 300.00, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true, dayOfMonth: 1 },
    { id: '10', name: 'Insumos EKA', amount: 20.00, currency: 'USD', category: 'Expense', type: 'liability', isMonthly: true, dayOfMonth: 15 },
];

/**
 * Initial special events for new users
 */
export const INITIAL_EVENTS: SpecialEvent[] = [
    { id: '1', name: 'Cumpleaños Mamá', date: '05-15', type: 'birthday' },
    { id: '2', name: 'Pago Tarjeta', date: '09-28', type: 'payment' },
];

/**
 * Initial shopping list (empty by default)
 */
export const INITIAL_SHOPPING: any[] = [];

/**
 * Initial physical assets
 */
export const INITIAL_ASSETS: PhysicalAsset[] = [
    { id: '1', name: 'Laptop', estimatedValue: 300, currency: 'USD', description: 'HP Pavilion' }
];

/**
 * Initial exchange rates (fallback values)
 */
export const INITIAL_RATES: ExchangeRates = {
    usd_bcv: 0.00,
    eur_bcv: 0.00,
    usd_binance: 0.00,
    lastUpdated: new Date().toISOString()
};

/**
 * Financial categories
 */
export const CATEGORIES = {
    ASSETS: ['Bank', 'Cash', 'Investment', 'Savings', 'Other'],
    LIABILITIES: ['Debt', 'Expense', 'Loan', 'Credit Card', 'Other'],
} as const;

/**
 * Currency symbols
 */
export const CURRENCY_SYMBOLS = {
    USD: '$',
    VES: 'Bs.',
    EUR: '€',
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
    FULL: 'YYYY-MM-DD',
    SHORT: 'MM-DD',
    DISPLAY: 'DD/MM/YYYY',
} as const;

/**
 * App configuration
 */
export const APP_CONFIG = {
    NAME: 'Smart Bytes',
    VERSION: '1.0.0',
    DEFAULT_CURRENCY: 'USD' as const,
    DEFAULT_LANGUAGE: 'es',
    CACHE_DURATION_HOURS: 4,
} as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
    BCV_RATES: '/tasas',
    API_RATES: '/api/rates',
    BINANCE_P2P: '/p2p/promedio-usdt-ves',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
    HAS_SEEN_TUTORIAL: 'hasSeenTutorial',
    HAS_SEEN_UPDATE: 'hasSeenUpdate_v2',
    THEME: 'theme',
    LANGUAGE: 'language',
} as const;
