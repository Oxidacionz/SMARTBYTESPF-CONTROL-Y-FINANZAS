import React, { useState } from 'react';
import { FinancialItem, PhysicalAsset } from '../../../types';
import { BadgeDollarSign, X, ArrowRight } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

interface LiquidationModalProps {
  asset: PhysicalAsset;
  accounts: FinancialItem[];
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-amber-600 dark:bg-amber-700 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2"><BadgeDollarSign size={20} /> Liquidar Activo</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-100 dark:border-amber-900/30">
            <p className="text-sm text-gray-600 dark:text-gray-300">Vas a vender: <span className="font-bold">{asset.name}</span></p>
          </div>
          <Input label="Precio Final" type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required />
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuenta Destino</label>
             <select required value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm">
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
             </select>
          </div>
          <Button type="submit" fullWidth className="bg-amber-600 hover:bg-amber-700" icon={<BadgeDollarSign size={20} />}>Confirmar Venta</Button>
        </form>
      </div>
    </div>
  );
};