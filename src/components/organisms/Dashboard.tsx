
import React, { useState } from 'react';
import { FinancialItem } from '../../types';
import { SummaryChart } from './SummaryChart';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { AlertTriangle, ArrowRightLeft, PieChart, ChevronUp, ShoppingBag } from 'lucide-react';

interface DashboardProps {
  items: FinancialItem[];
  exchangeRate: number;
  toUSD: (item: FinancialItem) => number;
  formatMoney: (amount: number, currency: string) => string;
  onSettleDebt: (item: FinancialItem) => void;
  onOpenShopping: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ items, exchangeRate, toUSD, formatMoney, onSettleDebt, onOpenShopping }) => {
  const [showChart, setShowChart] = useState(false);
  
  const pendingDebts = items.filter(i => i.type === 'liability' && !i.isMonthly && i.amount > 0);
  const pendingReceivables = items.filter(i => i.category === 'Receivable' && i.amount > 0);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-wrap justify-end gap-2">
        <Button 
            variant="secondary" 
            onClick={onOpenShopping}
            className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-orange-600 dark:text-orange-400 hover:text-orange-700"
            icon={<ShoppingBag size={18} />}
        >
            Gastos Hormiga
        </Button>
        <Button 
          variant="secondary" 
          onClick={() => setShowChart(!showChart)}
          className="shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          icon={showChart ? <ChevronUp size={18} /> : <PieChart size={18} />}
        >
          {showChart ? 'Ocultar Gráfica' : 'Distribución'}
        </Button>
      </div>

      {/* Chart Section (Collapsible) */}
      {showChart && (
        <div className="animate-fade-in-down">
           <SummaryChart items={items} exchangeRate={exchangeRate} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Debts Alert Box */}
        <Card className="p-4 border-l-4 border-red-500">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                Deudas Pendientes
            </h3>
            <div className="space-y-2">
                {pendingDebts.length === 0 ? (
                    <p className="text-sm text-gray-500">¡Estás libre de deudas!</p>
                ) : (
                    pendingDebts.map(debt => (
                        <div key={debt.id} className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/20">
                            <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm block">{debt.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{toUSD(debt).toFixed(2)} USD (aprox)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-red-700 dark:text-red-400 text-sm">{formatMoney(debt.amount, debt.currency)}</span>
                                <button 
                                    onClick={() => onSettleDebt(debt)}
                                    className="text-xs bg-white border border-red-200 text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors shadow-sm"
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
        <Card className="p-4 border-l-4 border-indigo-500">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <ArrowRightLeft size={18} className="text-indigo-500" />
                Por Cobrar (Me deben)
            </h3>
            <div className="space-y-2">
                {pendingReceivables.length === 0 ? (
                    <p className="text-sm text-gray-500">No tienes cobros pendientes.</p>
                ) : (
                    pendingReceivables.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-indigo-50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                            <div>
                                <span className="font-medium text-gray-800 dark:text-gray-200 text-sm block">{item.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{toUSD(item).toFixed(2)} USD (aprox)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 text-sm">{formatMoney(item.amount, item.currency)}</span>
                                <button 
                                    onClick={() => onSettleDebt(item)}
                                    className="text-xs bg-white border border-indigo-200 text-indigo-600 p-1.5 rounded hover:bg-indigo-50 transition-colors shadow-sm"
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
