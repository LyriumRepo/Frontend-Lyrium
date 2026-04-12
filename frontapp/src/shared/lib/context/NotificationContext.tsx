'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useEcho } from '@laravel/echo-react';
import { ProactiveNotification, NotificationLevel } from '@/shared/types/notifications';
import { useSyncNotifications } from '@/shared/hooks/useSyncNotifications';
import { useAuth } from './AuthContext';
import { notificationRepository, Notification } from '@/lib/api/notificationRepository';

interface NotificationContextType {
    notifications: ProactiveNotification[];
    unreadCount: number;
    loading: boolean;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    addNotification: (notification: Omit<ProactiveNotification, 'id' | 'read' | 'time'>) => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SyncManager = () => {
    useSyncNotifications();
    return null;
};

function mapApiNotificationToProactive(notification: Notification): ProactiveNotification {
    let level: NotificationLevel = 'OPERATIONAL';
    let title = 'Notificación';
    let message = notification.subject ?? notification.message_preview ?? 'Nueva notificación';

    switch (notification.type) {
        // Tipos simples del backend
        case 'ticket_created':
            level = 'CRITICAL';
            title = 'Nuevo ticket creado';
            message = `${notification.vendor_name ?? 'Un vendedor'} creó: ${notification.subject}`;
            break;
        case 'ticket_replied':
            level = 'INFO';
            title = 'Nueva respuesta';
            message = `${notification.sender_name ?? 'Un usuario'} respondió: ${notification.message_preview}`;
            break;
        case 'ticket_status_changed':
            level = 'WARNING';
            title = 'Estado actualizado';
            message = `Ticket #${notification.ticket_number}: ${notification.old_status} → ${notification.new_status}`;
            break;
        // Tipos legacy (clases PHP)
        case 'App\\Notifications\\TicketCreatedNotification':
            level = 'CRITICAL';
            title = 'Nuevo ticket creado';
            message = `${notification.vendor_name ?? 'Un vendedor'} creó: ${notification.subject}`;
            break;
        case 'App\\Notifications\\TicketRepliedNotification':
            level = 'INFO';
            title = 'Nueva respuesta';
            message = `${notification.sender_name ?? 'Un usuario'} respondió: ${notification.message_preview}`;
            break;
        case 'App\\Notifications\\TicketStatusChangedNotification':
            level = 'WARNING';
            title = 'Estado actualizado';
            message = `Ticket #${notification.ticket_number}: ${notification.old_status} → ${notification.new_status}`;
            break;
    }

    const timeAgo = notification.created_at
        ? new Date(notification.created_at).toLocaleString('es-PE', {
              hour: '2-digit',
              minute: '2-digit',
              day: 'numeric',
              month: 'short',
          })
        : 'Ahora';

    return {
        id: notification.id,
        level,
        title,
        message,
        time: timeAgo,
        read: notification.is_read,
    };
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
    const [loading, setLoading] = useState(false);

    const refreshNotifications = useCallback(async () => {
        if (authLoading || !isAuthenticated) {
            setNotifications([]);
            return;
        }

        setLoading(true);
        try {
            const response = await notificationRepository.getAll();
            const mapped = response.data.map(mapApiNotificationToProactive);
            setNotifications(mapped);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAsRead = useCallback(async (id: string) => {
        try {
            await notificationRepository.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await notificationRepository.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }, []);

    const addNotification = useCallback((n: Omit<ProactiveNotification, 'id' | 'read' | 'time'>) => {
        const newNotification: ProactiveNotification = {
            ...n,
            id: Date.now().toString(),
            read: false,
            time: 'Ahora'
        };
        setNotifications(prev => [newNotification, ...prev]);

        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.play().catch(() => { });
        } catch (e) { }
    }, []);

    // Escucha notificaciones en tiempo real via WebSocket (reemplaza polling de 30s)
    useEcho<{ notification: Notification }>(
        `user.${user?.id ?? 0}`,
        'NotificationCreated',
        (event) => {
            if (!user) return;
            const mapped = mapApiNotificationToProactive(event.notification);
            setNotifications(prev => [mapped, ...prev]);
            try {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => { });
            } catch (e) { }
        },
        [user]
    );

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            markAsRead,
            markAllAsRead,
            addNotification,
            refreshNotifications,
        }}>
            <SyncManager />
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
