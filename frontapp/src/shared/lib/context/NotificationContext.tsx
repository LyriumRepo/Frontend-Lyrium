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
    let action: ProactiveNotification['action'];
    let secondaryAction: ProactiveNotification['secondaryAction'];

    const notificationType = notification.type.replace('App\\Notifications\\', '');

    switch (notificationType) {
        case 'ticket_created':
        case 'TicketCreatedNotification':
            level = 'CRITICAL';
            title = 'Nuevo ticket creado';
            message = `${notification.vendor_name ?? 'Un vendedor'} creó: ${notification.subject}`;
            if (notification.ticket_id) {
                action = { type: 'ticket', id: notification.ticket_id, label: 'Ver ticket' };
            }
            break;
        case 'ticket_replied':
        case 'TicketRepliedNotification':
            level = 'INFO';
            title = 'Nueva respuesta';
            message = `${notification.sender_name ?? 'Un usuario'} respondió: ${notification.message_preview}`;
            if (notification.ticket_id) {
                action = { type: 'ticket', id: notification.ticket_id, label: 'Ver ticket' };
            }
            break;
        case 'ticket_status_changed':
        case 'TicketStatusChangedNotification':
            level = 'WARNING';
            title = 'Estado actualizado';
            message = `Ticket #${notification.ticket_number}: ${notification.old_status} → ${notification.new_status}`;
            if (notification.ticket_id) {
                action = { type: 'ticket', id: notification.ticket_id, label: 'Ver ticket' };
            }
            break;
        case 'order_created':
        case 'OrderCreatedNotification':
            level = 'INFO';
            title = '¡Pedido exitoso!';
            message = notification.subject ?? `Tu pedido ha sido registrado`;
            action = { type: 'orders', label: 'Ver pedido' };
            break;
        case 'new_order':
        case 'NewOrderSellerNotification':
            level = 'INFO';
            title = '¡Nuevo pedido recibido!';
            message = notification.subject ?? `Nuevo pedido en tu tienda`;
            action = { type: 'invoices', label: 'Ver comprobantes' };
            secondaryAction = { type: 'resend_email', id: notification.order_id ?? undefined, label: 'Enviar a correo', icon: 'Mail' };
            break;
        case 'store_status_changed':
        case 'StoreStatusNotification':
            level = 'WARNING';
            title = 'Estado de tienda actualizado';
            message = notification.subject ?? 'El estado de tu tienda ha cambiado';
            action = { type: 'store', label: 'Ir a tienda' };
            break;
        case 'new_chat_message':
        case 'NewChatMessageNotification':
            level = 'INFO';
            title = `💬 ${notification.sender_name ?? 'Nuevo mensaje'}`;
            message = notification.message_preview ?? notification.subject ?? 'Tienes un nuevo mensaje';
            if (notification.conversation_id) {
                action = { type: 'chat', id: notification.conversation_id, label: 'Ver mensaje' };
            }
            break;
        case 'invoice_requested':
        case 'InvoiceRequestedNotification':
            level = 'WARNING';
            title = '📄 Solicitud de comprobante';
            message = notification.subject ?? 'Un cliente solicitó un comprobante';
            if (notification.order_id) {
                action = { type: 'invoices', id: notification.order_id, label: 'Ver pedido' };
            }
            break;
        case 'order_tracking':
        case 'OrderStatusTrackingNotification':
            level = 'INFO';
            title = '📦 Pedido actualizado';
            message = notification.subject ?? 'Tu pedido ha sido actualizado';
            if (notification.order_id) {
                action = { type: 'orders', id: notification.order_id, label: 'Ver pedido' };
            }
            break;
        case 'order_delivered_seller':
        case 'OrderDeliveredSellerNotification':
            level = 'INFO';
            title = '✅ Pedido entregado';
            message = notification.subject ?? 'El cliente confirmó la recepción del pedido';
            if (notification.order_id) {
                action = { type: 'orders', id: notification.order_id, label: 'Ver pedido' };
            }
            break;
        case 'booking_created':
        case 'BookingCreatedNotification':
            level = 'INFO';
            title = '📅 Nueva reserva recibida';
            message = notification.service_name
                ? `Recibiste una reserva para ${notification.service_name}`
                : (notification.subject ?? 'Tienes una nueva reserva');
            action = { type: 'services', label: 'Ver reservas' };
            break;
        case 'booking_confirmed':
        case 'BookingConfirmedNotification':
            level = 'INFO';
            title = '✅ Reserva confirmada';
            message = notification.service_name
                ? `Tu reserva para ${notification.service_name} fue confirmada`
                : (notification.subject ?? 'Tu reserva fue confirmada');
            action = { type: 'orders', label: 'Ver pedido' };
            break;
        case 'booking_on_the_way':
        case 'BookingOnTheWayNotification':
            level = 'INFO';
            title = '🚗 Proveedor en camino';
            message = notification.service_name
                ? `El equipo está en camino para tu servicio de ${notification.service_name}`
                : (notification.subject ?? 'El proveedor está en camino');
            action = { type: 'orders', label: 'Ver pedido' };
            break;
        case 'profile_request_created':
        case 'ProfileRequestNotification':
            level = 'WARNING';
            title = '📋 Solicitud de perfil';
            message = notification.subject ?? `${notification.seller_name ?? 'Un vendedor'} actualizó su perfil`;
            if (notification.store_id) {
                action = { type: 'store', id: notification.store_id, label: 'Ver tienda' };
            }
            break;
        case 'store_profile_updated':
        case 'StoreProfileUpdatedNotification':
            level = 'INFO';
            title = '✏️ Tienda actualizada';
            message = notification.subject ?? `${notification.store_name ?? 'Una tienda'} actualizó su perfil`;
            if (notification.store_id) {
                action = { type: 'store', id: notification.store_id, label: 'Ver tienda' };
            }
            break;
        default:
            level = 'INFO';
            title = 'Notificación';
            message = notification.subject ?? notification.message_preview ?? 'Nueva notificación';
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
        metadata: { type: notificationType },
        action,
        secondaryAction,
    };
}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();

    const [notifications, setNotifications] = useState<ProactiveNotification[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshNotifications = useCallback(async () => {
        if (authLoading) {
            // Auth aún no terminó — esperar sin cambiar loading
            setNotifications([]);
            return;
        }
        if (!isAuthenticated) {
            setNotifications([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await notificationRepository.getAll();
            const mapped = response.data.map(mapApiNotificationToProactive);
            const unique = mapped.filter((n, i, arr) => arr.findIndex(x => x.id === n.id) === i);
            setNotifications(unique);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, authLoading]);

    useEffect(() => {
        refreshNotifications();
    }, [refreshNotifications]);

    // Polling cada 30s como fallback cuando Reverb no está disponible
    useEffect(() => {
        if (!isAuthenticated) return;
        const id = setInterval(() => refreshNotifications(), 30_000);
        return () => clearInterval(id);
    }, [isAuthenticated, refreshNotifications]);

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

    // WebSocket en tiempo real + polling como fallback
    useEcho<{ notification: Notification }>(
        user?.id ? `user.${user.id}` : 'user.__placeholder',
        'NotificationCreated',
        (event) => {
            if (!user) return;
            const mapped = mapApiNotificationToProactive(event.notification);
            setNotifications(prev => {
                if (prev.some(n => n.id === mapped.id)) return prev;
                return [mapped, ...prev];
            });
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
