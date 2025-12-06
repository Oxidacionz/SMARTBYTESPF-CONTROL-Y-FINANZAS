/**
 * Funciones de cálculo financiero
 */

import { FinancialItem, ExchangeRates } from '../types';

/**
 * Convierte un item financiero a USD
 */
export const toUSD = (item: FinancialItem, rates: ExchangeRates): number => {
    if (item.currency === 'USD') return item.amount;
    if (item.currency === 'BS') return item.amount / rates.usd_bcv;
    if (item.currency === 'EUR') return item.amount * rates.eur_usd;
    if (item.currency === 'COP') return item.amount / rates.cop_usd;
    return item.amount;
};

/**
 * Formatea un monto con su moneda
 */
export const formatMoney = (amount: number, currency: string): string => {
    const formatted = amount.toFixed(2);
    if (currency === 'BS') return `Bs ${formatted}`;
    if (currency === 'USD') return `$${formatted}`;
    if (currency === 'EUR') return `€${formatted}`;
    if (currency === 'COP') return `$${formatted} COP`;
    return `${formatted} ${currency}`;
};

/**
 * Calcula totales financieros
 */
export const calculateTotals = (items: FinancialItem[], rates: ExchangeRates) => {
    const liquidAssets = items
        .filter(i => i.type === 'asset' && (i.category === 'Cash' || i.category === 'Bank'))
        .reduce((acc, curr) => acc + toUSD(curr, rates), 0);

    const totalSavings = items
        .filter(i => i.type === 'asset' && i.category === 'Savings')
        .reduce((acc, curr) => acc + toUSD(curr, rates), 0);

    const totalAssets = items
        .filter(i => i.type === 'asset')
        .reduce((acc, curr) => acc + toUSD(curr, rates), 0);

    const totalLiabilities = items
        .filter(i => i.type === 'liability')
        .reduce((acc, curr) => acc + toUSD(curr, rates), 0);

    const totalPatrimony = totalAssets - totalLiabilities;

    const monthlyExpenses = items
        .filter(i => i.type === 'liability' && i.category === 'Expense' && i.target_date)
        .reduce((acc, curr) => acc + toUSD(curr, rates), 0);

    return {
        liquidAssets,
        totalSavings,
        totalAssets,
        totalLiabilities,
        totalPatrimony,
        monthlyExpenses
    };
};
