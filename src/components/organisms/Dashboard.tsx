
import React from 'react';
import { FinancialItem } from '../../types';
import { SummaryChart } from './SummaryChart';
import { Card } from '../atoms/Card';
import { ArrowRightLeft, AlertTriangle } from 'lucide-react';

interface DashboardProps {
    items: FinancialItem[];
    exchangeRate: number;
    toUSD: (item: FinancialItem) => number;
    formatMoney: (amount: number, currency: string) => string;
    onSettleDebt: (item: FinancialItem) => void;
    onOpenShopping: () => void;
    showChart: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ items, exchangeRate, toUSD, formatMoney, onSettleDebt, onOpenShopping, showChart }) => {

    const pendingDebts = items.filter(i => i.type === 'liability' && !i.isMonthly && i.amount > 0);
    const pendingReceivables = items.filter(i => i.category === 'Receivable' && i.amount > 0);

    return (
        <div className="space-y-6">

            {/* Chart Section (Collapsible) */}
            {showChart && (
                <div className="animate-fade-in-down">
                    <SummaryChart items={items} exchangeRate={exchangeRate} />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pending Debts Alert Box */}
                <Card className="p-4 border-l-4 border-amber-500 bg-gradient-to-br from-slate-700 to-slate-800">
                    <h3 className="font-bold text-amber-100 mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-300" />
                        Deudas Pendientes
                    </h3>
                    <div className="space-y-2">
                        {pendingDebts.length === 0 ? (
                            <p className="text-sm text-slate-300">¡Estás libre de deudas!</p>
                        ) : (
                            pendingDebts.map(debt => (
                                <div key={debt.id} className="flex justify-between items-center p-3 bg-red-900/30 rounded-lg border-2 border-red-500/40 backdrop-blur-sm">
                                    <div>
                                        <span className="font-medium text-slate-100 text-sm block">{debt.name}</span>
                                        <span className="text-xs text-slate-300">{toUSD(debt).toFixed(2)} USD (aprox)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-red-400 text-sm">{formatMoney(debt.amount, debt.currency)}</span>
                                        <button
                                            onClick={() => onSettleDebt(debt)}
                                            className="text-xs bg-slate-900/50 border-2 border-red-500/50 text-red-300 p-1.5 rounded hover:bg-red-900/30 transition-colors shadow-sm"
                                            title="Pagar"
                                        >
                                            <ArrowRightLeft size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* Receivables Alert Box */}
                <Card className="p-4 border-l-4 border-emerald-500 bg-gradient-to-br from-slate-700 to-slate-800">
                    <h3 className="font-bold text-emerald-100 mb-3 flex items-center gap-2">
                        <ArrowRightLeft size={18} className="text-emerald-300" />
                        Por Cobrar (Me deben)
                    </h3>
                    <div className="space-y-2">
                        {pendingReceivables.length === 0 ? (
                            <p className="text-sm text-slate-300">No tienes cobros pendientes.</p>
                        ) : (
                            pendingReceivables.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-emerald-900/20 rounded-lg border-2 border-emerald-500/30 backdrop-blur-sm">
                                    <div>
                                        <span className="font-medium text-slate-100 text-sm block">{item.name}</span>
                                        <span className="text-xs text-slate-300">{toUSD(item).toFixed(2)} USD (aprox)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-amber-400 text-sm">{formatMoney(item.amount, item.currency)}</span>
                                        <button
                                            onClick={() => onSettleDebt(item)}
                                            className="text-xs bg-slate-900/50 border-2 border-emerald-500/50 text-emerald-300 p-1.5 rounded hover:bg-emerald-900/30 transition-colors shadow-sm"
                                            title="Cobrar"
                                        >
                                            <ArrowRightLeft size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};
