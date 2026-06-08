'use client';

import { useEffect } from 'react';
import { useFcmToken } from '@/shared/hooks/useFcmToken';
import { useNotifications } from '@/shared/lib/context/NotificationContext';

interface ForegroundPushDetail {
    title?: string;
    body?: string;
    url?: string;
    type?: string;
    id?: string | number;
}

export const useSyncNotifications = () => {
    const { addNotification } = useNotifications();
    useFcmToken();

    useEffect(() => {
        const handleForegroundPush = (event: Event) => {
            const detail = (event as CustomEvent<ForegroundPushDetail>).detail ?? {};

            addNotification({
                level: 'INFO',
                title: detail.title || 'Notificacion',
                message: detail.body || 'Nueva notificacion recibida',
                metadata: {
                    type: detail.type || 'fcm_foreground',
                    entityId: detail.id ? String(detail.id) : undefined,
                },
                action: {
                    type: 'orders',
                    id: detail.id,
                    label: 'Ver detalle',
                },
            });
        };

        window.addEventListener('lyrium-fcm-foreground', handleForegroundPush);
        return () => window.removeEventListener('lyrium-fcm-foreground', handleForegroundPush);
    }, [addNotification]);

    return null;
};
