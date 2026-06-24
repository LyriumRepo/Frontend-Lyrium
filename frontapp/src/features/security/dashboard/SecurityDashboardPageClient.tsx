'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseStatCard from '@/components/ui/BaseStatCard';
import { ROUTES } from '@/shared/lib/constants/routes';
import { useRouter } from 'next/navigation';

const modules = [
  { label: 'Auditoría', value: '—', icon: 'FileSearch', color: 'sky', href: '/security/audit', description: 'Registro de acciones y eventos' },
  { label: 'Sesiones Activas', value: '—', icon: 'LogIn', color: 'emerald', href: '/security/sessions', description: 'Usuarios conectados actualmente' },
  { label: 'Protección', value: '—', icon: 'ShieldCheck', color: 'amber', href: '/security/protection', description: 'Reglas y políticas de protección' },
  { label: 'Gestión de IPs', value: '—', icon: 'Globe', color: 'indigo', href: '/security/ips', description: 'Control de direcciones IP' },
  { label: 'Alertas', value: '—', icon: 'Bell', color: 'rose', href: '/security/alerts', description: 'Notificaciones de seguridad' },
  { label: 'Cloudflare', value: '—', icon: 'Cloud', color: 'violet', href: '/security/cloudflare', description: 'Integración con Cloudflare' },
  { label: 'Configuración', value: '—', icon: 'Settings', color: 'sky', href: '/security/settings', description: 'Ajustes del panel de seguridad' },
];

export default function SecurityDashboardPageClient() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader title="Panel de Seguridad" subtitle="Centro de monitoreo y protección de la plataforma" icon="Shield" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {modules.map((mod) => (
          <BaseStatCard
            key={mod.label}
            label={mod.label}
            value={mod.value}
            description={mod.description}
            icon={mod.icon}
            color={mod.color}
            onClick={() => router.push(mod.href)}
          />
        ))}
      </div>
    </div>
  );
}
