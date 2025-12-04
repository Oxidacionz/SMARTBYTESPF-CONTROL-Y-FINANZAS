import React from 'react';
import { X, Check, Bell, Calendar, Trophy, Info } from 'lucide-react';
import { Notification } from '../types/notification';

interface NotificationsPanelProps {
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
    notifications,
    onClose,
    onMarkAsRead,
    onMarkAllAsRead
}) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'event': return <Calendar size={18} className="text-blue-500" />;
            case 'success': return <Trophy size={18} className="text-yellow-500" />;
            case 'warning': return <Bell size={18} className="text-orange-500" />;
            default: return <Info size={18} className="text-gray-500" />;
        }
    };

    return (
        <div className="absolute top-16 right-4 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Bell size={18} /> Notificaciones
                </h3>
                <div className="flex items-center gap-2">
                    {notifications.some(n => !n.read) && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Marcar leídas
                        </button>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No tienes notificaciones nuevas</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors relative group ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 flex-shrink-0 ${!notification.read ? 'opacity-100' : 'opacity-60'}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {notification.title}
                                            </h4>
                                            {!notification.read && (
                                                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                                            {notification.message}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] text-gray-400">{notification.date}</span>
                                            {!notification.read && (
                                                <button
                                                    onClick={() => onMarkAsRead(notification.id)}
                                                    className="text-[10px] flex items-center gap-1 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Check size={12} /> Marcar leída
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
