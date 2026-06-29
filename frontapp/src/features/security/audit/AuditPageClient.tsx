'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { Shield, ShieldAlert, ShieldOff, UserX, XCircle, Activity, RefreshCw } from 'lucide-react';
import { adminSecurityRepository, SecurityEventItem, PaginationMeta } from '@/shared/lib/api/adminSecurityRepository';

const eventIcons: Record<string, React.ReactNode> = {
  blocked_ip: <ShieldOff className="w-5 h-5 text-red-500" />,
  session_revoked: <XCircle className="w-5 h-5 text-amber-500" />,
  suspicious_activity: <ShieldAlert className="w-5 h-5 text-orange-500" />,
  user_banned: <UserX className="w-5 h-5 text-rose-500" />,
};
const defaultIcon = <Shield className="w-5 h-5 text-slate-500" />;
const eventLabels: Record<string, string> = {
  blocked_ip: 'IP Bloqueada', session_revoked: 'Sesión Revocada',
  suspicious_activity: 'Actividad Sospechosa', user_banned: 'Usuario Suspendido',
};

export default function AuditPageClient() {
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback((params: Record<string, string | number | boolean | undefined> = {}) => {
    setLoading(true); setError(null);
    adminSecurityRepository.getActivity({ per_page: 20, ...params })
      .then((res) => { setEvents(res.data); setPagination(res.pagination) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch() }, [fetch]);

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader
        title="Auditoría"
        subtitle="Registro de acciones y eventos del sistema"
        icon="FileSearch"
        actions={
          <button onClick={() => fetch()} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
            <RefreshCw className={`w-4 h-4 text-[var(--text-secondary)] ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
            {pagination ? `${pagination.total} eventos registrados` : 'Cargando...'}
          </p>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {loading && events.length === 0 ? (
            <div className="p-12 text-center text-sm text-[var(--text-secondary)]">Cargando eventos...</div>
          ) : error ? (
            <div className="p-12 text-center text-sm text-red-500">{error}</div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[300px] p-12">
              <Activity className="w-12 h-12 text-[var(--text-muted)] mb-4" />
              <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">Sin eventos de seguridad</h3>
              <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                Aún no se han registrado eventos de seguridad. Los eventos aparecerán aquí cuando ocurran actividades como bloqueos de IP, revocaciones de sesión o suspensiones de usuarios.
              </p>
            </div>
          ) : events.map((event) => (
            <div key={event.id} className="flex items-start gap-4 p-4 px-6 hover:bg-[var(--bg-secondary)]/50 transition-colors">
              <div className="p-2 rounded-xl bg-[var(--bg-secondary)] flex-shrink-0 mt-0.5">
                {eventIcons[event.event_type] || defaultIcon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{eventLabels[event.event_type] || event.event_type}</p>
                  <span className="text-[10px] text-[var(--text-muted)]">{new Date(event.created_at).toLocaleString()}</span>
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

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-secondary)]">Página {pagination.page} de {pagination.totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetch({ page: pagination.page - 1, per_page: 20 })}
                disabled={pagination.page <= 1}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-card)] disabled:opacity-30 transition-colors">
                Anterior
              </button>
              <button onClick={() => fetch({ page: pagination.page + 1, per_page: 20 })}
                disabled={!pagination.hasMore}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:opacity-30 transition-colors">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
