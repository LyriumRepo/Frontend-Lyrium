import { PanelNavigation } from '@/shared/types/navigation';

export const sellerNavigation: PanelNavigation = [
    {
        items: [
            {
                id: 'planes',
                label: 'Mi Plan',
                description: 'Gestiona tu suscripción y plan de servicios',
                icon: 'CreditCard',
                href: '/seller/planes'
            },
            {
                id: 'mis-datos',
                label: 'Mis Datos',
                description: 'Información de la cuenta y configuración del perfil',
                icon: 'User',
                href: '/seller/profile'
            },
            {
                id: 'mi-tienda',
                label: 'Mi Tienda',
                description: 'Personaliza tu escaparate público y presencia de marca',
                icon: 'Store',
                href: '/seller/store'
            },
            {
                id: 'catalogo',
                label: 'Mi Catálogo',
                description: 'Gestión integral de productos, categorías y existencias',
                icon: 'Package',
                href: '/seller/catalog'
            },
            {
                id: 'servicios',
                label: 'Mis Servicios',
                description: 'Gestión de prestaciones y reservas activas',
                icon: 'Calendar',
                href: '/seller/services'
            },
            {
                id: 'ventas',
                label: 'Mis Ventas',
                description: 'Monitoreo estratégico de transacciones y despachos',
                icon: 'TrendingUp',
                href: '/seller/sales'
            },
            {
                id: 'agenda',
                label: 'Mi Agenda',
                description: 'Gestión cronológica de entregas y compromisos',
                icon: 'CalendarCheck',
                href: '/seller/agenda'
            },
            {
                id: 'logistica',
                label: 'Mi Logística',
                description: 'Configuración estratégica de envíos y operadoras',
                icon: 'Truck',
                href: '/seller/logistics'
            },
            {
                id: 'finanzas',
                label: 'Centro de Finanzas',
                description: 'Monitoreo en tiempo real de tus KPIs estratégicos y monetarios',
                icon: 'DollarSign',
                href: '/seller/finance'
            },
            {
                id: 'chat',
                label: 'Chat con Clientes',
                description: 'Comunicación directa y soporte en tiempo real',
                icon: 'MessageSquare',
                href: '/seller/chat'
            },
            {
                id: 'ayuda',
                label: 'Mesa de Ayuda',
                description: 'Soporte técnico y gestión de incidencias',
                icon: 'HelpCircle',
                href: '/seller/help'
            },
            {
                id: 'facturacion',
                label: 'Mis Comprobantes',
                description: 'Gestión de facturación y documentos electrónicos',
                icon: 'FileText',
                href: '/seller/invoices'
            }
        ],
    },
];
