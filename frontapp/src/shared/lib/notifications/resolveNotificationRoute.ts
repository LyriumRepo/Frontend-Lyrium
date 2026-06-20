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
            return actionId ? `${prefix}/orders/${actionId}` : `${prefix}/orders`;
        case 'invoices':
            return actionId ? `${prefix}/invoices/${actionId}` : `${prefix}/invoices`;
        case 'products':
            return role === 'administrator'
                ? '/admin/products'
                : actionId ? `${prefix}/products/${actionId}` : `${prefix}/products`;
        case 'services':
            return role === 'administrator'
                ? '/admin/services'
                : actionId ? `${prefix}/services/${actionId}` : `${prefix}/services`;
        case 'chat':
            return role === 'administrator' ? '/admin/helpdesk' : `${prefix}/chat`;
        case 'ticket':
            return role === 'administrator' ? `/admin/helpdesk?id=${actionId}`
                : role === 'seller' ? `/seller/help?id=${actionId}`
                : `/customer/support?id=${actionId}`;
        case 'store':
            return role === 'administrator'
                ? (actionId ? `/admin/stores/${actionId}` : '/admin/stores')
                : role === 'seller' ? '/seller/settings'
                : '/';
        case 'plans':
            return role === 'administrator' ? '/admin/planes' : `${prefix}/plans`;
        default:
            return prefix || '/';
    }
}
