import React, { useState } from 'react';
import { SpecialEvent } from '../../../types';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';

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
    if (initialData && onEdit) onEdit({ ...initialData, ...newEvent });
    else if (onAdd) onAdd(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-purple-900 dark:bg-purple-950 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold text-lg">{initialData ? 'Editar Evento' : 'Nuevo Evento'}</h3>
          <button onClick={onClose}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nombre del Evento" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Fecha (MM-DD)" value={date} onChange={(e) => setDate(e.target.value)} required placeholder="05-15" />
          
          <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
             <div className="flex gap-2">
                 {['birthday', 'payment', 'other'].map(t => (
                     <button key={t} type="button" onClick={() => setType(t as any)} className={`flex-1 py-2 text-xs rounded border capitalize ${type === t ? 'bg-purple-100 border-purple-500 text-purple-700' : 'border-gray-300 text-gray-500'}`}>
                         {t}
                     </button>
                 ))}
             </div>
          </div>

          <div className="flex gap-2 pt-2">
             <Button type="submit" fullWidth className="bg-purple-700 hover:bg-purple-800" icon={<Save size={18} />}>Guardar</Button>
             {initialData && onDelete && (
                 <Button type="button" variant="danger" className="bg-red-100 text-red-700 hover:bg-red-200" onClick={() => { onDelete(initialData.id); onClose(); }} icon={<Trash2 size={18} />} />
             )}
          </div>
        </form>
      </div>
    </div>
  );
};