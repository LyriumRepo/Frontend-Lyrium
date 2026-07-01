import { PanelNavigation } from '@/shared/types/navigation';

export const securityNavigation: PanelNavigation = [
  {
    title: 'Panel de Seguridad',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/security',
        icon: 'Shield',
      },
    ],
  },
  {
    title: 'Monitoreo',
    items: [
      {
        id: 'audit',
        label: 'Auditoría',
        href: '/security/audit',
        icon: 'FileSearch',
      },
      {
        id: 'sessions',
        label: 'Sesiones Activas',
        href: '/security/sessions',
        icon: 'LogIn',
      },
      {
        id: 'protection',
        label: 'Protección',
        href: '/security/protection',
        icon: 'ShieldCheck',
      },
    ],
  },
  {
    title: 'Infraestructura',
    items: [
      {
        id: 'ips',
        label: 'Gestión de IPs',
        href: '/security/ips',
        icon: 'Globe',
      },
      {
        id: 'cloudflare',
        label: 'Cloudflare',
        href: '/security/cloudflare',
        icon: 'Cloud',
      },
    ],
  },
  {
    title: 'Notificaciones',
    items: [
      {
        id: 'alerts',
        label: 'Alertas de Seguridad',
        href: '/security/alerts',
        icon: 'Bell',
      },
    ],
  },
  {
    title: 'Configuración',
    items: [
      {
        id: 'settings',
        label: 'Configuración',
        href: '/security/settings',
        icon: 'Settings',
      },
    ],
  },
];
