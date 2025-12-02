import React, { useState } from 'react';
import { PhysicalAsset, Currency } from '../../../types';
import { Package, Save, X, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

interface PhysicalAssetFormProps {
  onAdd?: (asset: Omit<PhysicalAsset, 'id'>) => void;
  onEdit?: (asset: PhysicalAsset) => void;
  onDelete?: (id: string) => void;
  initialData?: PhysicalAsset;
  onClose: () => void;
}

export const PhysicalAssetForm: React.FC<PhysicalAssetFormProps> = ({ onAdd, onEdit, onDelete, initialData, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.estimatedValue.toString() || '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'USD');
  const [description, setDescription] = useState(initialData?.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    const assetData = { name, estimatedValue: parseFloat(amount), currency, description };
    if (initialData && onEdit) onEdit({ ...initialData, ...assetData });
    else if (onAdd) onAdd(assetData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-emerald-800 dark:bg-emerald-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2"><Package size={20} /> Inventario</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nombre del Artículo" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Valor Est." type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm">
                    <option value="USD">USD ($)</option>
                    <option value="VES">Bs.S</option>
                </select>
             </div>
          </div>
          <Input label="Descripción" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex gap-2 pt-2">
             <Button type="submit" fullWidth className="bg-emerald-700 hover:bg-emerald-800" icon={<Save size={18} />}>Guardar</Button>
             {initialData && onDelete && (
                 <Button type="button" variant="danger" className="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => { onDelete(initialData.id); onClose(); }} icon={<Trash2 size={18} />} />
             )}
          </div>
        </form>
      </div>
    </div>
  );
};