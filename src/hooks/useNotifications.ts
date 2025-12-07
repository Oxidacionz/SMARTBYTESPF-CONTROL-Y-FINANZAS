import { useState, useEffect, useCallback } from 'react';
import { Notification } from '../types/notification';

export const useNotifications = (allEvents: any[]) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((n: Notification) => {
        setNotifications(prev => {
            const exists = prev.some(existing => existing.id === n.id);
            if (exists) return prev;
            return [n, ...prev];
        });
    }, []);

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    // Logical checks for automatic notifications
    useEffect(() => {
        const generateNotifications = () => {
            const newNotifications: Notification[] = [];
            const today = new Date();

            // Check version update
            const hasSeenUpdate = localStorage.getItem('hasSeenUpdate_v2');
            if (!hasSeenUpdate) {
                newNotifications.push({
                    id: 'update-v2',
                    title: '¡Nuevas Funciones!',
                    message: 'Ahora puedes usar los botones rápidos de "Tengo", "Me Deben", "Gasto" y "Ahorro". También las tasas se actualizan solas.',
                    type: 'info',
                    date: 'Hoy',
                    read: false
                });
                localStorage.setItem('hasSeenUpdate_v2', 'true');
            }

            // Check events (birthdays, payments)
            allEvents.forEach(event => {
                const [month, day] = (event.date || '00-00').split('-').map(Number);
                const eventDate = new Date(today.getFullYear(), month - 1, day);

                // Handle year wrap for dates in early next year check from late this year
                if (eventDate < today && (today.getMonth() > 10 && month < 2)) {
                    eventDate.setFullYear(today.getFullYear() + 1);
                }

                const diffTime = eventDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays >= 0 && diffDays <= 7) {
                    newNotifications.push({
                        id: `event-${event.id}-${today.getFullYear()}`,
                        title: event.type === 'birthday' ? '🎂 Cumpleaños Cercano' : '📅 Pago Próximo',
                        message: `${event.name} es ${diffDays === 0 ? 'hoy' : diffDays === 1 ? 'mañana' : `en ${diffDays} días`}.`,
                        type: 'event',
                        date: diffDays === 0 ? 'Hoy' : `${day}/${month}`,
                        read: false
                    });
                }
            });

            if (newNotifications.length > 0) {
                setNotifications(prev => {
                    const existingIds = new Set(prev.map(n => n.id));
                    const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
                    if (uniqueNew.length === 0) return prev;
                    return [...uniqueNew, ...prev];
                });
            }
        };

        generateNotifications();
    }, [allEvents]);

    return {
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        setNotifications // Expose setter if needed for manual actions
    };
};
