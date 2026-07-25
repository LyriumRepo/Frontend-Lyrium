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
                label: 'Solicitudes de Registro',
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
        ],
    },
    {
        title: 'Operaciones',
        items: [
            {
                id: 'operations',
                label: 'Pagos',
                href: '/admin/operations',
                icon: 'Settings',
            },
            {
                id: 'payments',
                label: 'Ventas',
                href: '/admin/payments',
                icon: 'Landmark',
            },
            {
                id: 'rapifac',
                label: 'Facturación Rápida',
                href: '/admin/rapifac',
                icon: 'Receipt',
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
        title: 'Reportes',
        items: [
            {
                id: 'reportes',
                label: 'Centro de Reportes',
                href: '/admin/reportes',
                icon: 'BarChart3',
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
                id: 'bioblog',
                label: 'BioBlog',
                href: '/admin/bioblog',
                icon: 'BookOpen',
            },
            {
                id: 'bioforo',
                label: 'BioForo',
                href: '/admin/bioforo',
                icon: 'MessagesSquare',
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
