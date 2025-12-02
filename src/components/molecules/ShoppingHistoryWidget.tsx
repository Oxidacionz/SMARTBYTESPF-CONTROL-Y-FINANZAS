
import React, { useState } from 'react';
import { ShoppingItem, Currency } from '../../types';
import { ShoppingBag, Receipt, Plus, Search } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';
import { Input } from '../atoms/Input';

interface ShoppingHistoryWidgetProps {
  history: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'hasReceipt'>) => void;
}

export const ShoppingHistoryWidget: React.FC<ShoppingHistoryWidgetProps> = ({ history, onAddItem }) => {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('VES');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = () => {
    if (!desc || !amount) return;
    onAddItem({
      description: desc,
      amount: parseFloat(amount),
      currency,
      date
    });
    setDesc('');
    setAmount('');
  };

  return (
    <Card className="p-0 overflow-hidden border-none shadow-md">
      <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-800 p-4 text-white">
        <h3 className="font-bold flex items-center gap-2">
          <ShoppingBag size={20} className="text-orange-200" />
          Gastos & Compras
        </h3>
        <p className="text-xs text-orange-100 opacity-90 mt-1">Registra gastos hormiga y compras diarias</p>
      </div>

      <div className="p-4 bg-orange-50 dark:bg-gray-800/50 border-b border-orange-100 dark:border-gray-700">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              placeholder="¿Qué compraste?" 
              className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600"
            />
            <div className="w-32 shrink-0">
               <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-orange-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
               />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="w-1/3">
              <Input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="0.00" 
                className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600"
              />
            </div>
            <select 
              value={currency} 
              onChange={e => setCurrency(e.target.value as Currency)}
              className="w-24 p-2 rounded-lg border border-orange-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
            >
              <option value="VES">Bs.S</option>
              <option value="USD">USD</option>
            </select>
            <Button onClick={handleAdd} className="flex-grow bg-orange-600 hover:bg-orange-700 text-white" icon={<Plus size={16} />}>
              Registrar
            </Button>
          </div>
        </div>
      </div>

      <div className="p-0">
        <div className="max-h-[300px] overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
              Sin historial de compras recientes.
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
                <tr>
                  <th className="px-4 py-2">Ítem</th>
                  <th className="px-4 py-2 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.description}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                         <span>{item.date}</span>
                         {item.hasReceipt && <span className="bg-green-100 text-green-700 px-1 rounded-[2px] flex items-center"><Receipt size={8} className="mr-0.5"/> Ticket</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gray-700 dark:text-gray-300">
                      {item.currency === 'USD' ? '$' : 'Bs.'} {item.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Card>
  );
};
