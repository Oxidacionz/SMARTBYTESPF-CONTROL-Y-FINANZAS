
import React, { useState, useEffect, useRef } from 'react';
import { FinancialItem, Category, Currency, DirectoryEntity } from '../../../types';
import { PlusCircle, X, Save, Search, UserPlus, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { dbDirectory } from '../../../services/db';

interface ItemFormProps {
  onAdd?: (item: Omit<FinancialItem, 'id'>) => void;
  onEdit?: (item: FinancialItem) => void;
  initialData?: FinancialItem;
  directory: DirectoryEntity[];
  onAddToDirectory: (entity: DirectoryEntity) => Promise<DirectoryEntity | null>;
  onClose: () => void;
}

export const ItemForm: React.FC<ItemFormProps> = ({ onAdd, onEdit, initialData, directory, onAddToDirectory, onClose }) => {
  // Form Fields
  const [name, setName] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [currency, setCurrency] = useState<Currency>(initialData?.currency || 'USD');
  const [type, setType] = useState<'asset' | 'liability'>(initialData?.type || 'liability');
  const [category, setCategory] = useState<Category>(initialData?.category || 'Expense');
  const [isMonthly, setIsMonthly] = useState(initialData?.isMonthly || false);
  const [dayOfMonth, setDayOfMonth] = useState(initialData?.dayOfMonth?.toString() || '');
  const [note, setNote] = useState(initialData?.note || '');
  const [customRate, setCustomRate] = useState(initialData?.customExchangeRate?.toString() || '');

  // New Fields for Directory & Dates
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(initialData?.entity_id || null);
  const [targetDate, setTargetDate] = useState(initialData?.target_date || '');

  // UI State for Directory Autocomplete
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on name input
  const suggestions = directory.filter(d =>
    d.name.toLowerCase().includes(name.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleSelectEntity = (entity: DirectoryEntity) => {
    setName(entity.name);
    setSelectedEntityId(entity.id);
    setShowSuggestions(false);
  };

  const handleCreateEntity = async () => {
    if (!name) return;
    const newEntity: DirectoryEntity = {
      id: crypto.randomUUID(),
      name: name,
      type: type === 'asset' ? 'platform' : 'person' // Default guess
    };
    const created = await onAddToDirectory(newEntity);
    if (created) {
      setSelectedEntityId(created.id);
      setShowSuggestions(false);
    }
  };

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
      customExchangeRate: numericCustomRate,
      entity_id: selectedEntityId,
      target_date: targetDate || null
    };

    if (initialData && onEdit) onEdit({ ...initialData, ...newItemData });
    else if (onAdd) onAdd(newItemData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-2 border-slate-600/50 max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 flex justify-between items-center text-white sticky top-0 z-10 border-b-2 border-amber-500/30">
          <h3 className="font-bold text-lg bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">{initialData ? 'Editar Movimiento' : 'Agregar Movimiento'}</h3>
          <button onClick={onClose} className="text-slate-300 hover:text-amber-400 transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!initialData ? (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => { setType('asset'); setCategory('Bank'); }}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${type === 'asset' && category !== 'Receivable' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 hover:border-green-200 text-gray-600'}`}
              >
                <span className="font-bold text-sm">Tengo</span>
                <span className="text-[10px] opacity-70">Dinero, Bancos</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('asset'); setCategory('Receivable'); }}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${category === 'Receivable' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-200 text-gray-600'}`}
              >
                <span className="font-bold text-sm">Me Deben</span>
                <span className="text-[10px] opacity-70">Cuentas por Cobrar</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('liability'); setCategory('Expense'); }}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${type === 'liability' && category !== 'Debt' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 hover:border-yellow-200 text-gray-600'}`}
              >
                <span className="font-bold text-sm">Gasto</span>
                <span className="text-[10px] opacity-70">Salidas, Compras</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('liability'); setCategory('Debt'); }}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${category === 'Debt' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 hover:border-red-200 text-gray-600'}`}
              >
                <span className="font-bold text-sm">Debo</span>
                <span className="text-[10px] opacity-70">Cuentas por Pagar</span>
              </button>

              <button
                type="button"
                onClick={() => { setType('asset'); setCategory('Savings'); }}
                className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${category === 'Savings' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-200 text-gray-600'}`}
              >
                <span className="font-bold text-sm">Ahorro</span>
                <span className="text-[10px] opacity-70">Metas y Fondos</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                type="button"
                className={`py-2 rounded-md text-sm font-medium transition-colors ${type === 'asset' ? 'bg-white dark:bg-gray-600 text-green-700 dark:text-green-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => { setType('asset'); setCategory('Bank'); }}
              >
                Activo / Ingreso
              </button>
              <button
                type="button"
                className={`py-2 rounded-md text-sm font-medium transition-colors ${type === 'liability' ? 'bg-white dark:bg-gray-600 text-red-700 dark:text-red-400 shadow' : 'text-gray-500 dark:text-gray-400'}`}
                onClick={() => { setType('liability'); setCategory('Expense'); }}
              >
                Pasivo / Gasto
              </button>
            </div>
          )}

          {/* Directory Autocomplete */}
          <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-amber-300 mb-1">Nombre / Entidad</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setShowSuggestions(true);
                    if (selectedEntityId) setSelectedEntityId(null); // Clear ID if typing new name
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full border-2 border-slate-600 bg-slate-900/50 text-white rounded-lg p-2 pl-9 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors text-sm placeholder-slate-400"
                  placeholder="Buscar o escribir nombre..."
                  autoComplete="off"
                />
                <Search size={16} className="absolute left-3 top-2.5 text-amber-400" />
              </div>
            </div>

            {showSuggestions && name && (
              <div className="absolute z-20 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                {suggestions.length > 0 ? (
                  suggestions.map(entity => (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => handleSelectEntity(entity)}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2"
                    >
                      <div className={`w-2 h-2 rounded-full ${entity.type === 'person' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                      {entity.name}
                    </button>
                  ))
                ) : (
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={handleCreateEntity}
                      className="w-full text-left px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/40"
                    >
                      <UserPlus size={16} />
                      Agregar "{name}" al Directorio
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Monto" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required placeholder="0.00" />
            <div>
              <label className="block text-sm font-medium text-amber-300 mb-1">Moneda</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="w-full border-2 border-slate-600 bg-slate-900/50 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="USD">USD ($)</option>
                <option value="VES">Bolívares (Bs.S)</option>
                <option value="EUR">Euros (€)</option>
              </select>
            </div>
          </div>

          {currency === 'VES' && (
            <Input label="Tasa Personalizada (Opcional)" type="number" step="0.01" value={customRate} onChange={(e) => setCustomRate(e.target.value)} placeholder="Usar tasa global" />
          )}

          <div>
            <label className="block text-sm font-medium text-amber-300 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full border-2 border-slate-600 bg-slate-900/50 text-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              {type === 'asset' ? (
                <>
                  <option value="Bank">Banco</option>
                  <option value="Cash">Efectivo</option>
                  <option value="Crypto">Cripto/Binance</option>
                  <option value="Wallet">Billetera (Zinli, etc)</option>
                  <option value="Receivable">Me Deben (Cuentas por Cobrar)</option>
                  <option value="Savings">Ahorro / Meta</option>
                </>
              ) : (
                <>
                  <option value="Expense">Gasto Fijo</option>
                  <option value="Debt">Deuda (Cuentas por Pagar)</option>
                </>
              )}
            </select>
          </div>

          {/* Target Date (New) */}
          {(category === 'Debt' || category === 'Receivable') && (
            <div className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-1">
                <CalendarIcon size={12} />
                {type === 'asset' ? 'Fecha Estimada de Cobro' : 'Fecha Límite de Pago'}
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 text-sm"
              />
            </div>
          )}

          {type === 'liability' && category !== 'Debt' && (
            <div className="space-y-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center">
                <input type="checkbox" checked={isMonthly} onChange={(e) => setIsMonthly(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Es un gasto mensual fijo</label>
              </div>
              {isMonthly && (
                <Input label="Día de pago" type="number" min="1" max="31" value={dayOfMonth} onChange={(e) => setDayOfMonth(e.target.value)} placeholder="15" className="w-20" />
              )}
            </div>
          )}

          <Input label="Nota / Detalles" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: Venta de Laptop, Revisión..." />

          <Button type="submit" fullWidth icon={initialData ? <Save size={20} /> : <PlusCircle size={20} />}>
            {initialData ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </div>
    </div>
  );
};
