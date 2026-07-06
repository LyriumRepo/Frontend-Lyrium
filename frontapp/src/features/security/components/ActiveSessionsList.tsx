'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { useActiveSessions } from '../hooks/useActiveSessions';

export default function ActiveSessionsList() {
  const { sessions, loading, revoking, error, refresh, revokeSession } = useActiveSessions();

  return (
    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase">
          Sesiones Activas
        </p>
        <button
          onClick={refresh}
          className="text-[10px] font-black text-[var(--text-secondary)] hover:text-[var(--text-primary)] uppercase flex items-center gap-1 transition-colors"
          title="Actualizar"
        >
          <Icon name="RefreshCw" className="w-3 h-3" />
          Actualizar
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-4">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
          <span className="text-xs text-gray-400">Cargando sesiones...</span>
        </div>
      )}

      {error && !loading && (
        <p className="text-xs text-rose-500 font-bold">{error}</p>
      )}

      {!loading && !error && sessions.length === 0 && (
        <p className="text-xs text-gray-400">No hay sesiones registradas.</p>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon
                  name={session.icon}
                  className="w-5 h-5 text-gray-400 shrink-0"
                />
                <div>
                  <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">
                    {session.dispositivo}
                    {session.is_current && (
                      <span className="ml-2 text-[9px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase">
                        Tú
                      </span>
                    )}
                  </p>
                  <p
                    className={`text-[10px] ${
                      session.is_current
                        ? 'text-green-500 font-bold'
                        : 'text-gray-400 dark:text-gray-400'
                    }`}
                  >
                    {session.tiempo}
                  </p>
                </div>
              </div>
              {!session.is_current && (
                <button
                  onClick={() => revoking === null && revokeSession(session.id)}
                  disabled={revoking === session.id}
                  className="text-[10px] font-black text-red-500 hover:underline uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {revoking === session.id ? 'Cerrando...' : 'Cerrar'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
