'use client';

import React from 'react';
import { SecurityStats } from '@/shared/lib/api/adminSecurityRepository';
import AdminIndicatorGrid from '@/components/admin/AdminIndicatorGrid';

interface Props {
  stats: SecurityStats | null;
  loading: boolean;
}

export function SecurityStatsCards({ stats, loading }: Props) {
  const indicators = [
    { label: 'Usuarios Activos', value: stats?.active_users ?? 0, icon: 'Users', color: 'lima' as const },
    { label: 'Sesiones Totales', value: stats?.active_sessions ?? 0, icon: 'Globe', color: 'turquesa' as const },
    { label: 'Logins Fallidos Hoy', value: stats?.failed_logins_today ?? 0, icon: 'LogIn', color: 'turquesaClaro' as const },
    { label: 'Logins Exitosos Hoy', value: stats?.success_logins_today ?? 0, icon: 'Activity', color: 'verde' as const },
    { label: 'Usuarios Suspendidos', value: stats?.banned_users ?? 0, icon: 'Ban', color: 'rose' as const },
    { label: 'Eventos de Seguridad Hoy', value: stats?.events_today ?? 0, icon: 'AlertTriangle', color: 'turquesaClaro' as const },
    { label: 'IPs Bloqueadas Hoy', value: stats?.blocked_ips ?? 0, icon: 'Shield', color: 'turquesa' as const },
    { label: 'Total Usuarios', value: stats?.total_users ?? 0, icon: 'UserX', color: 'celeste' as const },
  ];

  return <AdminIndicatorGrid indicators={indicators} columns={4} isLoading={loading} />;
}
