'use client';

import React from 'react';
import { Monitor, Smartphone, Globe, XCircle, RefreshCw } from 'lucide-react';
import { SecuritySessionItem } from '@/shared/lib/api/adminSecurityRepository';

interface Props {
  sessions: SecuritySessionItem[];
  loading: boolean;
  error: string | null;
  onRevoke: (id: string) => void;
  onRefresh: () => void;
}

export function ActiveSessionsPanel({ sessions, loading, error, onRevoke, onRefresh }: Props) {
  return (
    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-cyan-500" />
          <div>
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
              Sesiones Activas
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
              Últimas sesiones registradas
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
        {loading && sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            Cargando sesiones...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-red-500">
            {error}
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--text-secondary)]">
            No hay sesiones registradas.
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-4 px-6 hover:bg-[var(--bg-secondary)]/50 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`p-2 rounded-xl ${session.is_active ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                  {session.device === 'iPhone' || session.device === 'Android' || session.device === 'iPad' ? (
                    <Smartphone className={`w-4 h-4 ${session.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                  ) : (
                    <Monitor className={`w-4 h-4 ${session.is_active ? 'text-emerald-600' : 'text-gray-400'}`} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">
                    {session.user?.name || session.user?.email || `Usuario #${session.user_id}`}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">
                    {session.device} &middot; {session.browser}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {session.ip_address} &middot; {new Date(session.last_activity).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                {session.is_active ? (
                  <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">
                    Activa
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-black uppercase rounded-full">
                    Inactiva
                  </span>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('¿Revocar esta sesión? El usuario será desconectado.')) {
                      onRevoke(session.id);
                    }
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                  title="Revocar sesión"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
