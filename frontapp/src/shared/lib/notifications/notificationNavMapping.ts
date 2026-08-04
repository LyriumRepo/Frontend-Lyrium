/**
 * Maps sidebar nav item IDs to the notification types that should badge them,
 * per role. Both snake_case (from toArray.type) and PascalCase (from PHP class
 * name stripped by NotificationContext) are listed, same pattern as
 * roleNotificationTypes.ts.
 */

export const ROLE_NAV_NOTIFICATION_MAP: Record<string, Record<string, string[]>> = {
    seller: {
        planes: [
            'plan_activated', 'PlanActivatedNotification',
            'plan_expiring', 'PlanExpiringNotification',
            'plan_rejected', 'PlanRejectedNotification',
        ],
        'mis-datos': [
            'store_status_changed', 'StoreStatusNotification',
        ],
        'mi-tienda': [
            'store_status_changed', 'StoreStatusNotification',
        ],
        catalogo: [
            'product_status_changed', 'ProductStatusNotification',
        ],
        servicios: [
            'service_status_changed', 'ServiceStatusNotification',
        ],
        reservas: [
            'booking_created', 'BookingCreatedNotification',
            'booking_cancelled', 'BookingCancelledNotification',
        ],
        ventas: [
            'new_order', 'NewOrderSellerNotification',
            'order_delivered_seller', 'OrderDeliveredSellerNotification',
            'order_cancelled', 'OrderCancelledSellerNotification',
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
            'commission_generated', 'CommissionGeneratedNotification',
            'new_review', 'NewReviewNotification',
        ],
        agenda: [
            'booking_created', 'BookingCreatedNotification',
            'booking_cancelled', 'BookingCancelledNotification',
            'contract_status_changed', 'ContractStatusNotification',
        ],
        finanzas: [
            'commission_generated', 'CommissionGeneratedNotification',
            'invoice_requested', 'InvoiceRequestedNotification',
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
        ],
        chat: [
            'new_chat_message', 'NewChatMessageNotification',
        ],
        ayuda: [
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
        ],
        facturacion: [
            'invoice_requested', 'InvoiceRequestedNotification',
        ],
    },
    customer: {
        orders: [
            'order_created', 'OrderCreatedNotification',
            'order_tracking', 'OrderStatusTrackingNotification',
            'order_cancelled_customer', 'OrderCancelledCustomerNotification',
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
            'shipment_status', 'ShipmentStatusNotification',
        ],
        bookings: [
            'booking_confirmed', 'BookingConfirmedNotification',
            'booking_on_the_way', 'BookingOnTheWayNotification',
            'booking_cancelled', 'BookingCancelledNotification',
        ],
        invoices: [
            'payment_confirmed', 'OrderPaymentConfirmedNotification',
        ],
        chat: [
            'new_chat_message', 'NewChatMessageNotification',
        ],
        support: [
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
        ],
    },
    administrator: {
        sellers: [
            'store_status_changed', 'StoreStatusNotification',
            'store_profile_updated', 'StoreProfileUpdatedNotification',
            'profile_request_created', 'ProfileRequestNotification',
            'pending_stores_overdue', 'PendingStoreOverdueNotification',
            'new_seller_registration', 'NewSellerRegistrationNotification',
        ],
        solicitudes: [
            'new_seller_registration', 'NewSellerRegistrationNotification',
            'pending_stores_overdue', 'PendingStoreOverdueNotification',
        ],
        helpdesk: [
            'ticket_created', 'TicketCreatedNotification',
            'ticket_replied', 'TicketRepliedNotification',
            'ticket_status_changed', 'TicketStatusChangedNotification',
        ],
        finance: [
            'new_order_admin', 'NewOrderAdminNotification',
            'new_plan_request', 'NewPlanRequestNotification',
        ],
        payments: [
            'new_order_admin', 'NewOrderAdminNotification',
        ],
        planes: [
            'new_plan_request', 'NewPlanRequestNotification',
        ],
    },
};
