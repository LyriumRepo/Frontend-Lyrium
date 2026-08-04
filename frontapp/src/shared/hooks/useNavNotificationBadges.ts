'use client';

import { useMemo } from 'react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';
import { ROLE_NAV_NOTIFICATION_MAP } from '@/shared/lib/notifications/notificationNavMapping';

/**
 * Computes per-nav-item unread counts from the existing NotificationContext —
 * no extra API calls. Same pattern as useChatUnreadCount, generalized to every
 * nav item via ROLE_NAV_NOTIFICATION_MAP.
 */
export function useNavNotificationBadges(role: string): Record<string, number> {
    const { notifications } = useNotifications();

    return useMemo(() => {
        const unread = notifications.filter(n => !n.read);
        const mapping = ROLE_NAV_NOTIFICATION_MAP[role];
        if (!mapping) return {};

        const badges: Record<string, number> = {};
        for (const [navId, types] of Object.entries(mapping)) {
            const count = unread.filter(n =>
                types.includes(n.metadata?.type ?? '')
            ).length;
            if (count > 0) badges[navId] = count;
        }
        return badges;
    }, [notifications, role]);
}
