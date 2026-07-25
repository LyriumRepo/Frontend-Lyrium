'use client';
import { useState, useEffect } from 'react';
import type { AdminRequest, PlansMap } from '@/features/seller/plans/types';
import type { PaymentNotif } from '@/features/admin/planes/hooks/usePlanesAdmin';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import BaseButton from '@/components/ui/BaseButton';
import Pagination from '@/components/ui/Pagination';

interface Props {
  requests: AdminRequest[]; plansData: PlansMap;
  filter: string; onFilterChange: (f: string) => void;
  notifs: PaymentNotif[]; onDismissNotif: (id: string) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  approvingId?: number | null;
  rejectingId?: number | null;
}

const PAGE_SIZE = 10;

export default function RequestsPanel({ requests, plansData, filter, onFilterChange, notifs, onDismissNotif, onApprove, onReject, approvingId, rejectingId }: Props) {
  const [page, setPage] = useState(1);
  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter]);

  return (
    <>
      <div className="flex gap-2 mb-5 flex-wrap" id="requestsFilters">
        {(['all','approved','pending','rejected'] as const).map(f => (
          <button key={f} className={`px-4 py-2.5 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2
            ${filter === f ? 'bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white border-transparent shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            data-filter={f} onClick={() => onFilterChange(f)}>
            {f !== 'all' && <span className="w-2 h-2 rounded-full bg-[var(--brand-sky)] dark:bg-[var(--color-success)]" />}
            {f === 'all' ? 'Todas' : f === 'approved' ? 'Exitosos' : f === 'pending' ? 'Pendientes' : 'Fallidos'}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {notifs.map(n => (
          <div key={n.id} className={`flex items-start gap-3 p-4 bg-[var(--bg-card)] rounded-xl shadow-sm border-l-4 border-[var(--brand-sky)] dark:border-[var(--color-success)]`}>
            <span className={`flex-shrink-0 text-[var(--brand-sky)] dark:text-[var(--color-success)]`}>
              {n.type === 'success'
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              }
            </span>
            <div className="flex-1">
              <strong className="block text-sm font-bold text-[var(--text-primary)] mb-1">{n.title}</strong>
              <span className="text-sm text-[var(--text-secondary)]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(n.body) }} />
            </div>
            <button className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-placeholder)] hover:text-[var(--text-secondary)] transition-colors" onClick={() => onDismissNotif(n.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="requests-list" id="requestsList">
        <div id="requestsContainer">
          {filtered.length === 0
            ? <div className="text-center py-16 text-[var(--text-placeholder)] flex flex-col items-center" id="emptyState">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                <p className="mt-4 text-[15px] text-[var(--text-placeholder)]">No hay solicitudes</p>
              </div>
            : pageFiltered.map((r, i) => {
              const fromName  = plansData[r.fromPlan]?.name ?? r.fromPlan;
              const toName    = plansData[r.toPlan]?.name   ?? r.toPlan;
              const fromColor = plansData[r.fromPlan]?.cssColor ?? '#9ca3af';
              const toColor   = plansData[r.toPlan]?.cssColor   ?? '#9ca3af';
              const statusClass = r.status === 'pending' ? 'bg-[var(--brand-sky)]/10 dark:bg-[var(--color-success)]/10 text-[var(--brand-sky)] dark:text-[var(--color-success)]' : r.status === 'approved' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-[var(--brand-sky)]/10 dark:bg-[var(--color-success)]/10 text-[var(--brand-sky)] dark:text-[var(--color-success)]';
              const statusText  = r.status === 'pending' ? 'PENDIENTE' : r.status === 'approved' ? 'EXITOSO' : 'FALLIDO';
              return (
                <div key={r.id ?? i} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--border-subtle)] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mx-4 my-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusClass}`}>{statusText}</span>
                    <span className="text-[11px] text-[var(--text-placeholder)]">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="px-3 py-1.5 rounded-lg border text-[12px] font-bold" style={{ background:`${fromColor}22`, color:fromColor, borderColor:`${fromColor}44` }}>{fromName}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    <span className="px-3 py-1.5 rounded-lg border text-[12px] font-bold" style={{ background:`${toColor}22`, color:toColor, borderColor:`${toColor}44` }}>{toName}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                    <div className="bg-[var(--bg-muted)] rounded-xl p-2.5 border border-[var(--border-subtle)]"><div className="text-[11px] text-[var(--text-placeholder)] uppercase tracking-wide mb-0.5">USUARIO</div><div className="text-[14px] font-bold text-[var(--text-primary)]">{r.userName ?? '—'}</div></div>
                    <div className="bg-[var(--bg-muted)] rounded-xl p-2.5 border border-[var(--border-subtle)]"><div className="text-[11px] text-[var(--text-placeholder)] uppercase tracking-wide mb-0.5">DURACIÓN</div><div className="text-[14px] font-bold text-[var(--text-primary)]">{r.duration ?? '—'}</div></div>
                    <div className="bg-[var(--bg-muted)] rounded-xl p-2.5 border border-[var(--border-subtle)]"><div className="text-[11px] text-[var(--text-placeholder)] uppercase tracking-wide mb-0.5">MONTO</div><div className="text-[14px] font-bold text-[var(--text-primary)]">S/ {Number(r.amount ?? 0).toFixed(2)}</div></div>
                    <div className="bg-[var(--bg-muted)] rounded-xl p-2.5 border border-[var(--border-subtle)]"><div className="text-[11px] text-[var(--text-placeholder)] uppercase tracking-wide mb-0.5">TIPO</div><div className="text-[14px] font-bold text-[var(--text-primary)]">{r.type === 'upgrade' ? 'Upgrade' : r.type === 'downgrade' ? 'Downgrade' : 'Trial'}</div></div>
                    {r.paymentMethod && r.paymentMethod !== 'trial' && <div className="bg-[var(--bg-muted)] rounded-xl p-2.5 border border-[var(--border-subtle)]"><div className="text-[11px] text-[var(--text-placeholder)] uppercase tracking-wide mb-0.5">MÉTODO</div><div className="text-[14px] font-bold text-[var(--text-primary)]">{r.paymentMethod}</div></div>}
                  </div>
                  
                  {r.status === 'pending' && onApprove && onReject && (
                    <div className="flex gap-2 mt-3">
                      <BaseButton
                        variant="action"
                        size="sm"
                        onClick={() => onApprove(r.id)}
                        disabled={approvingId === r.id || rejectingId === r.id}
                        isLoading={approvingId === r.id}
                        className="flex-1 !rounded-lg"
                      >
                        {approvingId === r.id ? 'Aprobando...' : '✓ Aprobar'}
                      </BaseButton>
                      <BaseButton
                        variant="danger"
                        size="sm"
                        onClick={() => onReject(r.id)}
                        disabled={approvingId === r.id || rejectingId === r.id}
                        isLoading={rejectingId === r.id}
                        className="flex-1 !rounded-lg"
                      >
                        {rejectingId === r.id ? 'Rechazando...' : '✗ Rechazar'}
                      </BaseButton>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}
