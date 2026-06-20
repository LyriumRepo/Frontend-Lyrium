/**
 * Single source of truth for notification type filtering.
 * Both NotificationBell (dropdown) and NotificationToast (popup) import from here.
 *
 * Each role has two arrays:
 *   bell  — types visible in the dropdown and modal (comprehensive view)
 *   toast — types that trigger a popup (actionable/important only)
 *
 * Both snake_case (from toArray.type) and PascalCase (from PHP class name
 * stripped by NotificationContext) must be listed so the includes() check works
 * regardless of which path delivered the notification (WebSocket vs REST).
 */

export interface RoleNotificationConfig {
    bell: string[];
    toast: string[];
}

export const ROLE_NOTIFICATION_TYPES: Record<string, RoleNotificationConfig> = {
    customer: {
        bell: [
            'order_created', 'OrderCreatedNotification',
            'order_tracking', 'OrderStatusTrackingNotification',
            'booking_confirmed', 'BookingConfirmedNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
        toast: [
            'order_created', 'OrderCreatedNotification',
            'order_tracking', 'OrderStatusTrackingNotification',
            'booking_confirmed', 'BookingConfirmedNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
    },

    seller: {
        bell: [
            'new_order', 'NewOrderSellerNotification',
            'booking_created', 'BookingCreatedNotification',
            'store_status_changed', 'StoreStatusNotification',
            'invoice_requested', 'InvoiceRequestedNotification',
            'order_delivered_seller', 'OrderDeliveredSellerNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
        toast: [
            'new_order', 'NewOrderSellerNotification',
            'booking_created', 'BookingCreatedNotification',
            'store_status_changed', 'StoreStatusNotification',
            'invoice_requested', 'InvoiceRequestedNotification',
            'order_delivered_seller', 'OrderDeliveredSellerNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
    },

    administrator: {
        bell: [
            'ticket_created', 'TicketCreatedNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'profile_request_created', 'ProfileRequestNotification',
            'store_profile_updated', 'StoreProfileUpdatedNotification',
            'new_order', 'NewOrderSellerNotification',
            'store_status_changed', 'StoreStatusNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
        toast: [
            'ticket_created', 'TicketCreatedNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'profile_request_created', 'ProfileRequestNotification',
            'store_profile_updated', 'StoreProfileUpdatedNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
    },

    // Logistics operators have no popups; all notifications visible in bell.
    logistics_operator: {
        bell: [],   // [] = show all (backend already scopes by user)
        toast: [],  // [] = no popups
    },
};

/**
 * Returns true if the notification type is allowed for the given role and context.
 * An empty array for bell means "show all"; an empty array for toast means "show none".
 */
export function isAllowedForRole(
    type: string,
    role: string | undefined,
    context: 'bell' | 'toast',
): boolean {
    const config = ROLE_NOTIFICATION_TYPES[role ?? ''];
    if (!config) return false;

    const allowed = config[context];

    // Bell: empty = show everything (backend already filtered by user)
    if (context === 'bell') {
        if (allowed.length === 0) return true;
        return allowed.some(t => type.includes(t));
    }

    // Toast: empty = show nothing (no popup spam)
    if (allowed.length === 0) return false;
    return allowed.some(t => type.includes(t));
}
