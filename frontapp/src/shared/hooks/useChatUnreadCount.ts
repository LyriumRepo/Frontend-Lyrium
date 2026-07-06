'use client';

import { useMemo } from 'react';
import { useNotifications } from '@/shared/lib/context/NotificationContext';

/**
 * Returns the number of unread chat notifications for the current user.
 * Reads from the existing NotificationContext — no extra API calls.
 */
export function useChatUnreadCount(): number {
    const { notifications } = useNotifications();
    return useMemo(
        () => notifications.filter(n =>
            !n.read &&
            (n.metadata?.type === 'new_chat_message' || n.metadata?.type === 'NewChatMessageNotification')
        ).length,
        [notifications]
    );
}
