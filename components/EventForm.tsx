import React, { useState } from 'react';
import { SpecialEvent } from '../types';
import { X, Calendar, Save, Trash2 } from 'lucide-react';

interface EventFormProps {
  onAdd?: (event: Omit<SpecialEvent, 'id'>) => void;
  onEdit?: (event: SpecialEvent) => void;
  onDelete?: (id: string) => void;
  initialData?: SpecialEvent;
  onClose: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({ onAdd, onEdit, onDelete, initialData, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [date, setDate] = useState(initialData?.date || '');
  const [type, setType] = useState<'birthday' | 'payment' | 'other'>(initialData?.type || 'other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !date) return;

    const newEvent = { name, date, type };

    if (initialData && onEdit) {
      onEdit({ ...initialData, ...newEvent });
    } else if (onAdd) {
      onAdd(newEvent);
    }
    onClose();
  };

  const handleDelete = () => {
      if (initialData && onDelete) {
          onDelete(initialData.id);
          onClose();
      }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-purple-900 dark:bg-purple-950 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">{initialData ? 'Editar Evento' : 'Nuevo Evento'}</h3>
          <button onClick={onClose} className="hover:text-purple-200 transition-colors"><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Evento</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="Ej: Cumpleaños Mamá"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha (MM-DD)</label>
            <input
              required
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-2 focus:ring-2 focus:ring-purple-500 outline-none"
              placeholder="05-15"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
             <div className="flex gap-2">
                 <button type="button" onClick={() => setType('birthday')} className={`flex-1 py-2 text-xs rounded border ${type === 'birthday' ? 'bg-pink-100 border-pink-500 text-pink-700' : 'border-gray-300 text-gray-500'}`}>Cumpleaños</button>
                 <button type="button" onClick={() => setType('payment')} className={`flex-1 py-2 text-xs rounded border ${type === 'payment' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300 text-gray-500'}`}>Pago</button>
                 <button type="button" onClick={() => setType('other')} className={`flex-1 py-2 text-xs rounded border ${type === 'other' ? 'bg-gray-100 border-gray-500 text-gray-700' : 'border-gray-300 text-gray-500'}`}>Otro</button>
             </div>
          </div>

          <div className="flex gap-2 pt-2">
             <button
                type="submit"
                className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <Save size={18} />
                Guardar
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