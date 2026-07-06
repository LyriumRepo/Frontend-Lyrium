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
            'booking_on_the_way', 'BookingOnTheWayNotification',
            'booking_cancelled', 'BookingCancelledNotification',
            'order_cancelled_customer', 'OrderCancelledCustomerNotification',
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
            'shipment_status', 'ShipmentStatusNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'birthday', 'BirthdayNotification',
            'birthday_advance', 'BirthdayAdvanceNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
        toast: [
            'order_created', 'OrderCreatedNotification',
            'order_tracking', 'OrderStatusTrackingNotification',
            'booking_confirmed', 'BookingConfirmedNotification',
            'booking_on_the_way', 'BookingOnTheWayNotification',
            'booking_cancelled', 'BookingCancelledNotification',
            'order_cancelled_customer', 'OrderCancelledCustomerNotification',
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
            'shipment_status', 'ShipmentStatusNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'birthday', 'BirthdayNotification',
            'new_chat_message', 'NewChatMessageNotification',
        ],
    },

    seller: {
        bell: [
            'new_order', 'NewOrderSellerNotification',
            'booking_created', 'BookingCreatedNotification',
            'booking_cancelled', 'BookingCancelledNotification',
            'store_status_changed', 'StoreStatusNotification',
            'invoice_requested', 'InvoiceRequestedNotification',
            'order_delivered_seller', 'OrderDeliveredSellerNotification',
            'order_cancelled', 'OrderCancelledSellerNotification',
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
            'commission_generated', 'CommissionGeneratedNotification',
            'product_status_changed', 'ProductStatusNotification',
            'service_status_changed', 'ServiceStatusNotification',
            'stock_alert', 'StockAlertNotification',
            'plan_activated', 'PlanActivatedNotification',
            'plan_expiring', 'PlanExpiringNotification',
            'plan_rejected', 'PlanRejectedNotification',
            'contract_status_changed', 'ContractStatusNotification',
            'coupon_expiring', 'CouponExpiringNotification',
            'new_review', 'NewReviewNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'new_chat_message', 'NewChatMessageNotification',
            'top_medal_awarded', 'TopMedalAwardedNotification',
            'top_medal_grace', 'TopMedalGraceNotification',
        ],
        toast: [
            'new_order', 'NewOrderSellerNotification',
            'booking_created', 'BookingCreatedNotification',
            'booking_cancelled', 'BookingCancelledNotification',
            'store_status_changed', 'StoreStatusNotification',
            'invoice_requested', 'InvoiceRequestedNotification',
            'order_delivered_seller', 'OrderDeliveredSellerNotification',
            'order_cancelled', 'OrderCancelledSellerNotification',
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
            'commission_generated', 'CommissionGeneratedNotification',
            'product_status_changed', 'ProductStatusNotification',
            'service_status_changed', 'ServiceStatusNotification',
            'stock_alert', 'StockAlertNotification',
            'plan_activated', 'PlanActivatedNotification',
            'plan_expiring', 'PlanExpiringNotification',
            'plan_rejected', 'PlanRejectedNotification',
            'contract_status_changed', 'ContractStatusNotification',
            'new_review', 'NewReviewNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'new_chat_message', 'NewChatMessageNotification',
            'top_medal_awarded', 'TopMedalAwardedNotification',
            'top_medal_grace', 'TopMedalGraceNotification',
        ],
    },

    administrator: {
        bell: [
            'ticket_created', 'TicketCreatedNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'profile_request_created', 'ProfileRequestNotification',
            'store_profile_updated', 'StoreProfileUpdatedNotification',
            'new_order_admin', 'NewOrderAdminNotification',
            'store_status_changed', 'StoreStatusNotification',
            'product_pending_review', 'ProductPendingReviewNotification',
            'service_pending_review', 'ServicePendingReviewNotification',
            'new_plan_request', 'NewPlanRequestNotification',
            'pending_stores_overdue', 'PendingStoreOverdueNotification',
            'new_seller_registration', 'NewSellerRegistrationNotification',
            'contract_status_changed', 'ContractStatusNotification',
        ],
        toast: [
            'ticket_created', 'TicketCreatedNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'profile_request_created', 'ProfileRequestNotification',
            'store_profile_updated', 'StoreProfileUpdatedNotification',
            'new_order_admin', 'NewOrderAdminNotification',
            'product_pending_review', 'ProductPendingReviewNotification',
            'service_pending_review', 'ServicePendingReviewNotification',
            'new_plan_request', 'NewPlanRequestNotification',
            'pending_stores_overdue', 'PendingStoreOverdueNotification',
            'new_seller_registration', 'NewSellerRegistrationNotification',
            'contract_status_changed', 'ContractStatusNotification',
        ],
    },

    // Logistics operators have no popups; all notifications visible in bell.
    logistics_operator: {
        bell: [],   // [] = show all (backend already scopes by user)
        toast: [],  // [] = no popups
    },

    security: {
        bell: [
            'ticket_created', 'TicketCreatedNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
            'new_seller_registration', 'NewSellerRegistrationNotification',
            'store_status_changed', 'StoreStatusNotification',
        ],
        toast: [
            'ticket_created', 'TicketCreatedNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
        ],
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
