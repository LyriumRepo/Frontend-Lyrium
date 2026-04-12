'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';

/**
 * Hook para centralizar la sincronización de eventos en tiempo real.
 * Puede conectarse a Pusher, Laravel Echo o realizar Polling.
 */
export const useSyncNotifications = () => {
    const { addNotification } = useNotifications();

    useEffect(() => {
        // En una implementación real, aquí configuraríamos el WebSocket:
        // const channel = pusher.subscribe('admin-alerts');
        // channel.bind('new-alert', (data) => addNotification(data));

        // Simulación de evento externo después de 10 segundos
        const timer = setTimeout(() => {
            addNotification({
                level: 'SECURITY',
                title: 'Nueva Solicitud de Retiro',
                message: 'El vendedor "OrganicPeru" solicita S/ 1,500.00. Pendiente de validación.',
            });
        }, 15000);

        return () => clearTimeout(timer);
    }, [addNotification]);

    return null;
};
