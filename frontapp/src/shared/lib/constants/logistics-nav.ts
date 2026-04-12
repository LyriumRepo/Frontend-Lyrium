import { PanelNavigation } from '@/shared/types/navigation';

export const logisticsNavigation: PanelNavigation = [
    {
        items: [
            {
                id: 'tracker',
                label: 'Rastreador de Envíos',
                description: 'Gestión y seguimiento de pedidos asignados',
                icon: 'Truck',
                href: '/logistics'
            },
            {
                id: 'chat-vendors',
                label: 'Chat con Vendedores',
                description: 'Comunicación directa con vendedores',
                icon: 'MessageSquare',
                href: '/logistics/chat-vendors'
            },
            {
                id: 'helpdesk',
                label: 'Mesa de Ayuda',
                description: 'Soporte y reportar incidencias',
                icon: 'HelpCircle',
                href: '/logistics/helpdesk'
            },
        ],
    },
];
