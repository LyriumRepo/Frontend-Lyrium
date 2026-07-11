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
                id: 'seguridad',
                label: 'Seguridad',
                description: 'Protege tu cuenta y gestiona tu contraseña',
                icon: 'Shield',
                href: '/seller/security'
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
                label: 'Mis Productos',
                description: 'Gestión integral de productos, categorías y existencias',
                icon: 'Package',
                href: '/seller/catalog'
            },
            {
                id: 'inventario',
                label: 'Gestión de stock ',
                description: 'Control de existencias y alertas de stock',
                icon: 'Boxes',
                href: '/seller/inventario'
            },
            {
                id: 'servicios',
                label: 'Mis Servicios',
                description: 'Gestión de prestaciones y reservas activas',
                icon: 'Calendar',
                href: '/seller/services'
            },
            {
                id: 'reservas',
                label: 'Reservas',
                description: 'Reservas recibidas y estado de atención',
                icon: 'CalendarCheck',
                href: '/seller/reservas'
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
            // {
            //     id: 'logistica',
            //     label: 'Mi Logística',
            //     description: 'Configuración estratégica de envíos y operadoras',
            //     icon: 'Truck',
            //     href: '/seller/logistics'
            // },
            {
                id: 'capacitaciones',
                label: 'Capacitaciones',
                description: 'Videos de formación para impulsar tu negocio',
                icon: 'Video',
                href: '/seller/training'
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
                label: 'Soporte Lyrium',
                description: 'Soporte técnico y gestión de incidencias',
                icon: 'HelpCircle',
                href: '/seller/help'
            },
            {
                id: 'bioblog',
                label: 'BioBlog',
                description: 'Crea y gestiona contenido: artículos, podcasts, videos y shorts',
                icon: 'BookOpen',
                href: '/seller/blog'
            },
            {
                id: 'bioforo',
                label: 'BioForo',
                description: 'Foro de discusión con tu comunidad',
                icon: 'MessagesSquare',
                href: '/seller/forum'
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
