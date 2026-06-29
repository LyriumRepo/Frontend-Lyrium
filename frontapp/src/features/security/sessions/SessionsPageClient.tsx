'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { Monitor, Smartphone, XCircle, Search, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useSecuritySessions } from '@/features/security/sessions/hooks/useSecuritySessions';

export default function SessionsPageClient() {
  const { sessions, pagination, loading, error, fetch, revoke } = useSecuritySessions();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetch({ search: searchInput || undefined, page: 1, per_page: 15 });
  };

  const handleRevoke = async (id: string) => {
    try { await revoke(id) } catch { /* ignore */ }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
      <ModuleHeader title="Sesiones Activas" subtitle="Usuarios conectados actualmente en la plataforma" icon="LogIn" />

      <div className="bg-[var(--bg-card)] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase">
                Sesiones del Sistema
              </h3>
              <p className="text-[10px] text-[var(--text-secondary)] font-semibold">
                {pagination ? `${pagination.total} sesiones registradas` : 'Cargando...'}
              </p>
            </div>
            <div className="flex gap-2">
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
                <button type="submit" className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-colors">Buscar</button>
              </form>
              <button onClick={() => fetch()} className="p-2 rounded-xl hover:bg-[var(--bg-secondary)] transition-colors">
                <RefreshCw className={`w-4 h-4 text-[var(--text-secondary)] ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Usuario</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Dispositivo</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">IP</th>
                <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Última Actividad</th>
                <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Estado</th>
                <th className="text-center px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading && sessions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">Cargando sesiones...</td></tr>
              ) : error ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-red-500">{error}</td></tr>
              ) : sessions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">No se encontraron sesiones.</td></tr>
              ) : sessions.map((s) => (
                <tr key={s.id} className="hover:bg-[var(--bg-secondary)]/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-[var(--text-primary)]">{s.user?.name || s.user?.email || `ID: ${s.user_id}`}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{s.user?.email || ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${s.is_active ? 'bg-emerald-100 dark:bg-emerald-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
                        {s.device === 'iPhone' || s.device === 'Android' || s.device === 'iPad'
                          ? <Smartphone className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                          : <Monitor className="w-3.5 h-3.5 text-[var(--text-secondary)]" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">{s.device}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{s.browser}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4"><span className="font-mono text-xs text-[var(--text-secondary)]">{s.ip_address || '—'}</span></td>
                  <td className="px-6 py-4"><span className="text-xs text-[var(--text-secondary)]">{new Date(s.last_activity).toLocaleString()}</span></td>
                  <td className="px-6 py-4 text-center">
                    {s.is_active
                      ? <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full">Activa</span>
                      : <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 text-[10px] font-black uppercase rounded-full">Inactiva</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleRevoke(s.id)} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-500 transition-colors" title="Revocar">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)]">
            <p className="text-xs text-[var(--text-secondary)]">Página {pagination.page} de {pagination.totalPages} ({pagination.total} sesiones)</p>
            <div className="flex items-center gap-2">
              <button onClick={() => fetch({ page: pagination.page - 1, per_page: 15, search: searchInput || undefined })} disabled={pagination.page <= 1} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 2)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-xs text-[var(--text-muted)]">...</span>}
                    <button onClick={() => fetch({ page: p, per_page: 15, search: searchInput || undefined })}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${p === pagination.page ? 'bg-cyan-500 text-white' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)]'}`}>{p}</button>
                  </React.Fragment>
                ))}
              <button onClick={() => fetch({ page: pagination.page + 1, per_page: 15, search: searchInput || undefined })} disabled={!pagination.hasMore} className="p-2 rounded-lg hover:bg-[var(--bg-secondary)] disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
