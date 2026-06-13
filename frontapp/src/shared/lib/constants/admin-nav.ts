import { PanelNavigation } from '@/shared/types/navigation';

export const adminNavigation: PanelNavigation = [
    {
        title: 'Gestión de Vendores',
        items: [
            {
                id: 'sellers',
                label: 'Control de Vendedores',
                href: '/admin/sellers',
                icon: 'Users',
            },
        ],
    },
    {
        title: 'Soporte',
        items: [
            {
                id: 'helpdesk',
                label: 'Mesa de Ayuda',
                href: '/admin/helpdesk',
                icon: 'Help',
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
                icon: 'Sales',
            },
            {
                id: 'payments',
                label: 'Gestión de Pagos',
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
                label: 'Centro de Seguridad',
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
            {
                id: 'glossary',
                label: 'Glosario',
                href: '/admin/glossary',
                icon: 'BookOpen',
            },
        ],
    },
];
