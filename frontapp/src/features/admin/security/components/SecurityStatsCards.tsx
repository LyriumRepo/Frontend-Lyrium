'use client';

import React from 'react';
import { Shield, Users, Globe, AlertTriangle, Ban, LogIn, Activity, UserX } from 'lucide-react';
import { SecurityStats } from '@/shared/lib/api/adminSecurityRepository';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}

const StatCard = ({ icon, label, value, color, bgColor }: StatCardProps) => (
  <div className={`${bgColor} rounded-[2.5rem] p-6 border border-[var(--border-subtle)] shadow-sm`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
          {label}
        </p>
        <p className={`text-3xl font-black ${color}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </div>
      <div className={`p-3 rounded-2xl ${bgColor} dark:opacity-80`}>
        {icon}
      </div>
    </div>
  </div>
);

interface Props {
  stats: SecurityStats | null;
  loading: boolean;
}

export function SecurityStatsCards({ stats, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-card)] rounded-[2.5rem] p-6 border border-[var(--border-subtle)] animate-pulse">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      icon: <Users className="w-5 h-5 text-emerald-600" />,
      label: 'Usuarios Activos',
      value: stats?.active_users ?? 0,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-900/10',
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-600" />,
      label: 'Sesiones Totales',
      value: stats?.active_sessions ?? 0,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50/50 dark:bg-blue-900/10',
    },
    {
      icon: <LogIn className="w-5 h-5 text-teal-600" />,
      label: 'Logins Fallidos Hoy',
      value: stats?.failed_logins_today ?? 0,
      color: 'text-teal-600 dark:text-teal-400',
      bgColor: 'bg-teal-50/50 dark:bg-teal-900/10',
    },
    {
      icon: <Activity className="w-5 h-5 text-emerald-600" />,
      label: 'Logins Exitosos Hoy',
      value: stats?.success_logins_today ?? 0,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-900/10',
    },
    {
      icon: <Ban className="w-5 h-5 text-rose-600" />,
      label: 'Usuarios Suspendidos',
      value: stats?.banned_users ?? 0,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50/50 dark:bg-rose-900/10',
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      label: 'Eventos de Seguridad Hoy',
      value: stats?.events_today ?? 0,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50/50 dark:bg-amber-900/10',
    },
    {
      icon: <Shield className="w-5 h-5 text-purple-600" />,
      label: 'IPs Bloqueadas Hoy',
      value: stats?.blocked_ips ?? 0,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50/50 dark:bg-purple-900/10',
    },
    {
      icon: <UserX className="w-5 h-5 text-slate-600" />,
      label: 'Total Usuarios',
      value: stats?.total_users ?? 0,
      color: 'text-slate-600 dark:text-slate-400',
      bgColor: 'bg-slate-50/50 dark:bg-slate-900/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
