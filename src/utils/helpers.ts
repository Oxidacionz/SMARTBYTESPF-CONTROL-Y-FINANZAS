/**
 * Funciones auxiliares y utilidades generales
 */

import * as XLSX from 'xlsx';
import { FinancialItem, PhysicalAsset, ShoppingItem } from '../types';

/**
 * Genera un ID único
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Exporta datos a Excel
 */
export const exportToExcel = (
    items: FinancialItem[],
    physicalAssets: PhysicalAsset[],
    shoppingHistory: ShoppingItem[]
) => {
    const wb = XLSX.utils.book_new();

    // Hoja de Items Financieros
    const itemsData = items.map(i => ({
        Tipo: i.type === 'asset' ? 'Activo' : 'Pasivo',
        Nombre: i.name,
        Categoría: i.category,
        Monto: i.amount,
        Moneda: i.currency,
        Fecha: i.target_date || '-'
    }));
    const wsItems = XLSX.utils.json_to_sheet(itemsData);
    XLSX.utils.book_append_sheet(wb, wsItems, 'Finanzas');

    // Hoja de Inventario
    const assetsData = physicalAssets.map(a => ({
        Nombre: a.name,
        Descripción: a.description || '-',
        'Valor Estimado': a.estimatedValue,
        Moneda: a.currency
    }));
    const wsAssets = XLSX.utils.json_to_sheet(assetsData);
    XLSX.utils.book_append_sheet(wb, wsAssets, 'Inventario');

    // Hoja de Gastos Hormiga
    const shoppingData = shoppingHistory.map(s => ({
        Concepto: s.concept,
        Monto: s.amount,
        Moneda: s.currency,
        Fecha: s.date
    }));
    const wsShopping = XLSX.utils.json_to_sheet(shoppingData);
    XLSX.utils.book_append_sheet(wb, wsShopping, 'Gastos Hormiga');

    // Descargar
    XLSX.writeFile(wb, `reporte-financiero-${new Date().toISOString().split('T')[0]}.xlsx`);
};

/**
 * Formatea una fecha a formato legible
 */
export const formatDate = (date: string): string => {
    const [year, month, day] = date.split('-');
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[parseInt(month) - 1]} ${year}`;
};

/**
 * Valida si una fecha está próxima (dentro de 7 días)
 */
export const isUpcoming = (dateStr: string): boolean => {
    const [month, day] = dateStr.split('-');
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), parseInt(month) - 1, parseInt(day));

    if (targetDate < today) {
        targetDate.setFullYear(today.getFullYear() + 1);
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays >= 0 && diffDays <= 7;
};
