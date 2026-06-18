'use client';
import type { AdminRequest, PlansMap } from '@/features/seller/plans/types';
import type { PaymentNotif } from '@/features/admin/planes/hooks/usePlanesAdmin';
import { sanitizeHtml } from '@/shared/lib/sanitize';

interface Props {
  requests: AdminRequest[]; plansData: PlansMap;
  filter: string; onFilterChange: (f: string) => void;
  notifs: PaymentNotif[]; onDismissNotif: (id: string) => void;
  onApprove?: (id: number) => void;
  onOpenRejectModal?: (id: number) => void;
  approvingId?: number | null;
  rejectingId?: number | null;
}

const FILTERS = [
  { key: 'all',      label: 'Todas',      dot: null },
  { key: 'approved', label: 'Exitosos',   dot: 'var(--color-success)' },
  { key: 'pending',  label: 'Pendientes', dot: 'var(--color-warning)' },
  { key: 'rejected', label: 'Fallidos',   dot: 'var(--color-error)' },
] as const;

export default function RequestsPanel({ requests, plansData, filter, onFilterChange, notifs, onDismissNotif, onApprove, onOpenRejectModal, approvingId, rejectingId }: Props) {
  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <>
      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.key}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-200 flex items-center gap-2 border
              ${filter === f.key
                ? 'bg-[var(--brand-teal)] text-white border-[var(--brand-teal)]'
                : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)]'}`}
            onClick={() => onFilterChange(f.key)}>
            {f.dot && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: filter === f.key ? 'white' : f.dot }} />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Notificaciones */}
      {notifs.length > 0 && (
        <div className="space-y-2 mb-5">
          {notifs.map(n => (
            <div key={n.id}
              className="flex items-start gap-3 p-3.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] border-l-4"
              style={{ borderLeftColor: n.type === 'success' ? 'var(--color-success)' : 'var(--color-error)' }}>
              <span className="flex-shrink-0 mt-0.5" style={{ color: n.type === 'success' ? 'var(--color-success)' : 'var(--color-error)' }}>
                {n.type === 'success'
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                }
              </span>
              <div className="flex-1">
                <strong className="block text-sm font-bold text-[var(--text-primary)] mb-0.5">{n.title}</strong>
                <span className="text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(n.body) }} />
              </div>
              <button className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-secondary)] transition-colors"
                onClick={() => onDismissNotif(n.id)}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* Lista de solicitudes */}
      <div className="space-y-3">
        {filtered.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
              <p className="text-sm">No hay solicitudes</p>
            </div>
          )
          : filtered.map((r, i) => {
            const fromName  = plansData[r.fromPlan]?.name ?? r.fromPlan;
            const toName    = plansData[r.toPlan]?.name   ?? r.toPlan;
            const fromColor = plansData[r.fromPlan]?.cssColor ?? '#9ca3af';
            const toColor   = plansData[r.toPlan]?.cssColor   ?? '#9ca3af';

            const statusDot   = r.status === 'pending' ? 'var(--color-warning)' : r.status === 'approved' ? 'var(--color-success)' : 'var(--color-error)';
            const statusBg    = r.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                              : r.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400';
            const statusText  = r.status === 'pending' ? 'PENDIENTE' : r.status === 'approved' ? 'EXITOSO' : 'FALLIDO';

            return (
              <div key={r.id ?? i}
                className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-subtle)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusBg}`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusDot }} />
                    {statusText}
                  </span>
                  <span className="text-[11px] text-[var(--text-secondary)]">{new Date(r.date).toLocaleDateString()}</span>
                </div>

                {/* Planes from → to */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-3 py-1.5 rounded-lg border text-[12px] font-bold" style={{ background: `${fromColor}18`, color: fromColor, borderColor: `${fromColor}40` }}>{fromName}</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  <span className="px-3 py-1.5 rounded-lg border text-[12px] font-bold" style={{ background: `${toColor}18`, color: toColor, borderColor: `${toColor}40` }}>{toName}</span>
                </div>

                {/* Datos */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {[
                    { label: 'USUARIO',  value: r.userName ?? '—' },
                    { label: 'DURACIÓN', value: r.duration ?? '—' },
                    { label: 'MONTO',    value: `S/ ${(r.amount ?? 0).toFixed(2)}` },
                    { label: 'TIPO',     value: r.type === 'upgrade' ? 'Upgrade' : r.type === 'downgrade' ? 'Downgrade' : 'Trial' },
                  ].map(d => (
                    <div key={d.label} className="bg-[var(--bg-muted)] rounded-xl p-2.5">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mb-0.5 font-semibold">{d.label}</div>
                      <div className="text-[13px] font-bold text-[var(--text-primary)]">{d.value}</div>
                    </div>
                  ))}
                  {r.paymentMethod && r.paymentMethod !== 'trial' && (
                    <div className="bg-[var(--bg-muted)] rounded-xl p-2.5">
                      <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide mb-0.5 font-semibold">MÉTODO</div>
                      <div className="text-[13px] font-bold text-[var(--text-primary)]">{r.paymentMethod}</div>
                    </div>
                  )}
                </div>

                {r.status === 'pending' && onApprove && onOpenRejectModal && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
                    <button
                      onClick={() => onApprove(r.id)}
                      disabled={approvingId === r.id || rejectingId === r.id}
                      className="flex-1 px-3 py-2 bg-[var(--color-success)] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                      {approvingId === r.id ? 'Aprobando...' : '✓ Aprobar'}
                    </button>
                    <button
                      onClick={() => onOpenRejectModal(r.id)}
                      disabled={approvingId === r.id || rejectingId === r.id}
                      className="flex-1 px-3 py-2 bg-[var(--color-error)] text-white text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all">
                      {rejectingId === r.id ? 'Rechazando...' : '✗ Rechazar'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        }
      </div>
    </>
  );
}
