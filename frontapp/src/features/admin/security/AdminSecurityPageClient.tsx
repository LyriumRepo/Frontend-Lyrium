'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import { useAdminSecurity } from '@/features/admin/security/hooks/useAdminSecurity';
import { SecurityStatsCards } from '@/features/admin/security/components/SecurityStatsCards';
import { ActiveSessionsPanel } from '@/features/admin/security/components/ActiveSessionsPanel';
import { SecurityActivityFeed } from '@/features/admin/security/components/SecurityActivityFeed';
import { SecurityLoginChart } from '@/features/admin/security/components/SecurityLoginChart';
import { SecurityEventsChart } from '@/features/admin/security/components/SecurityEventsChart';
import { ActiveUsersChart } from '@/features/admin/security/components/ActiveUsersChart';
import { SessionsListView } from '@/features/admin/security/components/SessionsListView';
import { LayoutDashboard, Monitor } from 'lucide-react';

type Tab = 'dashboard' | 'sessions';

export function AdminSecurityPageClient() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionSearch, setSessionSearch] = useState('');

  const {
    stats,
    statsLoading,
    chartData,
    chartLoading,
    sessions,
    sessionsPagination,
    sessionsLoading,
    sessionsError,
    revokeSession,
    fetchSessions,
    events,
    eventsLoading,
    eventsError,
    fetchEvents,
    refresh,
  } = useAdminSecurity();

  const handleRevoke = async (id: string) => {
    try {
      await revokeSession(id);
    } catch (err) {
      console.error('Error al revocar sesión:', err);
    }
  };

  const handleSessionPageChange = (page: number) => {
    setSessionPage(page);
    fetchSessions({ page, per_page: 15, search: sessionSearch || undefined });
  };

  const handleSessionSearch = (search: string) => {
    setSessionSearch(search);
    setSessionPage(1);
    fetchSessions({ page: 1, per_page: 15, search: search || undefined });
  };

  const tabs = [
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'sessions' as Tab, label: 'Sesiones Activas', icon: <Monitor className="w-5 h-5" /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-industrial pb-20">
      <ModuleHeader
        title="Centro de Seguridad"
        subtitle="Monitoreo y control de seguridad del sistema"
        icon="Shield"
        actions={
          <BaseButton onClick={() => refresh()} variant="outline" leftIcon="RefreshCw" size="md">
            Refrescar
          </BaseButton>
        }
      />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
              tab === t.id
                ? 'bg-[var(--bg-card)] shadow-xl shadow-black/5 text-cyan-500 border border-[var(--border-subtle)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-6">
          <SecurityStatsCards stats={stats} loading={statsLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SecurityLoginChart
                data={chartData?.login_attempts ?? []}
                loading={chartLoading}
              />
            </div>
            <div>
              <SecurityEventsChart
                data={chartData?.events_by_type ?? []}
                loading={chartLoading}
              />
            </div>
          </div>

          <ActiveUsersChart
            users={chartData?.daily_active_users ?? []}
            sessions={chartData?.sessions_by_day ?? []}
            loading={chartLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActiveSessionsPanel
              sessions={sessions}
              loading={sessionsLoading}
              error={sessionsError}
              onRevoke={handleRevoke}
              onRefresh={() => fetchSessions({ per_page: 10 })}
            />
            <SecurityActivityFeed
              events={events}
              loading={eventsLoading}
              error={eventsError}
              onRefresh={() => fetchEvents({ per_page: 10 })}
            />
          </div>
        </div>
      )}

      {tab === 'sessions' && (
        <SessionsListView
          sessions={sessions}
          pagination={sessionsPagination}
          loading={sessionsLoading}
          error={sessionsError}
          onRevoke={handleRevoke}
          onPageChange={handleSessionPageChange}
          onSearch={handleSessionSearch}
        />
      )}
    </div>
  );
}
