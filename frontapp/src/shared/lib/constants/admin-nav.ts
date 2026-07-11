import { PanelNavigation } from '@/shared/types/navigation';

export const adminNavigation: PanelNavigation = [
    {
        title: 'Gestión de Vendedores',
        items: [
            {
                id: 'sellers',
                label: 'Control de Vendedores',
                href: '/admin/sellers',
                icon: 'Users',
            },
            {
                id: 'solicitudes',
                label: 'Solicitudes',
                href: '/admin/sellers/solicitudes',
                icon: 'ListChecks',
            },
            {
                id: 'trainings',
                label: 'Capacitaciones',
                href: '/admin/trainings',
                icon: 'Video',
            },
        ],
    },
    {
        title: 'Soporte',
        items: [
            {
                id: 'helpdesk',
                label: 'Soporte Lyrium',
                href: '/admin/helpdesk',
                icon: 'HelpCircle',
            },
        ],
    },
    {
        title: 'Finanzas',
        items: [
            {
                id: 'finance',
                label: 'Centro de Finanzas y Estadísticas',
                href: '/admin/finance',
                icon: 'TrendingUp',
            },
            {
                id: 'payments',
                label: 'Gestión de Pagos',
                href: '/admin/payments',
                icon: 'Landmark',
            },
            {
                id: 'invoices',
                label: 'Facturación Electrónica',
                href: '/admin/invoices',
                icon: 'Receipt',
            },
        ],
    },
    {
        title: 'Operaciones',
        items: [

            {
                id: 'operations',
                label: 'Gestión Operativa',
                href: '/admin/operations',
                icon: 'Settings',
            },
        ],
    },
    {
        title: 'Seguridad',
        items: [
            {
                id: 'security',
                label: 'Seguridad',
                href: '/admin/security',
                icon: 'Shield',
            },
        ],
    },
    {
        title: 'Gestión',
        items: [
            {
                id: 'categories',
                label: 'Gestión de Categorías',
                href: '/admin/categories',
                icon: 'FolderTree',
            },
            {
                id: 'reviews',
                label: 'Gestión de Puntuación',
                href: '/admin/reviews',
                icon: 'Star',
            },
            {
                id: 'planes',
                label: 'Planes y Suscripciones',
                href: '/admin/planes',
                icon: 'Sparkles',
            },
        ],
    },
];
