import React, { useState } from 'react';
import { FinancialItem, Category, Currency } from '../types';
import { PlusCircle, X, Save } from 'lucide-react';

interface ItemFormProps {
  onAdd?: (item: Omit<FinancialItem, 'id'>) => void;
  onEdit?: (item: FinancialItem) => void;
  initialData?: FinancialItem;
  preselectedType?: 'asset' | 'liability';
  preselectedCategory?: Category;
  onClose: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onAdd, onEdit, initialData, preselectedType, preselectedCategory, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'USD');
  const [type, setType] = useState<'asset' | 'liability'>(initialData?.type || preselectedType || 'liability');
  const [category, setCategory] = useState<Category>(initialData?.category || preselectedCategory || 'Expense');
  const [isMonthly, setIsMonthly] = useState(initialData?.isMonthly || false);
  const [dayOfMonth, setDayOfMonth] = useState(initialData?.dayOfMonth?.toString() || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [customRate, setCustomRate] = useState(initialData?.customExchangeRate?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    const numericAmount = parseFloat(amount);
    const numericCustomRate = customRate ? parseFloat(customRate) : undefined;
    const numericDay = dayOfMonth ? parseInt(dayOfMonth) : undefined;

    const newItemData = {
      name,
      amount: numericAmount,
      currency,
      type,
      category,
      isMonthly,
      dayOfMonth: isMonthly ? numericDay : undefined,
      note,
      customExchangeRate: numericCustomRate
    };

    if (initialData && onEdit) {
      onEdit({
        ...initialData,
        ...newItemData
      });
    } else if (onAdd) {
      onAdd(newItemData);
    }
    onClose();
  };

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transition-colors border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-900 dark:bg-blue-950 p-4 flex justify-between items-center text-white sticky top-0 z-10">
          <h3 className="font-bold text-lg">
            {isEditing ? 'Editar Movimiento' :
              preselectedCategory === 'Receivable' ? 'Agregar: Me Deben' :
                preselectedCategory === 'Savings' ? 'Agregar: Ahorro' :
                  preselectedType === 'asset' ? 'Agregar: Tengo' :
                    preselectedType === 'liability' ? 'Agregar: Gasto/Deuda' :
                      'Agregar Movimiento'}
          </h3>
          <button onClick={onClose} className="hover:text-blue-200 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Type Selection */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <button
              type="button"
              className={`py-2 rounded-md text-sm font-medium transition-colors ${type === 'asset' ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => { setType('asset'); setCategory('Bank'); }}
            >
              Tengo / Me Deben
            </button>
            <button
              type="button"
              className={`py-2 rounded-md text-sm font-medium transition-colors ${type === 'liability' ? 'bg-white dark:bg-gray-600 text-red-700 dark:text-red-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => { setType('liability'); setCategory('Expense'); }}
            >
              Debo / Gastos
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre / Persona</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Ej: Banco Venezuela, Binance, Comida..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Monto</label>
              <input
                required
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              >
                <option value="USD">USD ($)</option>
                <option value="VES">Bolívares (Bs.S)</option>
                <option value="EUR">Euros (€)</option>
              </select>
            </div>
          </div>

          {/* Conditional Custom Rate Input for VES */}
          {currency === 'VES' && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <label className="block text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                Tasa de cambio personalizada (Opcional)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Bs/$</span>
                <input
                  type="number"
                  step="0.01"
                  value={customRate}
                  onChange={(e) => setCustomRate(e.target.value)}
                  className="w-full border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Usar tasa global"
                />
              </div>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                Si se deja vacío, se usará la tasa global del Dashboard.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              >
                {type === 'asset' ? (
                  <>
                    <option value="Bank">Banco</option>
                    <option value="Cash">Efectivo</option>
                    <option value="Crypto">Cripto/Binance</option>
                    <option value="Wallet">Billetera (Zinli, etc)</option>
                    <option value="Receivable">Me Deben</option>
                    <option value="Savings">Ahorro</option>
                  </>
                ) : (
                  <>
                    <option value="Expense">Gasto Fijo</option>
                    <option value="Debt">Deuda</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Monthly Checkbox and Date */}
          {type === 'liability' && (
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="monthly"
                  checked={isMonthly}
                  onChange={(e) => setIsMonthly(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="monthly" className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Es un gasto mensual fijo</label>
              </div>

              {isMonthly && (
                <div className="pl-6 animate-fadeIn">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Día del mes de pago (Para calendario)</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className="w-20 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md p-1.5 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Ej: 15"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nota (Opcional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
              placeholder="Ej: BCV, Tasa oficial..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-900 hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isEditing ? <Save size={20} /> : <PlusCircle size={20} />}
            {isEditing ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </div>
    </div>
  );
};