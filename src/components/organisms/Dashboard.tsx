
import React, { useState } from 'react';
import { FinancialItem } from '../../types';
import { SummaryChart } from './SummaryChart';
import { TransactionHistory } from './TransactionHistory';
import { Card } from '../atoms/Card';
import { ArrowRightLeft, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

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

    const [collapsed, setCollapsed] = useState({ debts: false, receivables: false });

    const toggleCollapse = (key: 'debts' | 'receivables') => {
        setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">

            {/* Chart Section (Collapsible) */}
            {showChart && (
                <div className="animate-fade-in-down">
                    <SummaryChart items={items} exchangeRate={exchangeRate} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Pending Debts Alert Box - Left Column */}
                {/* Pending Debts (Collapsible + Golden Border + Compact) */}
                <Card className="flex flex-col border border-amber-400 bg-slate-800 shadow-xl overflow-hidden transition-all duration-300">
                    <div
                        className="p-3 border-b border-amber-400/30 flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-colors bg-slate-800"
                        onClick={() => toggleCollapse('debts')}
                    >
                        <h3 className="font-bold text-amber-100 flex items-center gap-2 text-sm">
                            <AlertTriangle size={16} className="text-amber-400" />
                            Deudas Pendientes
                        </h3>
                        <div className="flex items-center gap-2">
                            {collapsed.debts ? <ChevronDown size={14} className="text-amber-400" /> : <ChevronUp size={14} className="text-amber-400" />}
                        </div>
                    </div>

                    {!collapsed.debts && (
                        <div className="space-y-2 p-2 max-h-[400px] overflow-y-auto">
                            {pendingDebts.length === 0 ? (
                                <p className="text-xs text-slate-400 p-2 text-center">¡Estás libre de deudas!</p>
                            ) : (
                                pendingDebts.map(debt => (
                                    <div key={debt.id} className="flex justify-between items-center p-2 bg-red-900/10 rounded border border-red-500/20 hover:border-amber-400/30 transition-colors">
                                        <div className="min-w-0">
                                            <span className="font-medium text-slate-200 text-xs block truncate w-24">{debt.name}</span>
                                            <span className="text-[10px] text-slate-400">{toUSD(debt).toFixed(2)} USD</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-2">
                                            <span className="font-mono font-bold text-red-400 text-xs whitespace-nowrap">{formatMoney(debt.amount, debt.currency)}</span>
                                            <button
                                                onClick={() => onSettleDebt(debt)}
                                                className="text-[10px] bg-slate-900 border border-red-500/30 text-red-300 p-1 rounded hover:bg-red-900/50 transition-colors shrink-0"
                                                title="Pagar"
                                            >
                                                Pagar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </Card>

                {/* Transaction History - Middle Column */}
                {/* Transaction History - Middle Column */}
                <div className="lg:col-span-1">
                    <TransactionHistory formatMoney={formatMoney} isCompact={true} />
                </div>

                {/* Receivables Alert Box - Right Column */}
                {/* Receivables Alert Box - Right Column */}
                <Card className="flex flex-col border border-amber-400 bg-slate-800 shadow-xl overflow-hidden transition-all duration-300">
                    <div
                        className="p-3 border-b border-amber-400/30 flex justify-between items-center cursor-pointer hover:bg-slate-700/50 transition-colors bg-slate-800"
                        onClick={() => toggleCollapse('receivables')}
                    >
                        <h3 className="font-bold text-amber-100 flex items-center gap-2 text-sm">
                            <ArrowRightLeft size={16} className="text-emerald-400" />
                            Por Cobrar (Me deben)
                        </h3>
                        <div className="flex items-center gap-2">
                            {collapsed.receivables ? <ChevronDown size={14} className="text-amber-400" /> : <ChevronUp size={14} className="text-amber-400" />}
                        </div>
                    </div>

                    {!collapsed.receivables && (
                        <div className="space-y-2 p-2 max-h-[400px] overflow-y-auto">
                            {pendingReceivables.length === 0 ? (
                                <p className="text-xs text-slate-400 p-2 text-center">No tienes cobros pendientes.</p>
                            ) : (
                                pendingReceivables.map(item => (
                                    <div key={item.id} className="flex justify-between items-center p-2 bg-emerald-900/10 rounded border border-emerald-500/20 hover:border-amber-400/30 transition-colors">
                                        <div className="min-w-0">
                                            <span className="font-medium text-slate-200 text-xs block truncate w-24">{item.name}</span>
                                            <span className="text-[10px] text-slate-400">{toUSD(item).toFixed(2)} USD</span>
                                        </div>
                                        <div className="flex items-center gap-2 pl-2">
                                            <span className="font-mono font-bold text-amber-400 text-xs whitespace-nowrap">{formatMoney(item.amount, item.currency)}</span>
                                            <button
                                                onClick={() => onSettleDebt(item)}
                                                className="text-[10px] bg-slate-900 border border-emerald-500/30 text-emerald-300 p-1 rounded hover:bg-emerald-900/50 transition-colors shrink-0"
                                                title="Cobrar"
                                            >
                                                Cobrar
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
