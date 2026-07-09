'use client';

import React, { useState, useMemo } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import BaseInputField from '@/components/ui/BaseInputField';
import BaseSelectField from '@/components/ui/BaseSelectField';
import BaseStatCard from '@/components/ui/BaseStatCard';
import BaseStatusBadge from '@/components/ui/BaseStatusBadge';
import BaseModal from '@/components/ui/BaseModal';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { useAuditLogs } from '@/features/security/audit/hooks/useAuditLogs';
import { useRealtimeEvents } from '@/features/security/audit/hooks/useRealtimeEvents';
import type { AuditLog, AuditSource } from '@/features/security/audit/types';
import { Eye, Shield, AlertTriangle, Activity, ChevronDown, ChevronRight, AlertCircle, Clock } from 'lucide-react';

const SEVERITY_MAP = [
  { status: 'info', label: 'Info', class: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: 'Info' },
  { status: 'warning', label: 'Advertencia', class: 'bg-amber-50 text-amber-600 border-amber-100', icon: 'AlertTriangle' },
  { status: 'critical', label: 'Crítico', class: 'bg-rose-50 text-rose-600 border-rose-100', icon: 'AlertCircle' },
];

const MODULE_OPTIONS = [
  { value: '', label: 'Todos los módulos' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'Todas las severidades' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Advertencia' },
  { value: 'critical', label: 'Crítico' },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(iso));
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '…' : str;
}

export default function AuditPageClient() {
  const {
    logs,
    pagination,
    stats,
    modules,
    filters,
    loading,
    error,
    actions,
  } = useAuditLogs();

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const {
    realtimeEvents,
    realtimeTotal,
    realtimeLoading,
  } = useRealtimeEvents();

  const moduleOptions = useMemo(() => {
    const opts = [{ value: '', label: 'Todos los módulos' }];
    for (const m of modules) {
      opts.push({ value: m.module, label: m.module });
    }
    return opts;
  }, [modules]);

  const columns: Column<AuditLog>[] = useMemo(() => [
    {
      key: 'event',
      header: 'Evento',
      render: (log) => (
        <span className="text-sm font-bold text-[var(--text-primary)]">
          {log.event}
        </span>
      ),
    },
    {
      key: 'module',
      header: 'Módulo',
      render: (log) => (
        <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
          {log.module}
        </span>
      ),
    },
    {
      key: 'severity',
      header: 'Severidad',
      render: (log) => {
        if (!log.severity) return <span className="text-xs text-[var(--text-muted)]">—</span>;
        return (
          <BaseStatusBadge
            status={log.severity}
            mappings={SEVERITY_MAP}
            size="sm"
          />
        );
      },
    },
    {
      key: 'description',
      header: 'Descripción',
      render: (log) => (
        <span className="text-sm text-[var(--text-secondary)] max-w-[280px] block truncate" title={log.description}>
          {truncate(log.description, 80)}
        </span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (log) => (
        <span className="text-sm text-[var(--text-primary)]">
          {log.actor.email ?? 'Sistema'}
        </span>
      ),
    },
    {
      key: 'ip_address',
      header: 'IP',
      render: (log) => (
        <span className="text-xs font-mono text-[var(--text-secondary)]">
          {log.ip_address ?? '—'}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha',
      render: (log) => (
        <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap">
          {formatDate(log.created_at)}
        </span>
      ),
    },
    {
      key: 'source',
      header: 'Fuente',
      render: (log) => {
        if (!log.source) return <span className="text-xs text-[var(--text-muted)]">—</span>;
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
            {log.source}
          </span>
        );
      },
    },
  ], []);

  const statsCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: 'Total Eventos',
        value: stats.total.toLocaleString(),
        icon: 'Activity',
        color: 'sky' as const,
      },
      {
        label: 'Hoy',
        value: stats.today.toLocaleString(),
        icon: 'Eye',
        color: 'emerald' as const,
      },
      {
        label: 'IPs Únicas Hoy',
        value: stats.unique_ips_today.toLocaleString(),
        icon: 'Shield',
        color: 'indigo' as const,
      },
    ];
  }, [stats]);

  const hasActiveFilters = filters.search || filters.module || filters.severity || filters.from || filters.to || filters.ip || filters.source || filters.success !== undefined;

  return (
    <div className="px-8 pb-20 space-y-8 animate-fadeIn">
      <ModuleHeader
        title="Auditoría de Seguridad"
        subtitle="Registro de acciones y eventos del sistema"
        icon="FileSearch"
        actions={
          <div className="flex items-center gap-2">
            <BaseButton variant="outline" size="sm" leftIcon="Download" onClick={actions.handleExport}>
              Exportar CSV
            </BaseButton>
            <BaseButton variant="outline" size="sm" leftIcon="RotateCw" onClick={actions.refetch}>
              Actualizar
            </BaseButton>
          </div>
        }
      />

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((card) => {
            const borderMap: Record<string, string> = {
              sky: 'border-[var(--color-info)]',
              emerald: 'border-[var(--color-success)]',
              indigo: 'border-[var(--brand-sky)]',
            };
            const bgMap: Record<string, string> = {
              sky: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
              emerald: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
              indigo: 'bg-[var(--brand-sky)]/10 text-[var(--brand-sky)]',
            };
            const iconMap: Record<string, React.ReactNode> = {
              Activity: <Activity className="w-8 h-8" />,
              Eye: <Eye className="w-8 h-8" />,
              Shield: <Shield className="w-8 h-8" />,
            };
            return (
              <div
                key={card.label}
                className={`bg-[var(--bg-card)] p-6 border-l-4 ${borderMap[card.color] || borderMap.sky} transition-all hover:scale-[1.02] rounded-2xl shadow-sm`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-3 ${bgMap[card.color] || bgMap.sky} rounded-2xl`}>
                    {iconMap[card.icon] || <Activity className="w-8 h-8" />}
                  </div>
                  <span className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                    {card.value}
                  </span>
                </div>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-2">
                  {card.label}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Severity Breakdown */}
      {stats && stats.by_severity && Object.keys(stats.by_severity).length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(stats.by_severity).map(([severity, count]) => {
            const colors: Record<string, string> = {
              info: 'bg-emerald-500',
              warning: 'bg-amber-500',
              critical: 'bg-rose-500',
            };
            return (
              <div
                key={severity}
                className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-4"
              >
                <div className={`w-3 h-3 rounded-full ${colors[severity] || 'bg-gray-400'}`} />
                <div>
                  <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider capitalize">
                    {severity}
                  </p>
                  <p className="text-lg font-black text-[var(--text-primary)]">
                    {count.toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Critical Events Timeline (last 5 min) */}
      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] overflow-hidden">
        <button
          onClick={() => setTimelineOpen((o) => !o)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--bg-secondary)]/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              {realtimeTotal > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 rounded-full text-[8px] font-bold text-white flex items-center justify-center">
                  {realtimeTotal > 9 ? '9+' : realtimeTotal}
                </span>
              )}
            </div>
            <div>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                Eventos Críticos en Tiempo Real
              </span>
              <span className="text-[10px] text-[var(--text-muted)] ml-2">
                (últimos 5 min)
              </span>
            </div>
          </div>
          {timelineOpen ? (
            <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
          )}
        </button>

        {timelineOpen && (
          <div className="px-6 pb-4">
            {realtimeLoading ? (
              <div className="text-xs text-[var(--text-muted)] py-4 text-center">
                Cargando eventos críticos...
              </div>
            ) : realtimeEvents.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-6 text-[var(--text-muted)]">
                <Shield className="w-4 h-4" />
                <span className="text-xs font-medium">
                  Sin eventos críticos en los últimos 5 minutos
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {realtimeEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-rose-50/50 border border-rose-100 hover:bg-rose-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedLog(ev)}
                  >
                    <div className="mt-0.5">
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                          {ev.event}
                        </span>
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {ev.module}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5 truncate">
                        {ev.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {ev.ip_address && (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">
                          {ev.ip_address}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(ev.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-subtle)] space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <BaseInputField
              name="search"
              placeholder="Buscar por descripción, IP o evento..."
              icon="Search"
              value={searchInput}
              onChange={(v) => {
                setSearchInput(v);
                actions.updateFilter('search', v || undefined);
              }}
            />
          </div>
          <BaseSelectField
            name="module"
            label="Módulo"
            value={filters.module ?? ''}
            onChange={(v) => actions.updateFilter('module', v || undefined)}
            options={moduleOptions}
          />
          <BaseSelectField
            name="severity"
            label="Severidad"
            value={filters.severity ?? ''}
            onChange={(v) => actions.updateFilter('severity', v || undefined)}
            options={SEVERITY_OPTIONS}
          />
          <BaseInputField
            name="from"
            type="date"
            label="Desde"
            value={filters.from ?? ''}
            onChange={(v) => actions.updateFilter('from', v || undefined)}
          />
          <BaseInputField
            name="to"
            type="date"
            label="Hasta"
            value={filters.to ?? ''}
            onChange={(v) => actions.updateFilter('to', v || undefined)}
          />
          {hasActiveFilters && (
            <BaseButton
              variant="ghost"
              size="sm"
              leftIcon="X"
              onClick={() => {
                setSearchInput('');
                actions.resetFilters();
              }}
            >
              Limpiar
            </BaseButton>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <BaseButton
            variant="ghost"
            size="sm"
            leftIcon={showAdvancedFilters ? 'ChevronUp' : 'Filter'}
            onClick={() => setShowAdvancedFilters((o) => !o)}
          >
            {showAdvancedFilters ? 'Ocultar filtros avanzados' : 'Filtros avanzados'}
          </BaseButton>
        </div>
        {showAdvancedFilters && (
          <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <BaseInputField
              name="ip"
              placeholder="Filtrar por IP..."
              icon="Search"
              value={filters.ip ?? ''}
              onChange={(v) => actions.updateFilter('ip', v || undefined)}
            />
            <BaseSelectField
              name="source"
              label="Fuente"
              value={filters.source ?? ''}
              onChange={(v) => actions.updateFilter('source', v || undefined)}
              options={[
                { value: '', label: 'Todas las fuentes' },
                { value: 'web', label: 'Web' },
                { value: 'api', label: 'API' },
                { value: 'queue', label: 'Cola' },
                { value: 'scheduler', label: 'Programador' },
                { value: 'system', label: 'Sistema' },
              ]}
            />
            <BaseSelectField
              name="success"
              label="Estado"
              value={filters.success === undefined ? '' : filters.success ? 'success' : 'failure'}
              onChange={(v) => {
                if (v === '') {
                  actions.updateFilter('success', undefined);
                } else {
                  actions.updateFilter('success', v === 'success');
                }
              }}
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'success', label: 'Exitoso' },
                { value: 'failure', label: 'Fallido' },
              ]}
            />
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable<AuditLog>
        data={logs}
        columns={columns}
        loading={loading}
        error={error}
        onRetry={actions.refetch}
        onRowClick={(log) => setSelectedLog(log)}
        keyField="id"
        countLabel="eventos"
        emptyIcon="FileSearch"
        emptyTitle="Sin registros de auditoría"
        emptyDescription="No se encontraron eventos con los filtros aplicados."
      />

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
          </span>
          <div className="flex items-center gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              leftIcon="ArrowLeft"
              disabled={pagination.page <= 1}
              onClick={() => actions.goToPage(pagination.page - 1)}
            >
              Anterior
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => actions.goToPage(pagination.page + 1)}
            >
              Siguiente
            </BaseButton>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <BaseModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title="Detalle del Evento"
        subtitle={selectedLog ? `#${selectedLog.id} · ${selectedLog.event}` : ''}
        size="2xl"
      >
        {selectedLog && <AuditLogDetail log={selectedLog} />}
      </BaseModal>
    </div>
  );
}

function AuditLogDetail({ log }: { log: AuditLog }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Evento</p>
          <p className="text-sm font-bold">{log.event}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Módulo</p>
          <p className="text-sm font-semibold">{log.module}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Severidad</p>
          {log.severity ? (
            <BaseStatusBadge status={log.severity} mappings={SEVERITY_MAP} size="sm" />
          ) : (
            <span className="text-sm text-[var(--text-muted)]">—</span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Fuente</p>
          <p className="text-sm font-semibold uppercase">{log.source ?? '—'}</p>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">Descripción</p>
        <p className="text-sm bg-[var(--bg-secondary)] rounded-2xl p-4 leading-relaxed">
          {log.description}
        </p>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Actor</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">ID</span>
            <span className="text-xs font-semibold">{log.actor.id ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Email</span>
            <span className="text-xs font-semibold">{log.actor.email ?? 'Sistema'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Rol</span>
            <span className="text-xs font-semibold capitalize">{log.actor.role ?? '—'}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Solicitud</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Método</span>
            <span className="text-xs font-mono font-bold">{log.request_method ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Código Respuesta</span>
            <span className="text-xs font-bold">{log.response_code ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">IP</span>
            <span className="text-xs font-mono">{log.ip_address ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Session ID</span>
            <span className="text-xs font-mono truncate max-w-[140px]" title={log.session_id ?? ''}>
              {log.session_id ?? '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Correlation ID</span>
            <span className="text-xs font-mono truncate max-w-[140px]" title={log.correlation_id ?? ''}>
              {log.correlation_id ?? '—'}
            </span>
          </div>
        </div>
      </div>

      {log.request_url && (
        <div className="border-t border-[var(--border-subtle)] pt-4">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">URL</p>
          <p className="text-xs font-mono bg-[var(--bg-secondary)] rounded-xl p-3 break-all">
            {log.request_url}
          </p>
        </div>
      )}

      {log.auditable && (
        <div className="border-t border-[var(--border-subtle)] pt-4">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Auditable</p>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div className="flex justify-between">
              <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Tipo</span>
              <span className="text-xs font-semibold">{log.auditable.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[10px] font-semibold text-[var(--text-secondary)]">ID</span>
              <span className="text-xs font-semibold">#{log.auditable.id}</span>
            </div>
          </div>
        </div>
      )}

      {(log.old_values || log.new_values) && (
        <div className="border-t border-[var(--border-subtle)] pt-4 space-y-4">
          {log.old_values && (
            <div>
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                Valores Anteriores
              </p>
              <pre className="text-xs bg-[var(--bg-secondary)] rounded-xl p-3 overflow-x-auto font-mono">
                {JSON.stringify(log.old_values, null, 2)}
              </pre>
            </div>
          )}
          {log.new_values && (
            <div>
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                Valores Nuevos
              </p>
              <pre className="text-xs bg-[var(--bg-secondary)] rounded-xl p-3 overflow-x-auto font-mono">
                {JSON.stringify(log.new_values, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-[var(--border-subtle)] pt-2">
        <div className="flex justify-between">
          <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Creado</span>
          <span className="text-xs font-semibold">{formatDate(log.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
