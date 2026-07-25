'use client';

import React, { useState } from 'react';
import { Bell, AlertTriangle, Shield, Info, CheckCircle, XCircle, Search } from 'lucide-react';
import DataTable from '@/components/ui/DataTable';
import BaseButton from '@/components/ui/BaseButton';
import BaseModal from '@/components/ui/BaseModal';
import BaseStatusBadge from '@/components/ui/BaseStatusBadge';
import Pagination from '@/components/ui/Pagination';
import type { Column } from '@/components/ui/DataTable';
import { useAlerts } from '@/features/admin/security/hooks/useAlerts';
import type { SecurityAlertItem } from '@/shared/lib/api/alertRepository';

const ALERT_STATUS_MAPPINGS = [
  { status: 'open', label: 'Abierta', class: 'bg-red-50 text-red-600 border-red-100', icon: 'AlertTriangle' },
  { status: 'dismissed', label: 'Descartada', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'XCircle' },
  { status: 'resolved', label: 'Resuelta', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'CheckCircle' },
];

const ALERT_SEVERITY_MAPPINGS = [
  { status: 'critical', label: 'Crítica', class: 'bg-red-50 text-red-600 border-red-100', icon: 'AlertTriangle' },
  { status: 'warning', label: 'Advertencia', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'AlertTriangle' },
  { status: 'info', label: 'Informativa', class: 'bg-sky-50 text-sky-600 border-sky-100', icon: 'Info' },
];

export default function AlertsPageClient() {
  const {
    alerts,
    pagination,
    activeCount,
    loading,
    error,
    filters,
    setFilter,
    goToPage,
    refetch,
    dismissAlert,
    resolveAlert,
    isMutating,
  } = useAlerts();

  const [selectedAlert, setSelectedAlert] = useState<SecurityAlertItem | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    type: 'dismiss' | 'resolve';
    alert: SecurityAlertItem;
  } | null>(null);

  const columns: Column<SecurityAlertItem>[] = [
    {
      key: 'title',
      header: 'Título',
      render: (item) => (
        <div>
          <p className="text-sm font-bold text-[var(--text-primary)]">{item.title}</p>
          {item.message && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate max-w-xs">
              {item.message}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (item) => (
        <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider">
          {item.type}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severidad',
      render: (item) => (
        <BaseStatusBadge
          status={item.severity}
          mappings={ALERT_SEVERITY_MAPPINGS}
          size="sm"
        />
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (item) => (
        <BaseStatusBadge
          status={item.status}
          mappings={ALERT_STATUS_MAPPINGS}
          size="sm"
        />
      ),
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (item) => (
        <span className="font-mono text-xs text-[var(--text-secondary)]">
          {item.ip_address || '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Creada',
      render: (item) => (
        <span className="text-xs text-[var(--text-secondary)]">
          {new Date(item.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (item) =>
        item.status === 'open' ? (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActionTarget({ type: 'dismiss', alert: item });
              }}
              className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/20 text-amber-500 transition-colors"
              title="Descartar alerta"
            >
              <XCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActionTarget({ type: 'resolve', alert: item });
              }}
              className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors"
              title="Resolver alerta"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
          </div>
        ) : item.status === 'dismissed' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActionTarget({ type: 'resolve', alert: item });
            }}
            className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/20 text-emerald-500 transition-colors"
            title="Resolver alerta"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        ) : null,
    },
  ];

  const handleAction = async () => {
    if (!actionTarget) return;
    const { type, alert } = actionTarget;
    try {
      if (type === 'dismiss') {
        await dismissAlert(alert.id);
      } else {
        await resolveAlert(alert.id);
      }
    } finally {
      setActionTarget(null);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center">
              <Bell className="w-7 h-7 text-rose-500" />
            </div>
            {activeCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg">
                {activeCount > 9 ? '9+' : activeCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">
              Alertas de Seguridad
            </h1>
            <p className="text-sm text-[var(--text-secondary)] font-semibold">
              {activeCount > 0
                ? `${activeCount} alerta${activeCount !== 1 ? 's' : ''} activa${activeCount !== 1 ? 's' : ''} — requieren atención`
                : 'No hay alertas activas'}
            </p>
          </div>
        </div>
        <BaseButton onClick={() => refetch()} variant="outline" leftIcon="RefreshCw" size="sm">
          Refrescar
        </BaseButton>
      </div>

      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/20">
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={filters.status ?? ''}
              onChange={(e) => setFilter('status', e.target.value || undefined)}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">Todos los estados</option>
              <option value="open">Abiertas</option>
              <option value="dismissed">Descartadas</option>
              <option value="resolved">Resueltas</option>
            </select>
            <select
              value={filters.severity ?? ''}
              onChange={(e) => setFilter('severity', e.target.value || undefined)}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">Todas las severidades</option>
              <option value="critical">Crítica</option>
              <option value="warning">Advertencia</option>
              <option value="info">Informativa</option>
            </select>
            <select
              value={filters.type ?? ''}
              onChange={(e) => setFilter('type', e.target.value || undefined)}
              className="px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
            >
              <option value="">Todos los tipos</option>
              <option value="security">Seguridad</option>
              <option value="auth">Autenticación</option>
              <option value="system">Sistema</option>
              <option value="critical">Crítico</option>
            </select>
          </div>
        </div>

        <DataTable<SecurityAlertItem>
          data={alerts}
          columns={columns}
          loading={loading}
          error={error}
          onRetry={refetch}
          onRowClick={(alert) => setSelectedAlert(alert)}
          keyField="id"
          countLabel="alertas"
          emptyTitle="Sin alertas de seguridad"
          emptyDescription="No hay alertas registradas. Las alertas se generan automáticamente ante eventos críticos."
          emptyIcon="Bell"
        />
      </div>

      {pagination && (
        <Pagination page={pagination.current_page} totalPages={pagination.last_page} onPageChange={goToPage} />
      )}

      {/* Detail Modal */}
      <BaseModal
        isOpen={!!selectedAlert}
        onClose={() => setSelectedAlert(null)}
        title={selectedAlert?.title ?? ''}
        subtitle={selectedAlert ? `Alerta #${selectedAlert.id} · ${selectedAlert.type}` : undefined}
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-5">
            <div className="flex gap-3 flex-wrap">
              <BaseStatusBadge status={selectedAlert.severity} mappings={ALERT_SEVERITY_MAPPINGS} size="sm" />
              <BaseStatusBadge status={selectedAlert.status} mappings={ALERT_STATUS_MAPPINGS} size="sm" />
            </div>

            {selectedAlert.message && (
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Mensaje
                </label>
                <p className="text-sm text-[var(--text-primary)] bg-[var(--bg-secondary)] rounded-xl p-4">
                  {selectedAlert.message}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {selectedAlert.ip_address && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    IP
                  </label>
                  <p className="font-mono text-sm text-[var(--text-primary)]">{selectedAlert.ip_address}</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                  Creada
                </label>
                <p className="text-sm text-[var(--text-primary)]">
                  {new Date(selectedAlert.created_at).toLocaleString()}
                </p>
              </div>
              {selectedAlert.resolved_at && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Resuelta
                  </label>
                  <p className="text-sm text-[var(--text-primary)]">
                    {new Date(selectedAlert.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedAlert.resolver && (
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Resuelto por
                  </label>
                  <p className="text-sm text-[var(--text-primary)]">{selectedAlert.resolver.name}</p>
                </div>
              )}
            </div>

            {selectedAlert.audit_log && (
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                  Evento de auditoría relacionado
                </label>
                <div className="bg-[var(--bg-secondary)] rounded-xl p-4 space-y-1">
                  <p className="text-xs font-mono text-[var(--text-secondary)]">{selectedAlert.audit_log.event}</p>
                  <p className="text-sm text-[var(--text-primary)]">{selectedAlert.audit_log.description}</p>
                </div>
              </div>
            )}

            {selectedAlert.status === 'open' && (
              <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
                <BaseButton
                  variant="outline"
                  onClick={() => {
                    dismissAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  isLoading={isMutating}
                >
                  Descartar
                </BaseButton>
                <BaseButton
                  variant="primary"
                  onClick={() => {
                    resolveAlert(selectedAlert.id);
                    setSelectedAlert(null);
                  }}
                  isLoading={isMutating}
                >
                  Resolver
                </BaseButton>
              </div>
            )}
          </div>
        )}
      </BaseModal>

      {/* Action Confirmation Modal */}
      <BaseModal
        isOpen={!!actionTarget}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.type === 'dismiss' ? 'Descartar Alerta' : 'Resolver Alerta'}
        subtitle={actionTarget ? actionTarget.alert.title : undefined}
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-[var(--text-secondary)]">
            {actionTarget?.type === 'dismiss'
              ? 'La alerta se marcará como descartada pero permanecerá en el historial.'
              : 'La alerta se marcará como resuelta. Se recomienda solo cuando la causa haya sido solucionada.'}
          </p>
          <div className="flex justify-end gap-3">
            <BaseButton variant="outline" onClick={() => setActionTarget(null)}>
              Cancelar
            </BaseButton>
            <BaseButton
              variant={actionTarget?.type === 'dismiss' ? 'outline' : 'primary'}
              onClick={handleAction}
              isLoading={isMutating}
              className={actionTarget?.type === 'dismiss' ? 'text-amber-500 border-amber-200 hover:bg-amber-50' : ''}
            >
              {actionTarget?.type === 'dismiss' ? 'Descartar' : 'Resolver'}
            </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}
