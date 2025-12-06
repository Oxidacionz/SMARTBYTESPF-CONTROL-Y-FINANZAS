
import React, { useMemo, useState } from 'react';
import { DirectoryEntity, FinancialItem } from '../../types';
import { Card } from '../atoms/Card';
import { User, Building, Layers, ArrowRight, ChevronRight, ChevronDown } from 'lucide-react';

interface DirectoryWidgetProps {
  directory: DirectoryEntity[];
  items: FinancialItem[];
  toUSD: (item: FinancialItem) => number;
}

export const DirectoryWidget: React.FC<DirectoryWidgetProps> = ({ directory, items, toUSD }) => {
  const [isOpen, setIsOpen] = useState(false);

  const aggregatedData = useMemo(() => {
    return directory.map(entity => {
      const entityItems = items.filter(i => i.entity_id === entity.id || i.name.toLowerCase() === entity.name.toLowerCase());
      const totalReceivable = entityItems
        .filter(i => i.type === 'asset' && i.category === 'Receivable')
        .reduce((acc, curr) => acc + toUSD(curr), 0);
      const totalDebt = entityItems
        .filter(i => i.type === 'liability' && i.category === 'Debt')
        .reduce((acc, curr) => acc + toUSD(curr), 0);

      const netBalance = totalReceivable - totalDebt; // Positive means they owe me, Negative means I owe them

      return {
        ...entity,
        totalReceivable,
        totalDebt,
        netBalance,
        itemCount: entityItems.length
      };
    }).filter(e => e.itemCount > 0 || e.netBalance !== 0).sort((a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance));
  }, [directory, items, toUSD]);

  return (
    <Card className="p-0 overflow-hidden border-2 border-yellow-500 dark:border-yellow-600 shadow-md shadow-yellow-500/20">
      <div
        className="bg-slate-800 dark:bg-slate-900 p-4 text-white flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold flex items-center gap-2">
          <Layers size={18} className="text-slate-300" />
          Directorio & Balances
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">{directory.length} Entidades</span>
          <ChevronDown size={20} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="p-0 max-h-[400px] overflow-y-auto bg-white dark:bg-gray-800 animate-fade-in-down">
          {aggregatedData.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">
              Añade personas al directorio para ver sus balances agrupados.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {aggregatedData.map(entity => (
                <div key={entity.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${entity.type === 'person' ? 'bg-indigo-500' : 'bg-slate-500'}`}>
                        {entity.type === 'person' ? <User size={14} /> : <Building size={14} />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200 text-sm">{entity.name}</div>
                        <div className="text-[10px] text-gray-400">{entity.type === 'person' ? 'Persona' : 'Plataforma'} • {entity.itemCount} movs</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold font-mono text-sm ${entity.netBalance > 0 ? 'text-green-600' : entity.netBalance < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                        {entity.netBalance > 0 ? '+' : ''}{entity.netBalance.toFixed(2)} $
                      </div>
                      <div className="text-[9px] text-gray-400">Balance Neto</div>
                    </div>
                  </div>

                  {/* Mini Detail */}
                  {(entity.totalDebt > 0 || entity.totalReceivable > 0) && (
                    <div className="flex justify-between text-[10px] bg-gray-50 dark:bg-gray-900/30 p-1.5 rounded mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                      <span className="text-red-500">Debes: ${entity.totalDebt.toFixed(0)}</span>
                      <span className="text-gray-300">|</span>
                      <span className="text-green-600">Te deben: ${entity.totalReceivable.toFixed(0)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
