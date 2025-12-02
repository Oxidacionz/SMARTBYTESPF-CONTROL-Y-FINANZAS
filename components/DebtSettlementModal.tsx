
import React, { useState, useEffect } from 'react';
import { FinancialItem, PhysicalAsset, Currency } from '../types';
import { CheckCircle2, Coins, ArrowRightLeft, PackagePlus, PackageMinus, X } from 'lucide-react';

interface DebtSettlementModalProps {
  item: FinancialItem; // The Debt or Receivable
  liquidAccounts: FinancialItem[]; // Bank, Wallet, Cash
  inventory: PhysicalAsset[]; // For paying with assets
  onConfirm: (
    amount: number, 
    method: 'money' | 'asset_out' | 'asset_in', 
    details: { accountId?: string; assetId?: string; newAsset?: Partial<PhysicalAsset>, note?: string }
  ) => void;
  onClose: () => void;
}

export const DebtSettlementModal: React.FC<DebtSettlementModalProps> = ({ item, liquidAccounts, inventory, onConfirm, onClose }) => {
  const isDebt = item.type === 'liability'; // I owe money
  
  const [amount, setAmount] = useState(item.amount.toString());
  const [method, setMethod] = useState<'money' | 'asset'>('money');
  const [note, setNote] = useState('');
  
  // Money State
  const [selectedAccountId, setSelectedAccountId] = useState(liquidAccounts[0]?.id || '');
  
  // Asset State
  const [selectedAssetId, setSelectedAssetId] = useState(inventory[0]?.id || '');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetDesc, setNewAssetDesc] = useState('');

  // Auto-fill note based on context
  useEffect(() => {
    setNote(isDebt ? 'Pago de deuda' : 'Cobro de deuda');
  }, [isDebt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount) return;

    if (method === 'money') {
      if (!selectedAccountId) return;
      onConfirm(numAmount, 'money', { accountId: selectedAccountId, note });
    } else {
      // Asset Swap
      if (isDebt) {
        // Paying with an asset (Asset Out)
        if (!selectedAssetId) return;
        onConfirm(numAmount, 'asset_out', { assetId: selectedAssetId, note: `${note} (Pagado con Item)` });
      } else {
        // Receiving an asset (Asset In)
        if (!newAssetName) return;
        onConfirm(numAmount, 'asset_in', { 
            newAsset: { name: newAssetName, description: newAssetDesc, estimatedValue: numAmount, currency: item.currency },
            note: `${note} (Recibido Item)`
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className={`${isDebt ? 'bg-red-700' : 'bg-green-700'} p-4 flex justify-between items-center text-white shrink-0`}>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ArrowRightLeft size={20} />
              {isDebt ? `Pagar Deuda: ${item.name}` : `Cobrar a: ${item.name}`}
            </h3>
            <p className="text-xs opacity-90">Pendiente: {item.amount} {item.currency}</p>
          </div>
          <button onClick={onClose} className="hover:text-gray-200 transition-colors"><X size={24} /></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          
          {/* Amount & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto a {isDebt ? 'Pagar' : 'Cobrar'}</label>
                <input
                    type="number"
                    step="0.01"
                    max={item.amount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción / Nota</label>
                <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Razón del pago..."
                />
            </div>
          </div>

          {/* Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Método de Pago</label>
            <div className="grid grid-cols-2 gap-3">
                <button
                    type="button"
                    onClick={() => setMethod('money')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${method === 'money' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    <Coins size={24} />
                    <span className="text-sm font-bold">Dinero / Saldo</span>
                </button>
                <button
                    type="button"
                    onClick={() => setMethod('asset')}
                    className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${method === 'asset' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    {isDebt ? <PackageMinus size={24} /> : <PackagePlus size={24} />}
                    <span className="text-sm font-bold">Intercambio Activo</span>
                </button>
            </div>
          </div>

          {/* Dynamic Content based on Method */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            {method === 'money' ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {isDebt ? '¿De dónde sale el dinero?' : '¿A dónde entra el dinero?'}
                    </label>
                    <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 outline-none"
                    >
                        {liquidAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>
                                {acc.name} ({acc.currency}) - Disponible: {acc.amount}
                            </option>
                        ))}
                    </select>
                </div>
            ) : (
                // Asset Logic
                <div>
                    {isDebt ? (
                        <>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Selecciona el objeto que entregas:
                            </label>
                            <select
                                value={selectedAssetId}
                                onChange={(e) => setSelectedAssetId(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 outline-none mb-2"
                            >
                                <option value="">Seleccionar del Inventario</option>
                                {inventory.map(asset => (
                                    <option key={asset.id} value={asset.id}>
                                        {asset.name} (Valuado: {asset.estimatedValue} {asset.currency})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-red-500">* Este objeto se eliminará de tu inventario.</p>
                        </>
                    ) : (
                        <>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Objeto que recibes como pago:
                            </label>
                            <div className="space-y-3">
                                <input 
                                    type="text" 
                                    placeholder="Nombre del objeto (Ej: Teléfono)" 
                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                    value={newAssetName}
                                    onChange={e => setNewAssetName(e.target.value)}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Detalles / Estado" 
                                    className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                                    value={newAssetDesc}
                                    onChange={e => setNewAssetDesc(e.target.value)}
                                />
                                <p className="text-xs text-green-500">* Se agregará a tu Patrimonio Físico.</p>
                            </div>
                        </>
                    )}
                </div>
            )}
          </div>

          <button
            type="submit"
            className={`w-full font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${isDebt ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <CheckCircle2 size={20} />
            Confirmar Operación
          </button>
        </form>
      </div>
    </div>
  );
};
