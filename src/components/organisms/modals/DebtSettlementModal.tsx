import React, { useState } from 'react';
import { FinancialItem, PhysicalAsset } from '../../../types';
import { CheckCircle2, Coins, ArrowRightLeft, PackagePlus, PackageMinus, X, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

interface DebtSettlementModalProps {
  item: FinancialItem;
  liquidAccounts: FinancialItem[];
  inventory: PhysicalAsset[];
  onConfirm: (amount: number, method: 'money' | 'asset_out' | 'asset_in' | 'delete_debt', details: any) => void;
  onClose: () => void;
}

export const DebtSettlementModal: React.FC<DebtSettlementModalProps> = ({ item, liquidAccounts, inventory, onConfirm, onClose }) => {
  const isDebt = item.type === 'liability';
  const [amount, setAmount] = useState(item.amount.toString());
  const [method, setMethod] = useState<'money' | 'asset'>('money');
  const [note, setNote] = useState(isDebt ? 'Pago de deuda' : 'Cobro de deuda');
  const [selectedAccountId, setSelectedAccountId] = useState(liquidAccounts[0]?.id || '');
  const [selectedAssetId, setSelectedAssetId] = useState(inventory[0]?.id || '');
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetDesc, setNewAssetDesc] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount) return;

    if (method === 'money') {
      if (!selectedAccountId) return;
      onConfirm(numAmount, 'money', { accountId: selectedAccountId, note });
    } else {
      if (isDebt) {
        if (!selectedAssetId) return;
        onConfirm(numAmount, 'asset_out', { assetId: selectedAssetId, note: `${note} (Pagado con Item)` });
      } else {
        if (!newAssetName) return;
        onConfirm(numAmount, 'asset_in', { newAsset: { name: newAssetName, description: newAssetDesc, estimatedValue: numAmount, currency: item.currency }, note: `${note} (Recibido Item)` });
      }
    }
  };

  const handleDeleteDebt = () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta deuda/cuenta por cobrar? Se registrará como saldada sin movimiento de dinero.")) {
      onConfirm(item.amount, 'delete_debt', { note: `${note} (Eliminada/Saldada Manualmente)` });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col max-h-[90vh]">
        <div className={`${isDebt ? 'bg-red-700' : 'bg-green-700'} p-4 flex justify-between items-center text-white shrink-0`}>
          <h3 className="font-bold text-lg flex items-center gap-2"><ArrowRightLeft size={20} /> {isDebt ? `Pagar: ${item.name}` : `Cobrar: ${item.name}`}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Monto" type="number" step="0.01" max={item.amount} value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input label="Nota" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => setMethod('money')} className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${method === 'money' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'border-gray-200 dark:border-gray-700'}`}>
              <Coins size={24} /> <span className="text-sm font-bold">Dinero</span>
            </button>
            <button type="button" onClick={() => setMethod('asset')} className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${method === 'asset' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'border-gray-200 dark:border-gray-700'}`}>
              {isDebt ? <PackageMinus size={24} /> : <PackagePlus size={24} />} <span className="text-sm font-bold">Activo</span>
            </button>
            <button type="button" onClick={handleDeleteDebt} className="flex-1 p-3 rounded-lg border-2 border-red-200 dark:border-red-900/30 flex flex-col items-center gap-2 transition-all hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400">
              <Trash2 size={24} /> <span className="text-sm font-bold">Saldar/Borrar</span>
            </button>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            {method === 'money' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{isDebt ? '¿De dónde sale?' : '¿A dónde entra?'}</label>
                <select value={selectedAccountId} onChange={(e) => setSelectedAccountId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 outline-none">
                  {liquidAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>)}
                </select>
              </div>
            ) : (
              <div>
                {isDebt ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entregar:</label>
                    <select value={selectedAssetId} onChange={(e) => setSelectedAssetId(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 outline-none">
                      {inventory.map(asset => <option key={asset.id} value={asset.id}>{asset.name}</option>)}
                    </select>
                  </>
                ) : (
                  <div className="space-y-3">
                    <Input label="Objeto recibido" value={newAssetName} onChange={e => setNewAssetName(e.target.value)} placeholder="Ej: Teléfono" />
                    <Input label="Detalles" value={newAssetDesc} onChange={e => setNewAssetDesc(e.target.value)} />
                  </div>
                )}
              </div>
            )}
          </div>

          <Button type="submit" fullWidth className={isDebt ? 'bg-red-600' : 'bg-green-600'} icon={<CheckCircle2 size={20} />}>Confirmar</Button>
        </form>
      </div>
    </div>
  );
};