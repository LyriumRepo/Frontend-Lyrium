'use client';
import type { VendedorPago, PaymentTotals } from '@/features/admin/planes/hooks/usePlanesAdmin';
import { useState } from 'react';

interface Props {
  vendedorPagos: VendedorPago[]; totales: PaymentTotals;
  filter: string; onFilterChange: (f: string) => void;
}

// Iconos de método de pago
function MetodoIcon({ metodo }: { metodo: string }) {
  if (metodo === 'Yape') return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)] bg-gray-100 dark:bg-[var(--bg-muted)] px-3 py-1.5 rounded-full">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      Yape
    </span>
  );
  if (metodo === 'Plin') return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)] bg-gray-100 dark:bg-[var(--bg-muted)] px-3 py-1.5 rounded-full">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      Plin
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)] bg-gray-100 dark:bg-[var(--bg-muted)] px-3 py-1.5 rounded-full">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      Tarjeta
    </span>
  );
}

function BoletaGrid({ vendedor, filter }: { vendedor: VendedorPago; filter: string }) {
  const [open, setOpen] = useState(false);
  const txs = filter === 'all' ? vendedor.transacciones : vendedor.transacciones.filter(t => t.estado === filter);
  if (txs.length === 0) return null;
  const initials = (vendedor.username ?? 'VE').substring(0, 2).toUpperCase();
  const exitosos = txs.filter(t => t.estado === 'paid').length;

  return (
    <div className="mb-7">
      <div className="flex items-center gap-4 bg-white dark:bg-[var(--bg-card)] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] flex-wrap cursor-default">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-sky)] to-[var(--brand-green)] text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0">{initials}</div>
        <div className="flex-1 min-w-[120px]">
          <div className="text-base font-extrabold text-gray-800 dark:text-[var(--text-primary)]">{vendedor.username ?? 'Vendedor'}</div>
          <div className="text-xs text-gray-400 dark:text-[var(--text-placeholder)] mt-0.5">{vendedor.correo ?? ''}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[22px] font-extrabold text-gray-800 dark:text-[var(--text-primary)]">S/ {Number(vendedor.total_monto ?? 0).toFixed(2)}</div>
          <div className="text-xs text-gray-400 dark:text-[var(--text-placeholder)] mt-0.5">{exitosos} exitoso(s) · {txs.length} registro(s)</div>
        </div>
        <button className="flex items-center gap-1.5 bg-gray-100 dark:bg-[var(--bg-muted)] border-none rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 dark:text-[var(--text-primary)] cursor-pointer transition-all hover:bg-gray-200 flex-shrink-0 whitespace-nowrap"
          onClick={() => setOpen(!open)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {open ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
          </svg>
          {open ? 'Ocultar' : 'Ver boletas'}
        </button>
      </div>
      {open && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 px-1">
          {txs.map(tx => {
            const eColor = tx.estado === 'paid' ? '#10b981' : tx.estado === 'failed' ? '#ef4444' : '#f59e0b';
            const eLabel = tx.estado === 'paid' ? 'EXITOSO' : tx.estado === 'failed' ? 'FALLIDO' : 'PENDIENTE';
            const isYape = tx.metodoPago === 'YAPE' || tx.metodoPago === 'yape';
            const isPlin = tx.metodoPago === 'PLIN' || tx.metodoPago === 'plin';
            const metodo = isYape ? 'Yape' : isPlin ? 'Plin' : 'Tarjeta';
            const fechaObj = tx.fecha ? new Date(tx.fecha) : null;
            const locOpts: Intl.DateTimeFormatOptions = { day:'2-digit', month:'2-digit', year:'numeric' };
            const timeOpts: Intl.DateTimeFormatOptions = { hour:'2-digit', minute:'2-digit' };
            const fechaStr = fechaObj ? fechaObj.toLocaleDateString('es-PE', locOpts) : '—';
            const horaStr  = fechaObj ? fechaObj.toLocaleTimeString('es-PE', timeOpts) : '';
            return (
              <div key={tx.id} className="bg-white dark:bg-[var(--bg-card)] rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-[var(--border-subtle)] transition-transform hover:-translate-y-0.5">
                <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: eColor }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-95">
                    {tx.estado === 'paid'
                      ? <polyline points="20 6 9 17 4 12"/>
                      : tx.estado === 'failed'
                        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                        : <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>
                    }
                  </svg>
                  <span className="text-[11px] font-extrabold uppercase tracking-wide flex-1">{eLabel}</span>
                  <span className="text-[10px] font-mono opacity-75">N° {tx.orderId ?? ('#' + tx.id)}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[28px] font-extrabold leading-none" style={{ color: eColor }}>S/ {Number(tx.monto ?? 0).toFixed(2)}</div>
                    <MetodoIcon metodo={metodo} />
                  </div>
                  <div className="border-t-2 border-dashed border-gray-200 dark:border-[var(--border-subtle)] my-3" />
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 dark:text-[var(--text-placeholder)] font-medium">Plan</span><span className="text-gray-800 dark:text-[var(--text-primary)] font-semibold text-right max-w-[58%] break-all" style={{ color:tx.planColor, fontWeight:800 }}>{tx.planNombre ?? tx.planId}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 dark:text-[var(--text-placeholder)] font-medium">Vendedor</span><span className="text-gray-800 dark:text-[var(--text-primary)] font-semibold text-right max-w-[58%] break-all">{vendedor.username ?? '—'}</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 dark:text-[var(--text-placeholder)] font-medium">Duración</span><span className="text-gray-800 dark:text-[var(--text-primary)] font-semibold">{tx.meses} mes(es)</span>
                  </div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 dark:text-[var(--text-placeholder)] font-medium">Fecha</span><span className="text-gray-800 dark:text-[var(--text-primary)] font-semibold">{fechaStr}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 dark:text-[var(--text-placeholder)] font-medium">Hora</span><span className="text-gray-800 dark:text-[var(--text-primary)] font-semibold">{horaStr}</span>
                  </div>
                  {tx.procesadoEn && (() => {
                    const p = new Date(tx.procesadoEn!);
                    return <div className="flex justify-between text-xs mt-2"><span className="text-gray-400 dark:text-[var(--text-placeholder)] font-medium">Procesado</span><span className="text-gray-800 dark:text-[var(--text-primary)] font-semibold">{p.toLocaleDateString('es-PE', locOpts)} {p.toLocaleTimeString('es-PE', timeOpts)}</span></div>;
                  })()}
                  {tx.transactionId && <div className="flex justify-between text-xs mt-2"><span className="text-gray-400 dark:text-[var(--text-placeholder)] font-medium">ID Izipay</span><span className="text-gray-500 dark:text-[var(--text-secondary)] font-mono text-[10px] break-all">{tx.transactionId}</span></div>}
                </div>
                <div className="bg-gray-50 dark:bg-[var(--bg-muted)] border-t border-gray-100 dark:border-[var(--border-subtle)] px-4 py-2 text-[10px] text-gray-400 dark:text-[var(--text-placeholder)] text-center tracking-wide uppercase">Procesado por <strong className="text-gray-600 dark:text-[var(--text-secondary)]">Izipay</strong></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PaymentPanel({ vendedorPagos, totales, filter, onFilterChange }: Props) {
  const visible = filter === 'all' ? vendedorPagos : vendedorPagos.filter(v => v.transacciones.some(t => t.estado === filter));

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-[var(--text-primary)] mb-2">Historial de Pagos</h2>
        <p className="text-sm text-gray-400 dark:text-[var(--text-placeholder)]">Transacciones procesadas por Izipay — ordenadas por fecha</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-2">
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-3xl p-5 flex flex-col gap-1.5 relative overflow-hidden transition-shadow hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[var(--brand-sky)] to-[var(--brand-green)]" />
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400 dark:text-[var(--text-placeholder)]">Total recaudado</div>
          <div className="text-[1.75rem] font-extrabold text-gray-800 dark:text-[var(--text-primary)] leading-tight">S/ {Number(totales.total_monto ?? 0).toFixed(2)}</div>
        </div>
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-3xl p-5 flex flex-col gap-1.5 relative overflow-hidden transition-shadow hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-[var(--color-success)]" />
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400 dark:text-[var(--text-placeholder)]">Pagos exitosos</div>
          <div className="text-[1.75rem] font-extrabold text-[var(--color-success)] leading-tight">{totales.pagos_exitosos}</div>
        </div>
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-3xl p-5 flex flex-col gap-1.5 relative overflow-hidden transition-shadow hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-[var(--color-error)]" />
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400 dark:text-[var(--text-placeholder)]">Pagos fallidos</div>
          <div className="text-[1.75rem] font-extrabold text-[var(--color-error)] leading-tight">{totales.pagos_fallidos}</div>
        </div>
        <div className="bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-3xl p-5 flex flex-col gap-1.5 relative overflow-hidden transition-shadow hover:shadow-md hover:-translate-y-0.5">
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-[var(--color-warning)]" />
          <div className="text-[11px] font-extrabold uppercase tracking-wide text-gray-400 dark:text-[var(--text-placeholder)]">Pendientes</div>
          <div className="text-[1.75rem] font-extrabold text-[var(--color-warning)] leading-tight">{totales.pagos_pendientes}</div>
        </div>
      </div>
      <div className="flex gap-2 mb-5 flex-wrap" style={{ marginTop:'20px' }}>
        {(['all','paid','failed','pending'] as const).map(f => (
          <button key={f} className={`px-4 py-2.5 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2
            ${filter === f ? 'bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white border-transparent shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25' : 'bg-white dark:bg-[var(--bg-card)] text-gray-500 dark:text-[var(--text-secondary)] border-gray-200 dark:border-[var(--border-subtle)] hover:border-gray-400 hover:text-gray-700 dark:hover:text-[var(--text-primary)]'}`}
            onClick={() => onFilterChange(f)}>
            {f !== 'all' && <span className={`w-2 h-2 rounded-full ${f === 'paid' ? 'bg-[var(--color-success)]' : f === 'failed' ? 'bg-[var(--color-error)]' : 'bg-[var(--color-warning)]'}`} />}
            {f === 'all' ? 'Todos' : f === 'paid' ? 'Exitosos' : f === 'failed' ? 'Fallidos' : 'Pendientes'}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {visible.length === 0
          ? <div className="text-center py-16 text-gray-300 flex flex-col items-center"><svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><p className="mt-4 text-[15px] text-gray-400 dark:text-[var(--text-placeholder)]">No hay transacciones aún</p></div>
          : visible.map(v => <BoletaGrid key={v.usuario_id} vendedor={v} filter={filter} />)
        }
      </div>
    </>
  );
}
