'use client';

import React from 'react';
import { Shield, ShieldAlert, ShieldOff, UserX, XCircle, Activity, RefreshCw } from 'lucide-react';
import { SecurityEventItem } from '@/shared/lib/api/adminSecurityRepository';

const eventIcons: Record<string, React.ReactNode> = {
  blocked_ip: <ShieldOff className="w-4 h-4 text-red-500" />,
  session_revoked: <XCircle className="w-4 h-4 text-amber-500" />,
  suspicious_activity: <ShieldAlert className="w-4 h-4 text-orange-500" />,
  user_banned: <UserX className="w-4 h-4 text-rose-500" />,
};

const defaultIcon = <Shield className="w-4 h-4 text-slate-500" />;

const eventLabels: Record<string, string> = {
  blocked_ip: 'IP Bloqueada',
  session_revoked: 'Sesión Revocada',
  suspicious_activity: 'Actividad Sospechosa',
  user_banned: 'Usuario Suspendido',
};

interface Props {
  events: SecurityEventItem[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function SecurityActivityFeed({ events, loading, error, onRefresh }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-cyan-500" />
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
              Actividad de Seguridad
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
              Eventos recientes
            </p>
          </div>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--text-secondary)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="divide-y divide-[var(--border-subtle)]">
        {loading && events.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            Cargando eventos...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            No hay eventos de seguridad registrados.
          </div>
        ) : (
          events.map((event) => (
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
                {event.description && (
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {event.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {event.user && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {event.user.name || event.user.email}
                    </span>
                  )}
                  {event.ip_address && (
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {event.ip_address}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
