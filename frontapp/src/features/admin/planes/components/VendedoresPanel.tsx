'use client';
import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { formatAdminDate } from '@/features/seller/plans/lib/helpers';
import AdminModal from '@/components/admin/AdminModal';
import type { Vendedor } from '@/features/seller/plans/types';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import Pagination from '@/components/ui/Pagination';

const PAGE_SIZE = 10;

function getEstado(v: Vendedor): 'activo' | 'por_vencer' | 'vencido' | 'indefinido' {
  if (!v.fecha_expiracion || v.plan_actual === 'basic') return 'indefinido';
  const days = Math.ceil((new Date(v.fecha_expiracion).getTime() - Date.now()) / 86400000);
  if (days <= 0) return 'vencido';
  if (days <= 15) return 'por_vencer';
  return 'activo';
}

interface Props {
  vendedores: Vendedor[]; loading: boolean;
  filter: string; search: string;
  selectedVendedor: Vendedor | null;
  modalOpen: boolean;
  onFilterChange: (f: string) => void;
  onSearchChange: (s: string) => void;
  onOpenModal: (uid: string) => void;
  onCloseModal: () => void;
}

const ESTADO_DOT: Record<string, string> = { activo:'#22c55e', por_vencer:'#f59e0b', vencido:'#ef4444', indefinido:'#9ca3af' };
const ESTADO_LABEL: Record<string, string> = { activo:'Activo', por_vencer:'Por vencer', vencido:'Vencido', indefinido:'Sin vencimiento' };

function getVenceBadge(v: Vendedor, est: string): ReactNode {
  if (est === 'por_vencer' && v.fecha_expiracion) {
    const days = Math.ceil((new Date(v.fecha_expiracion).getTime() - Date.now()) / 86400000);
    return <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">Vence en {days}d</span>;
  }
  if (est === 'vencido') {
    return <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-700">Expirado</span>;
  }
  if (v.fecha_expiracion) {
    return <span className="inline-block px-2 py-1 rounded-md text-[10px] font-semibold text-[var(--text-secondary)]">Vence: {formatAdminDate(v.fecha_expiracion)}</span>;
  }
  return null;
}

const VendedorCell = ({ v }: { v: Vendedor }) => {
  const planColor = v.css_color ?? '#9ca3af';
  const initials = (v.username ?? 'V').substring(0, 2).toUpperCase();
  const correo = v.correo ?? v.email ?? '';
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0" style={{ background: planColor }}>{initials}</div>
      <div className="min-w-0">
        <div className="font-bold text-[var(--text-primary)] truncate">{v.username ?? 'Vendedor'}</div>
        <div className="text-xs text-[var(--text-placeholder)] truncate">{correo}</div>
      </div>
    </div>
  );
};

const PlanCell = ({ v }: { v: Vendedor }) => {
  const planColor = v.css_color ?? '#9ca3af';
  return (
    <span className="inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold" style={{ color: planColor, background: `${planColor}18`, border:`1px solid ${planColor}40` }}>
      {v.nombre_plan ?? 'Emprende'}
    </span>
  );
};

const EstadoCell = ({ v }: { v: Vendedor }) => {
  const est = getEstado(v);
  const estadoColor = ESTADO_DOT[est] ?? '#9ca3af';
  const histCount = v.historial?.length ?? 0;
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: estadoColor }} />
        <span className="text-xs font-semibold text-[var(--text-secondary)]">{ESTADO_LABEL[est]}</span>
        {histCount > 0 && (
          <span className="text-xs bg-[var(--bg-muted)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">{histCount} cambio{histCount !== 1 ? 's' : ''}</span>
        )}
      </div>
      <div className="mt-1.5">{getVenceBadge(v, est)}</div>
    </div>
  );
};

const vendedorColumns: Column<Vendedor>[] = [
  { key: 'vendedor', header: 'Vendedor', render: (v) => <VendedorCell v={v} /> },
  { key: 'plan', header: 'Plan', render: (v) => <PlanCell v={v} /> },
  { key: 'estado', header: 'Estado', render: (v) => <EstadoCell v={v} /> },
];

const VendedorMobileCard = ({ vendedor: v, onOpenModal }: { vendedor: Vendedor; onOpenModal: (uid: string) => void }) => {
  return (
    <div
      role="button"
      tabIndex={0}
      className="p-5 cursor-pointer"
      onClick={() => onOpenModal(String(v.usuario_id))}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenModal(String(v.usuario_id)); }}
    >
      <div className="mb-3"><VendedorCell v={v} /></div>
      <div className="mb-3"><PlanCell v={v} /></div>
      <EstadoCell v={v} />
      <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-[var(--text-placeholder)]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
        </svg>
        Historial
      </div>
    </div>
  );
};

export default function VendedoresPanel({ vendedores, loading, filter, search, selectedVendedor: sv, modalOpen, onFilterChange, onSearchChange, onOpenModal, onCloseModal }: Props) {
  const filtered = vendedores.filter(v => {
    if (filter !== 'all' && getEstado(v) !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (v.username ?? '').toLowerCase().includes(q) || (v.correo ?? v.email ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filtered.length, filter, search]);

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Buscar por nombre o correo…" value={search} onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-primary)] text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl text-sm focus:outline-none focus:border-[var(--brand-sky)] dark:focus:border-[var(--brand-green)]" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex flex-wrap gap-1 bg-[var(--bg-muted)] p-1 rounded-xl">
            {[['all','Todos'],['activo','Activos'],['por_vencer','Por vencer'],['vencido','Vencidos'],['indefinido','Sin plan']].map(([f, l]) => (
              <button key={f}
                className={`px-3 py-2 min-h-[36px] rounded-lg text-xs font-semibold transition-all
                  ${filter === f ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
                  ${f === 'por_vencer' ? (filter === f ? 'text-amber-600' : '') : f === 'vencido' ? (filter === f ? 'text-red-600' : '') : f === 'indefinido' ? (filter === f ? 'text-[var(--text-placeholder)]' : '') : ''}`}
                onClick={() => onFilterChange(f)}>
                {l}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-[var(--text-placeholder)] whitespace-nowrap">{filtered.length} vendedor{filtered.length !== 1 ? 'es' : ''}</span>
        </div>
      </div>

      <div id="vendedoresList">
        <AdminTable
          data={pageFiltered}
          columns={vendedorColumns}
          keyField="usuario_id"
          loading={loading}
          onRowClick={(v) => onOpenModal(String(v.usuario_id))}
          emptyIcon="Users"
          emptyTitle="No se encontraron vendedores"
          mobileCardRender={(v) => <VendedorMobileCard vendedor={v} onOpenModal={onOpenModal} />}
        />

        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <AdminModal
        isOpen={modalOpen}
        onClose={onCloseModal}
        title={sv?.username ?? 'Vendedor'}
        subtitle={sv ? (sv.correo ?? sv.email ?? '') : undefined}
        size="lg"
      >
        {sv && (() => {
          const est       = getEstado(sv);
          const planColor = sv.css_color ?? '#9ca3af';
          const historial = (sv.historial ?? []) as Record<string, unknown>[];
          const firstHist = historial[0];

          return (
            <div>
                <div className="bg-[var(--bg-card)] rounded-xl p-4 border-l-4 mb-5" style={{ borderLeftColor: planColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase text-[var(--text-placeholder)]">Plan actual</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background:`${ESTADO_DOT[est]}22`, color: ESTADO_DOT[est] }}>
                      {ESTADO_LABEL[est]}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold mb-2" style={{ color: planColor }}>{sv.nombre_plan ?? 'Emprende'}</div>
                  <div className="text-xs text-[var(--text-secondary)] space-y-1">
                    {Boolean(firstHist?.fecha_inicio ?? firstHist?.cambiado_en) && (
                      <div className="flex items-center gap-1.5">
                        <span>📅</span>
                        <span>Desde: <strong>{formatAdminDate(String(firstHist?.fecha_inicio ?? firstHist?.cambiado_en ?? ''))}</strong></span>
                      </div>
                    )}
                    {sv.fecha_expiracion && (() => {
                      const daysLeft = Math.ceil((new Date(sv.fecha_expiracion).getTime() - Date.now()) / 86400000);
                      const isExpired = daysLeft <= 0;
                      return (
                        <div className="flex items-center gap-1.5">
                          <span>⏱</span>
                          <span>
                            Vence: <strong>{formatAdminDate(sv.fecha_expiracion)}</strong>
                            {!isExpired && <span className="text-amber-600 font-bold ml-1.5">({daysLeft} días restantes)</span>}
                            {isExpired  && <span className="text-red-600 font-bold ml-1.5">(vencido)</span>}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Historial de cambios</h4>
                  <div className="space-y-3">
                    {historial.length === 0
                      ? <p className="text-center text-[var(--text-placeholder)] text-xs py-5">Sin historial de cambios</p>
                      : historial.map((h, i) => {
                          const motivoMap: Record<string,string> = { manual:'Cambio manual', vencido:'Venció — bajó a Emprende', eliminado:'Plan eliminado' };
                          const motivo = String(h.motivo ?? '');
                          const mColor = motivo === 'vencido' ? '#f59e0b' : motivo === 'eliminado' ? '#ef4444' : '#6b7280';
                          return (
                            <div key={`history-${h.cambiado_en}-${i}`} className="flex gap-3">
                              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: mColor }} />
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-[var(--text-primary)]">
                                  {String(h.nombre_desde ?? h.plan_desde ?? '?')} → {String(h.nombre_hasta ?? h.plan_hasta ?? '?')}
                                </div>
                                <div className="text-[11px]" style={{ color: mColor }}>{motivoMap[motivo] ?? motivo}</div>
                                <div className="text-[10px] text-[var(--text-placeholder)]">{formatAdminDate(String(h.cambiado_en ?? ''))}</div>
                              </div>
                            </div>
                          );
                        })
                    }
                  </div>
                </div>
            </div>
          );
        })()}
      </AdminModal>
    </>
  );
}
