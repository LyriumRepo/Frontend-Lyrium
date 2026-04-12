import { PanelNavigation } from '@/shared/types/navigation';

export const customerNavigation: PanelNavigation = [
    {
        items: [
            {
                id: 'profile',
                label: 'Mi Perfil',
                description: 'Gestiona tu información personal',
                icon: 'User',
                href: '/customer/profile'
            },
            {
                id: 'orders',
                label: 'Mis Pedidos',
                description: 'Historial de pedidos realizados',
                icon: 'Package',
                href: '/customer/orders'
            },
            {
                id: 'wishlist',
                label: 'Lista de Deseos',
                description: 'Productos guardados',
                icon: 'Heart',
                href: '/customer/wishlist'
            },
            {
                id: 'payment-methods',
                label: 'Métodos de Pago',
                description: 'Gestiona tus datos de facturación',
                icon: 'CreditCard',
                href: '/customer/payment-methods'
            },
            {
                id: 'addresses',
                label: 'Direcciones de Envío',
                description: 'Gestiona tus direcciones de entrega',
                icon: 'MapPin',
                href: '/customer/addresses'
            },
            {
                id: 'security',
                label: 'Seguridad',
                description: 'Protege tu cuenta',
                icon: 'Shield',
                href: '/customer/security'
            },
            {
                id: 'chat',
                label: 'Chat con Vendedores',
                description: 'Comunicación directa con vendedores',
                icon: 'Messages',
                href: '/customer/chat'
            },
            {
                id: 'support',
                label: 'Mesa de Ayuda',
                description: 'Tickets de soporte técnico',
                icon: 'Headset',
                href: '/customer/support'
            },
            {
                id: 'settings',
                label: 'Configuración',
                description: 'Preferencias y notificaciones',
                icon: 'Settings',
                href: '/customer/settings'
            },
            {
                id: 'help',
                label: 'Ayuda',
                description: 'Preguntas frecuentes',
                icon: 'HelpCircle',
                href: '/customer/help'
            },
        ],
    },
];
