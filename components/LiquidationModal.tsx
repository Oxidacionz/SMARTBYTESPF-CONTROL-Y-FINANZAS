
import React, { useState } from 'react';
import { FinancialItem, PhysicalAsset, Currency } from '../types';
import { BadgeDollarSign, X, ArrowRight } from 'lucide-react';

interface LiquidationModalProps {
  asset: PhysicalAsset;
  accounts: FinancialItem[]; // Only assets type='asset'
  onConfirm: (salePrice: number, targetAccountId: string) => void;
  onClose: () => void;
}

export const LiquidationModal: React.FC<LiquidationModalProps> = ({ asset, accounts, onConfirm, onClose }) => {
  const [salePrice, setSalePrice] = useState(asset.estimatedValue.toString());
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId || !salePrice) return;
    onConfirm(parseFloat(salePrice), selectedAccountId);
  };

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-amber-600 dark:bg-amber-700 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <BadgeDollarSign size={20} />
            Liquidar Activo
          </h3>
          <button onClick={onClose} className="hover:text-amber-200 transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">Vas a vender/liquidar: <span className="font-bold text-gray-900 dark:text-white">{asset.name}</span></p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Este ítem se eliminará del inventario y el dinero se sumará a la cuenta seleccionada.</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio Final de Venta</label>
             <div className="relative">
                <input
                    required
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full pl-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 font-bold">$</span>
             </div>
             <p className="text-xs text-gray-400 mt-1">Ingresa el monto en la moneda de la cuenta destino.</p>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuenta Destino (Donde entra el dinero)</label>
             <select
                required
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
             >
                {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.currency}) - Actual: {acc.amount}
                    </option>
                ))}
             </select>
          </div>
          
          {selectedAccount && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400 py-2">
                 <span>Saldo Actual: {selectedAccount.amount}</span>
                 <ArrowRight size={14} />
                 <span className="font-bold text-green-600 dark:text-green-400">Nuevo: {(selectedAccount.amount + (parseFloat(salePrice) || 0)).toFixed(2)}</span>
              </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <BadgeDollarSign size={20} />
            Confirmar Venta
          </button>
        </form>
      </div>
    </div>
  );
};
