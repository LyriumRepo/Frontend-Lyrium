'use client';
import type { AdminRequest, PlansMap } from '@/features/seller/plans/types';
import type { PaymentNotif } from '@/features/admin/planes/hooks/usePlanesAdmin';
import { sanitizeHtml } from '@/shared/lib/sanitize';

interface Props {
  requests: AdminRequest[]; plansData: PlansMap;
  filter: string; onFilterChange: (f: string) => void;
  notifs: PaymentNotif[]; onDismissNotif: (id: string) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number, notes: string) => void;
  approvingId?: number | null;
  rejectingId?: number | null;
}

export default function RequestsPanel({ requests, plansData, filter, onFilterChange, notifs, onDismissNotif, onApprove, onReject, approvingId, rejectingId }: Props) {
  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <>
      <div className="flex gap-2 mb-5 flex-wrap" id="requestsFilters">
        {(['all','approved','pending','rejected'] as const).map(f => (
          <button key={f} className={`px-4 py-2.5 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2
            ${filter === f ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'}`}
            data-filter={f} onClick={() => onFilterChange(f)}>
            {f !== 'all' && <span className={`w-2 h-2 rounded-full ${f === 'approved' ? 'bg-emerald-500' : f === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />}
            {f === 'all' ? 'Todas' : f === 'approved' ? 'Exitosos' : f === 'pending' ? 'Pendientes' : 'Fallidos'}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-6">
        {notifs.map(n => (
          <div key={n.id} className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: n.type === 'success' ? '#10b981' : '#ef4444' }}>
            <span className="flex-shrink-0" style={{ color: n.type === 'success' ? '#10b981' : '#ef4444' }}>
              {n.type === 'success'
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              }
            </span>
            <div className="flex-1">
              <strong className="block text-sm font-bold text-gray-800 mb-1">{n.title}</strong>
              <span className="text-sm text-gray-500" dangerouslySetInnerHTML={{ __html: sanitizeHtml(n.body) }} />
            </div>
            <button className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors" onClick={() => onDismissNotif(n.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="requests-list" id="requestsList">
        <div id="requestsContainer">
          {filtered.length === 0
            ? <div className="text-center py-16 text-gray-300 flex flex-col items-center" id="emptyState">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>
                <p className="mt-4 text-[15px] text-gray-400">No hay solicitudes</p>
              </div>
            : filtered.map((r, i) => {
              const fromName  = plansData[r.fromPlan]?.name ?? r.fromPlan;
              const toName    = plansData[r.toPlan]?.name   ?? r.toPlan;
              const fromColor = plansData[r.fromPlan]?.cssColor ?? '#9ca3af';
              const toColor   = plansData[r.toPlan]?.cssColor   ?? '#9ca3af';
              const statusClass = r.status === 'pending' ? 'bg-amber-100 text-amber-700' : r.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
              const statusText  = r.status === 'pending' ? 'PENDIENTE' : r.status === 'approved' ? 'EXITOSO' : 'FALLIDO';
              return (
                <div key={r.id ?? i} className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 mx-4 my-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${statusClass}`}>{statusText}</span>
                    <span className="text-[11px] text-gray-400">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mb-4">
                    <span className="px-3 py-1.5 rounded-lg border text-[12px] font-bold" style={{ background:`${fromColor}22`, color:fromColor, borderColor:`${fromColor}44` }}>{fromName}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    <span className="px-3 py-1.5 rounded-lg border text-[12px] font-bold" style={{ background:`${toColor}22`, color:toColor, borderColor:`${toColor}44` }}>{toName}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100"><div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">USUARIO</div><div className="text-[14px] font-bold text-gray-700">{r.userName ?? '—'}</div></div>
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100"><div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">DURACIÓN</div><div className="text-[14px] font-bold text-gray-700">{r.duration ?? '—'}</div></div>
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100"><div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">MONTO</div><div className="text-[14px] font-bold text-gray-700">S/ {(r.amount ?? 0).toFixed(2)}</div></div>
                    <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100"><div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">TIPO</div><div className="text-[14px] font-bold text-gray-700">{r.type === 'upgrade' ? 'Upgrade' : r.type === 'downgrade' ? 'Downgrade' : 'Trial'}</div></div>
                    {r.paymentMethod && r.paymentMethod !== 'trial' && <div className="bg-gray-50 rounded-xl p-2.5 border border-gray-100"><div className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">MÉTODO</div><div className="text-[14px] font-bold text-gray-700">{r.paymentMethod}</div></div>}
                  </div>
                  
                  {r.status === 'pending' && onApprove && onReject && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => onApprove(r.id)}
                        disabled={approvingId === r.id || rejectingId === r.id}
                        className="flex-1 px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                      >
                        {approvingId === r.id ? 'Aprobando...' : '✓ Aprobar'}
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Ingrese motivo del rechazo:');
                          if (notes) onReject(r.id, notes);
                        }}
                        disabled={approvingId === r.id || rejectingId === r.id}
                        className="flex-1 px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {rejectingId === r.id ? 'Rechazando...' : '✗ Rechazar'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      </div>
    </>
  );
}
