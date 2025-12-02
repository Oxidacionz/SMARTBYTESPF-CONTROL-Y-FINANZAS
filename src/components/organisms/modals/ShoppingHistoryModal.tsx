
import React, { useState } from 'react';
import { ShoppingItem, Currency } from '../../../types';
import { ShoppingBag, Receipt, Plus, X, Calendar } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

interface ShoppingHistoryModalProps {
  history: ShoppingItem[];
  onAddItem: (item: Omit<ShoppingItem, 'id' | 'hasReceipt'>) => void;
  onClose: () => void;
}

export const ShoppingHistoryModal: React.FC<ShoppingHistoryModalProps> = ({ history, onAddItem, onClose }) => {
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-800 p-4 flex justify-between items-center text-white shrink-0">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShoppingBag size={20} className="text-orange-200" />
              Gastos & Compras
            </h3>
            <p className="text-xs text-orange-100 opacity-90">Registra gastos hormiga diarios</p>
          </div>
          <button onClick={onClose} className="hover:text-orange-200 transition-colors"><X size={24} /></button>
        </div>

        {/* Input Form */}
        <div className="p-4 bg-orange-50 dark:bg-gray-900/30 border-b border-orange-100 dark:border-gray-700 shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <Input 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                placeholder="¿Qué compraste? (Ej: Harina)" 
                className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600"
              />
            </div>
            <div className="flex gap-2">
               <div className="w-1/3">
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    placeholder="Monto" 
                    className="bg-white dark:bg-gray-700 border-orange-200 dark:border-gray-600"
                  />
               </div>
               <select 
                  value={currency} 
                  onChange={e => setCurrency(e.target.value as Currency)}
                  className="w-24 p-2 rounded-lg border border-orange-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm outline-none"
                >
                  <option value="VES">Bs.S</option>
                  <option value="USD">USD</option>
                </select>
                <div className="w-32 relative">
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)}
                        className="w-full text-sm p-2 rounded-lg border border-orange-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 outline-none"
                    />
                </div>
            </div>
            <Button onClick={handleAdd} className="w-full bg-orange-600 hover:bg-orange-700 text-white" icon={<Plus size={16} />}>
              Registrar Gasto
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-0 flex-grow bg-white dark:bg-gray-800">
          {history.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm flex flex-col items-center">
              <ShoppingBag size={48} className="mb-3 opacity-20" />
              <p>Sin historial reciente.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium sticky top-0">
                <tr>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800 dark:text-gray-200">{item.description}</div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1">
                         <Calendar size={10} />
                         <span>{item.date}</span>
                         {item.hasReceipt && <span className="ml-2 bg-green-100 text-green-700 px-1 rounded-[2px] flex items-center"><Receipt size={8} className="mr-0.5"/> Ticket</span>}
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
    </div>
  );
};
