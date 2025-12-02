
import React, { useState } from 'react';
import { PhysicalAsset, Currency } from '../types';
import { Package, Save, X, Trash2 } from 'lucide-react';

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

    const assetData = {
      name,
      estimatedValue: parseFloat(amount),
      currency,
      description
    };

    if (initialData && onEdit) {
      onEdit({ ...initialData, ...assetData });
    } else if (onAdd) {
      onAdd(assetData);
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete) {
        if(window.confirm('¿Estás seguro de eliminar este ítem del inventario?')) {
            onDelete(initialData.id);
            onClose();
        }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-emerald-800 dark:bg-emerald-900 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Package size={20} />
            {initialData ? 'Editar Activo Físico' : 'Nuevo Activo Físico'}
          </h3>
          <button onClick={onClose} className="hover:text-emerald-200 transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Artículo</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ej: Laptop HP, Bicicleta, TV..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor Estimado</label>
                <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="0.00"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                    <option value="USD">USD ($)</option>
                    <option value="VES">Bs.S</option>
                    <option value="EUR">EUR (€)</option>
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción / Detalles (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none"
              placeholder="Estado, fecha de compra aproximada, etc..."
            />
          </div>

          <div className="flex gap-2 pt-2">
             <button
                type="submit"
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Save size={18} />
                Guardar Inventario
            </button>
            {initialData && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="px-4 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 rounded-lg transition-colors flex items-center justify-center"
                >
                    <Trash2 size={18} />
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
