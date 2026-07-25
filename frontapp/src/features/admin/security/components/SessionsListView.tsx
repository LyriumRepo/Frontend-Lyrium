'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone, XCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { SecuritySessionItem, PaginationMeta } from '@/shared/lib/api/adminSecurityRepository';

interface Props {
  sessions: SecuritySessionItem[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  onRevoke: (id: string) => void;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
}

export function SessionsListView({ sessions, pagination, loading, error, onRevoke, onPageChange, onSearch }: Props) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-cyan-500" />
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight">
                Sesiones del Sistema
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
                {pagination ? `${pagination.total} sesiones registradas` : 'Cargando...'}
              </p>
            </div>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar IP o usuario..."
                className="pl-9 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-cyan-500/20 w-64"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
              <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Usuario</th>
              <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Dispositivo / Navegador</th>
              <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">IP</th>
              <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Última Actividad</th>
              <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Estado</th>
              <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {loading && sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
                  Cargando sesiones...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
                  No se encontraron sesiones.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-bold text-[var(--text-primary)]">
                        {session.user?.name || session.user?.email || `ID: ${session.user_id}`}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {session.user?.email || ''}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${session.is_active ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {session.is_mobile ? (
                          <Smartphone className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{session.device}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          {session.platform} &middot; {session.browser} {session.browser_version}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {session.ip_address || '—'}
                      </span>
                      {session.country && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-secondary)] rounded font-semibold text-[var(--text-muted)] uppercase">
                          {session.country}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-[var(--text-secondary)]">
                      {new Date(session.last_activity).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {session.is_active ? (
                      <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">
                        Activa
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-black uppercase rounded-full">
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onRevoke(session.id)}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                      title="Revocar sesión"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} sesiones)
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="text-xs text-[var(--text-muted)]">...</span>
                  )}
                  <button
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                      p === pagination.page
                        ? 'bg-cyan-500 text-white'
                        : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasMore}
              className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
