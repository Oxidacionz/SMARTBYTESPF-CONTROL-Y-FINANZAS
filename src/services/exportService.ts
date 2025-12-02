
import { FinancialItem, PhysicalAsset, ShoppingItem } from '../types';

declare global {
    interface Window {
      XLSX: any;
    }
}

export const exportToExcel = (
    items: FinancialItem[],
    assets: PhysicalAsset[],
    shopping: ShoppingItem[],
    fileName: string = 'Reporte_Financiero'
) => {
    if (!window.XLSX) {
        alert('Librería de exportación no cargada.');
        return;
    }

    const wb = window.XLSX.utils.book_new();

    // 1. Sheet: Resumen y Cuentas
    const financialData = items.map(i => ({
        Nombre: i.name,
        Monto: i.amount,
        Moneda: i.currency,
        Tipo: i.type === 'asset' ? 'Activo/Ingreso' : 'Pasivo/Gasto',
        Categoria: i.category,
        Es_Mensual: i.isMonthly ? 'Si' : 'No',
        Nota: i.note || ''
    }));
    const wsFinancial = window.XLSX.utils.json_to_sheet(financialData);
    window.XLSX.utils.book_append_sheet(wb, wsFinancial, "Balance General");

    // 2. Sheet: Inventario
    const assetsData = assets.map(a => ({
        Articulo: a.name,
        Valor_Estimado: a.estimatedValue,
        Moneda: a.currency,
        Descripcion: a.description || ''
    }));
    const wsAssets = window.XLSX.utils.json_to_sheet(assetsData);
    window.XLSX.utils.book_append_sheet(wb, wsAssets, "Inventario Físico");

    // 3. Sheet: Historial Compras
    const shoppingData = shopping.map(s => ({
        Descripcion: s.description,
        Monto: s.amount,
        Moneda: s.currency,
        Fecha: s.date,
        Tiene_Recibo: s.hasReceipt ? 'Si' : 'No'
    }));
    const wsShopping = window.XLSX.utils.json_to_sheet(shoppingData);
    window.XLSX.utils.book_append_sheet(wb, wsShopping, "Historial Gastos");

    // Export
    window.XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
