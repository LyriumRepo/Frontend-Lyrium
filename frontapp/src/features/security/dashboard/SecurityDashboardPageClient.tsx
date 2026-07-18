'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseStatCard from '@/components/ui/BaseStatCard';
import { useRouter } from 'next/navigation';
import { useSecurityDashboard } from '@/features/security/dashboard/hooks/useSecurityDashboard';
import { SecurityLoginChart } from '@/features/admin/security/components/SecurityLoginChart';
import { SecurityEventsChart } from '@/features/admin/security/components/SecurityEventsChart';
import { ActiveUsersChart } from '@/features/admin/security/components/ActiveUsersChart';
import { SecurityActivityFeed } from '@/features/admin/security/components/SecurityActivityFeed';
import { RefreshCw, Activity, Shield, ShieldAlert, ShieldOff, UserX, XCircle, LogIn } from 'lucide-react';

const eventIcons: Record<string, React.ReactNode> = {
  blocked_ip: <ShieldOff className="w-4 h-4 text-teal-500" />,
  session_revoked: <XCircle className="w-4 h-4 text-sky-500" />,
  suspicious_activity: <ShieldAlert className="w-4 h-4 text-emerald-500" />,
  user_banned: <UserX className="w-4 h-4 text-rose-500" />,
};
const defaultIcon = <Shield className="w-4 h-4 text-slate-500" />;
const eventLabels: Record<string, string> = {
  blocked_ip: 'IP Bloqueada', session_revoked: 'Sesión Revocada',
  suspicious_activity: 'Actividad Sospechosa', user_banned: 'Usuario Suspendido',
};

export default function SecurityDashboardPageClient() {
  const router = useRouter();
  const { stats, chartData, recentEvents, failedAttempts, loading, error, refresh } = useSecurityDashboard();

  const modules = [
    {
      label: 'Auditoría',
      value: loading ? '...' : (stats?.events_today ?? 0),
      icon: 'FileSearch',
      color: 'sky',
      href: '/security/audit',
      description: `${stats?.events_today ?? 0} eventos hoy`,
    },
    {
      label: 'Sesiones Activas',
      value: loading ? '...' : (stats?.active_sessions ?? 0),
      icon: 'LogIn',
      color: 'emerald',
      href: '/security/sessions',
      description: `${stats?.active_users ?? 0} usuarios conectados`,
    },
    {
      label: 'Protección',
      value: loading ? '...' : (stats?.blocked_ips ?? 0),
      icon: 'ShieldCheck',
      color: 'amber',
      href: '/security/protection',
      description: `${stats?.blocked_ips ?? 0} IPs bloqueadas hoy`,
    },
    {
      label: 'Gestión de IPs',
      value: loading ? '...' : (stats?.failed_logins_today ?? 0),
      icon: 'Globe',
      color: 'indigo',
      href: '/security/ips',
      description: `${stats?.failed_logins_today ?? 0} intentos fallidos hoy`,
    },
    {
      label: 'Alertas',
      value: loading ? '...' : (stats?.banned_users ?? 0),
      icon: 'Bell',
      color: 'rose',
      href: '/security/alerts',
      description: `${stats?.banned_users ?? 0} usuarios suspendidos`,
    },
    {
      label: 'Cloudflare',
      value: '—',
      icon: 'Cloud',
      color: 'violet',
      href: '/security/cloudflare',
      description: 'Integración con Cloudflare',
    },
    {
      label: 'Configuración',
      value: loading ? '...' : (stats?.total_users ?? 0),
      icon: 'Settings',
      color: 'sky',
      href: '/security/settings',
      description: `${stats?.total_users ?? 0} usuarios registrados`,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader
        title="Panel de Seguridad"
        subtitle="Centro de monitoreo y protección de la plataforma"
        icon="Shield"
        actions={
          <button onClick={refresh} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
            <RefreshCw className={`w-4 h-4 text-[var(--text-secondary)] ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Stats Cards */}
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

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SecurityLoginChart data={chartData?.login_attempts ?? []} loading={loading} />
        </div>
        <div>
          <SecurityEventsChart data={chartData?.events_by_type ?? []} loading={loading} />
        </div>
      </div>

      <ActiveUsersChart
        users={chartData?.daily_active_users ?? []}
        sessions={chartData?.sessions_by_day ?? []}
        loading={loading}
      />

      {/* Failed Logins Widget */}
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <LogIn className="w-5 h-5 text-teal-500" />
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Intentos Fallidos</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Últimos accesos rechazados</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {loading && failedAttempts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)]">Cargando...</div>
          ) : failedAttempts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
              No hay intentos fallidos recientes.
            </div>
          ) : failedAttempts.map((a) => (
            <div key={a.id} className="flex items-start gap-4 p-4 px-6 hover:bg-[var(--bg-secondary)]/50 transition-colors">
              <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-900/20 flex-shrink-0 mt-0.5">
                <LogIn className="w-4 h-4 text-teal-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{a.email}</p>
                  <span className="text-[10px] text-[var(--text-muted)]">{new Date(a.created_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {a.ip_address && <span className="text-[10px] font-mono text-[var(--text-muted)]">{a.ip_address}</span>}
                  <span className="text-[10px] px-2 py-0.5 bg-teal-100 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-black uppercase rounded-full">Fallido</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Widget */}
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-teal-500" />
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">Actividad Reciente</h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold">Últimos eventos de seguridad</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/security/audit')}
            className="text-[10px] font-black uppercase tracking-widest text-teal-500 hover:text-teal-600 transition-colors"
          >
            Ver todo
          </button>
        </div>
        <div className="divide-y divide-[var(--border-subtle)]">
          {loading && recentEvents.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)]">Cargando eventos...</div>
          ) : error ? (
            <div className="p-6 text-center text-sm text-red-500">{error}</div>
          ) : recentEvents.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
              No hay eventos de seguridad recientes.
            </div>
          ) : recentEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-4 p-4 px-6 hover:bg-[var(--bg-secondary)]/50 transition-colors">
              <div className="p-2 rounded-xl bg-[var(--bg-secondary)] flex-shrink-0 mt-0.5">
                {eventIcons[event.event_type] || defaultIcon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[var(--text-primary)]">
                    {eventLabels[event.event_type] || event.event_type}
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
                {event.description && <p className="text-xs text-[var(--text-secondary)] mt-0.5">{event.description}</p>}
                <div className="flex items-center gap-3 mt-1">
                  {event.user && <span className="text-[10px] text-[var(--text-muted)]">{event.user.name || event.user.email}</span>}
                  {event.ip_address && <span className="text-[10px] font-mono text-[var(--text-muted)]">{event.ip_address}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
