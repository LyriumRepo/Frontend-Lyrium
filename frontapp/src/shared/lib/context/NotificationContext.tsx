'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    deleteAll: () => Promise<void>;
    addNotification: (notification: Omit<ProactiveNotification, 'id' | 'read' | 'time'>) => void;
    refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

function isWithin24h(createdAt?: string): boolean {
    if (!createdAt) return true;
    return Date.now() - new Date(createdAt).getTime() < TWENTY_FOUR_HOURS;
}

function formatRelativeTime(createdAt?: string): string {
    if (!createdAt) return 'Ahora';
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(diffMs / 60_000);
    if (mins < 1) return 'Ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${Math.floor(hours / 24)}d`;
}

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
        case 'new_order_admin':
        case 'NewOrderAdminNotification':
            level = 'INFO';
            title = 'Nuevo pedido en la plataforma';
            message = notification.subject ?? 'Un nuevo pedido fue realizado';
            if (notification.order_id) {
                action = { type: 'orders', id: notification.order_id, label: 'Ver pedido' };
            }
            break;
        case 'store_status_changed':
        case 'StoreStatusNotification':
            level = 'WARNING';
            title = 'Estado de tienda actualizado';
            message = `${notification.store_name ?? 'Tu tienda'} cambió a: ${notification.store_status ?? (notification.subject ?? '—')}`;
            if (notification.reason) message += `. Motivo: ${notification.reason}`;
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
        case 'booking_cancelled':
        case 'BookingCancelledNotification':
            level = 'WARNING';
            title = '❌ Reserva cancelada';
            message = notification.service_name
                ? `La reserva para ${notification.service_name} fue cancelada`
                : (notification.subject ?? 'Una reserva fue cancelada');
            action = { type: 'orders', label: 'Ver pedidos' };
            break;
        case 'order_cancelled':
        case 'OrderCancelledSellerNotification':
        case 'order_cancelled_customer':
        case 'OrderCancelledCustomerNotification':
            level = 'WARNING';
            title = '❌ Pedido cancelado';
            message = notification.subject ?? 'Un pedido fue cancelado';
            if (notification.order_id) {
                action = { type: 'orders', id: notification.order_id, label: 'Ver pedido' };
            }
            break;
        case 'payment_confirmed':
        case 'OrderPaymentConfirmedNotification':
            level = 'INFO';
            title = '💳 Pago confirmado';
            message = notification.subject ?? 'El pago de tu pedido fue confirmado';
            if (notification.order_id) {
                action = { type: 'orders', id: notification.order_id, label: 'Ver pedido' };
            }
            break;
        case 'product_status_changed':
        case 'ProductStatusNotification': {
            const pStatus = notification.status ?? notification.product_status;
            if (pStatus === 'approved') {
                level = 'INFO';
                title = '📦 Producto aprobado';
                message = `${notification.product_name ?? 'Tu producto'} ha sido aprobado.`;
            } else if (pStatus === 'rejected') {
                level = 'WARNING';
                title = '📦 Producto rechazado';
                message = `${notification.product_name ?? 'Tu producto'} fue rechazado.`;
                if (notification.reason) message += ` Motivo: ${notification.reason}`;
            } else {
                level = 'INFO';
                title = '📦 Estado de producto actualizado';
                message = notification.subject ?? 'El estado de tu producto ha cambiado';
            }
            action = { type: 'products', label: 'Ver productos' };
            break;
        }
        case 'product_pending_review':
        case 'ProductPendingReviewNotification':
            level = 'WARNING';
            title = '🔍 Producto pendiente de revisión';
            message = notification.subject ?? 'Un producto está esperando aprobación';
            action = { type: 'products', label: 'Revisar producto' };
            break;
        case 'service_status_changed':
        case 'ServiceStatusNotification': {
            const sStatus = notification.status ?? notification.service_status;
            if (sStatus === 'approved') {
                level = 'INFO';
                title = '🛠️ Servicio aprobado';
                message = `${notification.service_name ?? 'Tu servicio'} ha sido aprobado.`;
            } else if (sStatus === 'rejected') {
                level = 'WARNING';
                title = '🛠️ Servicio rechazado';
                message = `${notification.service_name ?? 'Tu servicio'} fue rechazado.`;
                if (notification.reason) message += ` Motivo: ${notification.reason}`;
            } else {
                level = 'INFO';
                title = '🛠️ Estado de servicio actualizado';
                message = notification.subject ?? 'El estado de tu servicio ha cambiado';
            }
            action = { type: 'services', label: 'Ver servicios' };
            break;
        }
        case 'service_pending_review':
        case 'ServicePendingReviewNotification':
            level = 'WARNING';
            title = '🔍 Servicio pendiente de revisión';
            message = notification.subject ?? 'Un servicio está esperando aprobación';
            action = { type: 'services', label: 'Revisar servicio' };
            break;
        case 'stock_alert':
        case 'StockAlertNotification':
            level = 'CRITICAL';
            title = '⚠️ Alerta de stock bajo';
            message = notification.subject ?? 'Un producto tiene stock bajo';
            action = { type: 'products', label: 'Ver productos' };
            break;
        case 'plan_activated':
        case 'PlanActivatedNotification':
            level = 'INFO';
            title = '🎉 Plan activado';
            message = notification.subject ?? 'Tu plan ha sido activado exitosamente';
            action = { type: 'plans', label: 'Ver mi plan' };
            break;
        case 'plan_expiring':
        case 'PlanExpiringNotification':
            level = 'WARNING';
            title = '⏰ Plan por vencer';
            message = notification.subject ?? 'Tu plan está próximo a vencer';
            action = { type: 'plans', label: 'Renovar plan' };
            break;
        case 'plan_rejected':
        case 'PlanRejectedNotification':
            level = 'CRITICAL';
            title = '❌ Plan rechazado';
            message = notification.subject ?? 'Tu solicitud de plan fue rechazada';
            action = { type: 'plans', label: 'Ver detalles' };
            break;
        case 'new_plan_request':
        case 'NewPlanRequestNotification':
            level = 'WARNING';
            title = '📋 Nueva solicitud de plan';
            message = notification.subject ?? 'Una tienda solicitó un cambio de plan';
            action = { type: 'plans', label: 'Revisar solicitud' };
            break;
        case 'pending_stores_overdue':
        case 'PendingStoreOverdueNotification':
            level = 'CRITICAL';
            title = '🏪 Tiendas pendientes vencidas';
            message = notification.subject ?? 'Hay tiendas con solicitud de aprobación vencida';
            action = { type: 'store', label: 'Ver tiendas' };
            break;
        case 'birthday':
        case 'BirthdayNotification':
            level = 'INFO';
            title = '🎂 ¡Feliz cumpleaños!';
            message = notification.subject ?? '¡Feliz cumpleaños! Lyrium te desea un gran día';
            break;
        case 'birthday_advance':
        case 'BirthdayAdvanceNotification':
            level = 'INFO';
            title = '🎁 Tu cumpleaños se acerca';
            message = notification.subject ?? 'Tu cumpleaños está próximo. ¡Prepárate para una sorpresa!';
            break;
        case 'new_review':
        case 'NewReviewNotification':
            level = 'INFO';
            title = '⭐ Nueva reseña recibida';
            message = notification.subject ?? 'Recibiste una nueva reseña en tu producto';
            action = { type: 'products', label: 'Ver reseñas' };
            break;
        case 'new_seller_registration':
        case 'NewSellerRegistrationNotification':
            level = 'WARNING';
            title = '🏪 Nuevo vendedor registrado';
            message = notification.subject ?? 'Un nuevo vendedor solicita aprobación';
            if (notification.store_id) {
                action = { type: 'store', id: notification.store_id, label: 'Revisar tienda' };
            }
            break;
        case 'shipment_status':
        case 'ShipmentStatusNotification':
            level = 'INFO';
            title = '📦 Estado de envío actualizado';
            message = notification.subject ?? 'El estado de tu envío ha cambiado';
            if (notification.order_id) {
                action = { type: 'orders', id: notification.order_id, label: 'Ver pedido' };
            }
            break;
        case 'commission_generated':
        case 'CommissionGeneratedNotification':
            level = 'INFO';
            title = '💰 Venta procesada';
            message = notification.subject ?? 'Una venta fue procesada y la comisión calculada';
            action = { type: 'invoices', label: 'Ver finanzas' };
            break;
        case 'coupon_expiring':
        case 'CouponExpiringNotification':
            level = 'WARNING';
            title = '🎟️ Cupón por vencer';
            message = notification.subject ?? 'Un cupón activo está próximo a vencer';
            action = { type: 'plans', label: 'Gestionar cupones' };
            break;
        case 'top_medal_awarded':
        case 'TopMedalAwardedNotification':
            level = 'INFO';
            title = '🏅 ¡Medalla Top Lyrium!';
            message = notification.message_preview ?? notification.subject ?? '¡Felicidades! Recibiste la medalla Top 100 Lyrium.';
            action = { type: 'products', label: 'Ver logro' };
            break;
        case 'top_medal_grace':
        case 'TopMedalGraceNotification':
            level = 'WARNING';
            title = '⚠️ Medalla en riesgo';
            message = notification.message_preview ?? notification.subject ?? 'Tu medalla Top 100 Lyrium está en riesgo de perderse.';
            action = { type: 'products', label: 'Ver producto' };
            break;
        case 'user_banned':
        case 'UserBannedNotification':
            level = 'CRITICAL';
            title = 'Cuenta suspendida';
            message = 'Tu cuenta ha sido suspendida.';
            if (notification.reason) message += ` Motivo: ${notification.reason}`;
            action = { type: 'support', label: 'Contactar soporte' };
            break;
        case 'contract_status_changed':
        case 'ContractStatusNotification':
            if (notification.contract_action === 'created') {
                level = 'INFO';
                title = 'Nuevo contrato';
                message = `Contrato creado para ${notification.contract_name ?? '—'} (${notification.contract_number ?? '—'})`;
            } else if (notification.contract_action === 'activated') {
                level = 'INFO';
                title = 'Contrato activado';
                message = `El contrato ${notification.contract_number ?? ''} de ${notification.contract_name ?? '—'} ha sido activado.`;
            } else if (notification.contract_action === 'expired') {
                level = 'WARNING';
                title = 'Contrato expirado';
                message = `El contrato ${notification.contract_number ?? ''} de ${notification.contract_name ?? '—'} ha expirado.`;
            } else if (notification.contract_action === 'renewed') {
                level = 'INFO';
                title = 'Contrato renovado';
                message = `El contrato ${notification.contract_number ?? ''} fue renovado a V${notification.contract_version ?? '?'}.`;
            } else if (notification.contract_action === 'deleted') {
                level = 'WARNING';
                title = 'Contrato eliminado';
                message = `El contrato de ${notification.contract_name ?? '—'} fue eliminado.`;
            }
            break;
        default:
            level = 'INFO';
            title = 'Notificación';
            message = notification.subject ?? notification.message_preview ?? 'Nueva notificación';
            break;
    }

    return {
        id: notification.id,
        level,
        title,
        message,
        time: formatRelativeTime(notification.created_at),
        createdAt: notification.created_at,
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
    const [tick, setTick] = useState(0);
    const soundEnabledRef = useRef(false);

    // Re-evalúa el filtro de 24h cada minuto para auto-expirar notificaciones
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 60_000);
        return () => clearInterval(id);
    }, []);

    // Valida que el archivo de sonido exista al montar
    useEffect(() => {
        const audio = new Audio();
        audio.oncanplaythrough = () => { soundEnabledRef.current = true; };
        audio.onerror = () => { soundEnabledRef.current = false; };
        audio.src = '/sounds/notification.mp3';
        audio.load();
        return () => { audio.src = ''; };
    }, []);

    const visibleNotifications = useMemo(
        () => notifications
            .filter(n => isWithin24h(n.createdAt))
            .map(n => ({ ...n, time: formatRelativeTime(n.createdAt) })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [notifications, tick]
    );

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

    // Polling cada 30s como fallback cuando Reverb no está disponible.
    // Se pausa automáticamente cuando el tab está oculto para evitar requests innecesarios.
    // Si WebSocket está conectado, se salta la llamada REST.
    useEffect(() => {
        if (!isAuthenticated) return;

        const runPoll = () => {
            const pusher = typeof window !== 'undefined' ? (window as any).Echo?.connector?.pusher : null;
            const wsConnected = pusher?.connection?.state === 'connected';
            if (!wsConnected) {
                refreshNotifications();
            }
        };

        let id = setInterval(runPoll, 30_000);

        const handleVisibility = () => {
            if (document.hidden) {
                clearInterval(id);
            } else {
                runPoll();
                id = setInterval(runPoll, 30_000);
            }
        };

        document.addEventListener('visibilitychange', handleVisibility);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', handleVisibility);
        };
    }, [isAuthenticated, refreshNotifications]);

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

    const deleteAll = useCallback(async () => {
        try {
            const ids = notifications.map(n => n.id);
            await notificationRepository.deleteAll(ids);
        } catch (error) {
            console.error('Error deleting all notifications:', error);
        }
        setNotifications([]);
    }, [notifications]);

    const addNotification = useCallback((n: Omit<ProactiveNotification, 'id' | 'read' | 'time'>) => {
        const now = new Date().toISOString();
        const newNotification: ProactiveNotification = {
            ...n,
            id: Date.now().toString(),
            read: false,
            time: 'Ahora',
            createdAt: now,
        };
        setNotifications(prev => [newNotification, ...prev]);

        try {
            if (soundEnabledRef.current) {
                const audio = new Audio('/sounds/notification.mp3');
                audio.play().catch(() => { });
            }
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
                if (soundEnabledRef.current) {
                    const audio = new Audio('/sounds/notification.mp3');
                    audio.play().catch(() => { });
                }
            } catch (e) { }
        },
        [user]
    );

    return (
        <NotificationContext.Provider value={{
            notifications: visibleNotifications,
            unreadCount: visibleNotifications.filter(n => !n.read).length,
            loading,
            markAsRead,
            markAllAsRead,
            deleteAll,
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
