export function resolveNotificationRoute(
    actionType: string,
    actionId: string | number | undefined,
    role: string | undefined,
): string {
    const prefix =
        role === 'administrator' ? '/admin'
        : role === 'seller' ? '/seller'
        : role === 'customer' ? '/customer'
        : role === 'logistics_operator' ? '/logistics'
        : '';

    switch (actionType) {
        case 'orders':
            if (role === 'administrator') return '/admin/invoices';
            if (role === 'customer') return '/customer/orders';
            if (actionId) return `${prefix}/orders/${actionId}`;
            return `${prefix}/invoices`;
        case 'invoices':
            if (role === 'administrator') return '/admin/invoices';
            if (role === 'seller') return '/seller/invoices';
            if (role === 'customer') return '/customer/invoices';
            return `${prefix}/invoices`;
        case 'products':
            if (role === 'administrator') return '/admin/sellers';
            if (role === 'seller') return '/seller/catalog';
            if (role === 'customer') return '/';
            return `${prefix}/products`;
        case 'services':
            if (role === 'administrator') return '/admin/sellers';
            if (role === 'seller') return '/seller/services';
            if (role === 'customer') return '/customer';
            return `${prefix}/services`;
        case 'chat':
            if (role === 'administrator') return '/admin/helpdesk';
            if (role === 'logistics_operator') return '/logistics/chat-vendors';
            return `${prefix}/chat`;
        case 'ticket':
            return role === 'administrator' ? `/admin/helpdesk?id=${actionId}`
                : role === 'seller' ? `/seller/help?id=${actionId}`
                : `/customer/support?id=${actionId}`;
        case 'store':
            if (role === 'administrator') {
                return actionId ? `/admin/sellers/${actionId}` : '/admin/sellers';
            }
            if (role === 'seller') return '/seller/store';
            return '/';
        case 'plans':
            if (role === 'administrator') return '/admin/planes';
            if (role === 'seller') return '/seller/planes';
            if (role === 'customer') return '/customer/profile';
            return `${prefix}/plans`;
        case 'support':
            if (role === 'administrator') return '/admin/helpdesk';
            if (role === 'seller') return '/seller/help';
            return '/customer/support';
        default:
            return prefix || '/';
    }
}
