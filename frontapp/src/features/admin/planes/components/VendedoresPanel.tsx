'use client';
import { formatAdminDate } from '@/features/seller/plans/lib/helpers';
import Modal from '@/features/seller/plans/shared/Modal';
import type { Vendedor } from '@/features/seller/plans/types';

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

const ESTADO_COLOR: Record<string, string> = {
  activo:     'var(--color-success)',
  por_vencer: 'var(--color-warning)',
  vencido:    'var(--color-error)',
  indefinido: 'var(--text-secondary)',
};
const ESTADO_LABEL: Record<string, string> = {
  activo:     'Activo',
  por_vencer: 'Por vencer',
  vencido:    'Vencido',
  indefinido: 'Sin vencimiento',
};

const STATUS_FILTERS = [
  ['all',        'Todos'],
  ['activo',     'Activos'],
  ['por_vencer', 'Por vencer'],
  ['vencido',    'Vencidos'],
  ['indefinido', 'Sin plan'],
];

export default function VendedoresPanel({ vendedores, loading, filter, search, selectedVendedor: sv, modalOpen, onFilterChange, onSearchChange, onOpenModal, onCloseModal }: Props) {
  const filtered = vendedores.filter(v => {
    if (filter !== 'all' && getEstado(v) !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (v.username ?? '').toLowerCase().includes(q) || (v.correo ?? v.email ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <>
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text" placeholder="Buscar por nombre o correo…"
            value={search} onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[var(--border-subtle)] rounded-xl text-sm bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand-teal)] transition-colors" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-[var(--bg-muted)] border border-[var(--border-subtle)] p-1 rounded-xl">
            {STATUS_FILTERS.map(([f, l]) => (
              <button key={f}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${filter === f ? 'bg-[var(--bg-card)] shadow-sm text-[var(--brand-teal)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                onClick={() => onFilterChange(f)}>
                {l}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-[var(--text-secondary)] whitespace-nowrap">
            {filtered.length} vendedor{filtered.length !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Grid de vendedores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="col-span-full flex items-center justify-center gap-3 py-12 text-[var(--text-secondary)]">
            <div className="w-6 h-6 border-2 border-[var(--border-subtle)] border-t-[var(--brand-teal)] rounded-full animate-spin" />
            <span className="text-sm">Cargando vendedores…</span>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <p className="text-sm">No se encontraron vendedores</p>
          </div>
        )}
        {!loading && filtered.map(v => {
          const est         = getEstado(v);
          const planColor   = v.css_color ?? '#9ca3af';
          const initials    = (v.username ?? 'V').substring(0, 2).toUpperCase();
          const estadoColor = ESTADO_COLOR[est];
          const histCount   = v.historial?.length ?? 0;
          const correo      = v.correo ?? v.email ?? '';

          let venceBadge: React.ReactNode = null;
          if (est === 'por_vencer' && v.fecha_expiracion) {
            const days = Math.ceil((new Date(v.fecha_expiracion).getTime() - Date.now()) / 86400000);
            venceBadge = <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">Vence en {days}d</span>;
          } else if (est === 'vencido') {
            venceBadge = <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--bg-danger)] text-[var(--color-error)]">Expirado</span>;
          } else if (v.fecha_expiracion) {
            venceBadge = <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold text-[var(--text-secondary)]">Vence: {formatAdminDate(v.fecha_expiracion)}</span>;
          }

          return (
            <div
              key={v.usuario_id}
              role="button" tabIndex={0}
              className="bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-subtle)] hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onOpenModal(String(v.usuario_id))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenModal(String(v.usuario_id)); }}>
              <div className="h-1" style={{ background: planColor }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0" style={{ background: planColor }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-[var(--text-primary)] truncate">{v.username ?? 'Vendedor'}</div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">{correo}</div>
                  </div>
                </div>
                <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold mb-3" style={{ color: planColor, background: `${planColor}18`, border: `1px solid ${planColor}40` }}>
                  {v.nombre_plan ?? 'Emprende'}
                </span>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: estadoColor }} />
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{ESTADO_LABEL[est]}</span>
                  {histCount > 0 && (
                    <span className="ml-auto text-xs bg-[var(--bg-muted)] text-[var(--text-secondary)] px-2 py-0.5 rounded-full">{histCount} cambio{histCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
                {venceBadge}
              </div>
              <div className="px-5 py-2.5 bg-[var(--bg-muted)] border-t border-[var(--border-subtle)] flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--brand-teal)] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
                </svg>
                Historial
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal historial */}
      <Modal open={modalOpen} onClose={onCloseModal} className="max-w-lg mx-4">
        {sv && (() => {
          const est       = getEstado(sv);
          const planColor = sv.css_color ?? '#9ca3af';
          const correo    = sv.correo ?? sv.email ?? '';
          const historial = (sv.historial ?? []) as Record<string, unknown>[];
          const firstHist = historial[0];

          return (
            <div>
              <div className="flex items-center gap-4 pb-4 mb-4 border-b border-[var(--border-subtle)]">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base" style={{ background: planColor }}>
                  {(sv.username ?? 'V').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[var(--text-primary)]">{sv.username ?? 'Vendedor'}</h3>
                  <span className="text-xs text-[var(--text-secondary)]">{correo}</span>
                </div>
              </div>

              {/* Plan actual */}
              <div className="bg-[var(--bg-muted)] rounded-xl p-4 border-l-4 mb-5" style={{ borderLeftColor: planColor }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase text-[var(--text-secondary)]">Plan actual</span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background: `${ESTADO_COLOR[est]}22`, color: ESTADO_COLOR[est] }}>
                    {ESTADO_LABEL[est]}
                  </span>
                </div>
                <div className="text-base font-extrabold mb-2" style={{ color: planColor }}>{sv.nombre_plan ?? 'Emprende'}</div>
                <div className="text-xs text-[var(--text-secondary)] space-y-1">
                  {Boolean(firstHist?.fecha_inicio ?? firstHist?.cambiado_en) && (
                    <div className="flex items-center gap-1.5">
                      <span>📅</span>
                      <span>Desde: <strong className="text-[var(--text-primary)]">{formatAdminDate(String(firstHist?.fecha_inicio ?? firstHist?.cambiado_en ?? ''))}</strong></span>
                    </div>
                  )}
                  {sv.fecha_expiracion && (() => {
                    const daysLeft  = Math.ceil((new Date(sv.fecha_expiracion).getTime() - Date.now()) / 86400000);
                    const isExpired = daysLeft <= 0;
                    return (
                      <div className="flex items-center gap-1.5">
                        <span>⏱</span>
                        <span>
                          Vence: <strong className="text-[var(--text-primary)]">{formatAdminDate(sv.fecha_expiracion)}</strong>
                          {!isExpired && <span className="text-[var(--color-warning)] font-bold ml-1.5">({daysLeft} días restantes)</span>}
                          {isExpired  && <span className="text-[var(--color-error)] font-bold ml-1.5">(vencido)</span>}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Historial de cambios */}
              <div>
                <h4 className="text-sm font-bold text-[var(--text-primary)] mb-3">Historial de cambios</h4>
                <div className="space-y-3">
                  {historial.length === 0
                    ? <p className="text-center text-[var(--text-secondary)] text-xs py-5">Sin historial de cambios</p>
                    : historial.map((h, i) => {
                        const motivoMap: Record<string, string> = { manual: 'Cambio manual', vencido: 'Venció — bajó a Emprende', eliminado: 'Plan eliminado' };
                        const motivo = String(h.motivo ?? '');
                        const mColor = motivo === 'vencido' ? 'var(--color-warning)' : motivo === 'eliminado' ? 'var(--color-error)' : 'var(--text-secondary)';
                        return (
                          <div key={`history-${h.cambiado_en}-${i}`} className="flex gap-3">
                            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: mColor }} />
                            <div className="flex-1">
                              <div className="text-xs font-semibold text-[var(--text-primary)]">
                                {String(h.nombre_desde ?? h.plan_desde ?? '?')} → {String(h.nombre_hasta ?? h.plan_hasta ?? '?')}
                              </div>
                              <div className="text-[11px]" style={{ color: mColor }}>{motivoMap[motivo] ?? motivo}</div>
                              <div className="text-[10px] text-[var(--text-secondary)]">{formatAdminDate(String(h.cambiado_en ?? ''))}</div>
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
      </Modal>
    </>
  );
}
