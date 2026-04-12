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

const ESTADO_DOT: Record<string, string> = { activo:'#22c55e', por_vencer:'#f59e0b', vencido:'#ef4444', indefinido:'#9ca3af' };
const ESTADO_LABEL: Record<string, string> = { activo:'Activo', por_vencer:'Por vencer', vencido:'Vencido', indefinido:'Sin vencimiento' };

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
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Buscar por nombre o correo…" value={search} onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {[['all','Todos'],['activo','Activos'],['por_vencer','Por vencer'],['vencido','Vencidos'],['indefinido','Sin plan']].map(([f, l]) => (
              <button key={f}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${filter === f ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}
                  ${f === 'por_vencer' ? (filter === f ? 'text-amber-600' : '') : f === 'vencido' ? (filter === f ? 'text-red-600' : '') : f === 'indefinido' ? (filter === f ? 'text-gray-400' : '') : ''}`}
                onClick={() => onFilterChange(f)}>
                {l}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{filtered.length} vendedor{filtered.length !== 1 ? 'es' : ''}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="vendedoresList">
        {loading && (
          <div className="col-span-full flex items-center justify-center gap-3 py-12 text-gray-400">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span>Cargando vendedores…</span>
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-300 flex flex-col items-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            <p className="mt-4 text-sm text-gray-400">No se encontraron vendedores</p>
          </div>
        )}
        {!loading && filtered.map(v => {
          const est         = getEstado(v);
          const planColor   = v.css_color ?? '#9ca3af';
          const initials    = (v.username ?? 'V').substring(0, 2).toUpperCase();
          const estadoColor = ESTADO_DOT[est] ?? '#9ca3af';
          const histCount   = v.historial?.length ?? 0;
          const correo      = v.correo ?? v.email ?? '';

          let venceBadge: React.ReactNode = null;
          if (est === 'por_vencer' && v.fecha_expiracion) {
            const days = Math.ceil((new Date(v.fecha_expiracion).getTime() - Date.now()) / 86400000);
            venceBadge = <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-700">Vence en {days}d</span>;
          } else if (est === 'vencido') {
            venceBadge = <span className="inline-block px-2 py-1 rounded-md text-[10px] font-bold bg-red-100 text-red-700">Expirado</span>;
          } else if (v.fecha_expiracion) {
            venceBadge = <span className="inline-block px-2 py-1 rounded-md text-[10px] font-semibold text-gray-500">Vence: {formatAdminDate(v.fecha_expiracion)}</span>;
          }

          return (
            <div 
              key={v.usuario_id} 
              role="button"
              tabIndex={0}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => onOpenModal(String(v.usuario_id))}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenModal(String(v.usuario_id)); }}
            >
              <div className="h-1.5" style={{ background: planColor }} />
              <div className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0" style={{ background: planColor }}>{initials}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 truncate">{v.username ?? 'Vendedor'}</div>
                    <div className="text-xs text-gray-400 truncate">{correo}</div>
                  </div>
                </div>
                <span className="inline-block px-3 py-1.5 rounded-lg text-[11px] font-bold mb-3" style={{ color: planColor, background: `${planColor}18`, border:`1px solid ${planColor}40` }}>
                  {v.nombre_plan ?? 'Emprende'}
                </span>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full" style={{ background: estadoColor }} />
                  <span className="text-xs font-semibold text-gray-600">{ESTADO_LABEL[est]}</span>
                  {histCount > 0 && (
                    <span className="ml-auto text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{histCount} cambio{histCount !== 1 ? 's' : ''}</span>
                  )}
                </div>
                {venceBadge}
              </div>
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center gap-2 text-xs font-semibold text-gray-400 group-hover:text-blue-500 transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>
                </svg>
                Historial
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modalOpen} onClose={onCloseModal} className="max-w-lg mx-4">
        {sv && (() => {
          const est       = getEstado(sv);
          const planColor = sv.css_color ?? '#9ca3af';
          const correo    = sv.correo ?? sv.email ?? '';
          const historial = (sv.historial ?? []) as Record<string, unknown>[];
          const firstHist = historial[0];

          return (
            <div>
              <div className="flex items-center gap-4 pb-4 border-b-2" style={{ borderColor: planColor }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-extrabold text-lg" style={{ background: planColor }}>
                  {(sv.username ?? 'V').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-gray-800">{sv.username ?? 'Vendedor'}</h3>
                  <span className="text-xs text-gray-400">{correo}</span>
                </div>
              </div>

              <div className="py-4">
                <div className="bg-white rounded-xl p-4 border-l-4 mb-5" style={{ borderLeftColor: planColor }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase text-gray-400">Plan actual</span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background:`${ESTADO_DOT[est]}22`, color: ESTADO_DOT[est] }}>
                      {ESTADO_LABEL[est]}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold mb-2" style={{ color: planColor }}>{sv.nombre_plan ?? 'Emprende'}</div>
                  <div className="text-xs text-gray-500 space-y-1">
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
                  <h4 className="text-sm font-bold text-gray-700 mb-3">Historial de cambios</h4>
                  <div className="space-y-3">
                    {historial.length === 0
                      ? <p className="text-center text-gray-400 text-xs py-5">Sin historial de cambios</p>
                      : historial.map((h, i) => {
                          const motivoMap: Record<string,string> = { manual:'Cambio manual', vencido:'Venció — bajó a Emprende', eliminado:'Plan eliminado' };
                          const motivo = String(h.motivo ?? '');
                          const mColor = motivo === 'vencido' ? '#f59e0b' : motivo === 'eliminado' ? '#ef4444' : '#6b7280';
                          return (
                            <div key={`history-${h.cambiado_en}-${i}`} className="flex gap-3">
                              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: mColor }} />
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-700">
                                  {String(h.nombre_desde ?? h.plan_desde ?? '?')} → {String(h.nombre_hasta ?? h.plan_hasta ?? '?')}
                                </div>
                                <div className="text-[11px]" style={{ color: mColor }}>{motivoMap[motivo] ?? motivo}</div>
                                <div className="text-[10px] text-gray-400">{formatAdminDate(String(h.cambiado_en ?? ''))}</div>
                              </div>
                            </div>
                          );
                        })
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </>
  );
}
