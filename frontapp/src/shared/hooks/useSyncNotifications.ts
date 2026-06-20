'use client';

import { useEffect } from 'react';
import { useFcmToken } from '@/shared/hooks/useFcmToken';
import { useNotifications } from '@/shared/lib/context/NotificationContext';

/**
 * Keeps FCM foreground pushes in sync with the notification state.
 *
 * When the app is open, every notification travels two parallel paths:
 *   1. WebSocket (Reverb) → NotificationContext adds it with the real DB UUID
 *   2. FCM foreground    → this hook fires
 *
 * If we call addNotification() here (old behaviour), the same notification ends
 * up in state TWICE — once with a fake Date.now() id and once with the real UUID.
 * That causes duplicate list entries and a double notification sound.
 *
 * Fix: call refreshNotifications() instead. The REST endpoint returns newest-first
 * (Laravel's .latest()) so the toast will detect the new notification correctly.
 * If WebSocket already added it, the refresh simply re-syncs state with the server
 * and the toast's lastIdRef guard prevents a second popup.
 *
 * If Reverb is down and FCM is the only delivery path, the refresh still works —
 * the notification arrives via the REST response and the toast shows it.
 */
export const useSyncNotifications = () => {
    const { refreshNotifications } = useNotifications();
    useFcmToken();

    useEffect(() => {
        const handleForegroundPush = () => {
            refreshNotifications();
        };

        window.addEventListener('lyrium-fcm-foreground', handleForegroundPush);
        return () => window.removeEventListener('lyrium-fcm-foreground', handleForegroundPush);
    }, [refreshNotifications]);

    return null;
};
