
import React from 'react';
import { SpecialEvent } from '../../types';
import { Calendar, Edit, Gift, CreditCard, Clock } from 'lucide-react';
import { Card } from '../atoms/Card';
import { Button } from '../atoms/Button';

interface AgendaWidgetProps {
  events: SpecialEvent[];
  onAddEvent: () => void;
  onEditEvent: (event: SpecialEvent) => void;
}

export const AgendaWidget: React.FC<AgendaWidgetProps> = ({ events, onAddEvent, onEditEvent }) => {
  return (
    <Card className="p-0 overflow-hidden border-none shadow-md">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 dark:from-blue-950 dark:to-indigo-950 p-4 flex justify-between items-center text-white">
        <h3 className="font-bold flex items-center gap-2">
          <Calendar size={18} className="text-blue-300" />
          Agenda Financiera
        </h3>
        <button 
          onClick={onAddEvent} 
          className="bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors text-xs flex items-center gap-1 px-2"
        >
          + Agregar
        </button>
      </div>
      
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto bg-white dark:bg-gray-800">
        {events.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">
            No hay eventos próximos.
          </div>
        ) : (
          events.map((event, index) => {
            const isRecurring = event.id.startsWith('recurring');
            const [month, day] = event.date.split('-');
            const dateObj = new Date();
            const currentMonth = dateObj.getMonth() + 1;
            const isThisMonth = parseInt(month) === currentMonth;

            return (
              <div 
                key={event.id} 
                className={`relative flex gap-4 group ${!isRecurring ? 'cursor-pointer' : ''}`}
                onClick={() => !isRecurring && onEditEvent(event)}
              >
                {/* Vertical Line */}
                {index !== events.length - 1 && (
                  <div className="absolute left-[19px] top-8 bottom-[-16px] w-0.5 bg-gray-100 dark:bg-gray-700"></div>
                )}
                
                {/* Date Bubble */}
                <div className={`shrink-0 w-10 h-10 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold z-10 shadow-sm border-2 ${
                  isThisMonth 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-300'
                }`}>
                  <span className="text-sm leading-none">{day}</span>
                  <span className="text-[8px] uppercase opacity-80">{['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][parseInt(month)-1]}</span>
                </div>

                {/* Content */}
                <div className="flex-grow pb-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className={`text-sm font-semibold ${isThisMonth ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                        {event.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 ${
                          event.type === 'birthday' 
                            ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
                            : event.type === 'payment'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {event.type === 'birthday' ? <Gift size={8} /> : event.type === 'payment' ? <CreditCard size={8} /> : <Clock size={8} />}
                          {event.type === 'birthday' ? 'Cumpleaños' : event.type === 'payment' ? 'Pago' : 'Evento'}
                        </span>
                        {isRecurring && <span className="text-[9px] text-gray-400 italic">Automático</span>}
                      </div>
                    </div>
                    
                    {!isRecurring && (
                      <Edit size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
