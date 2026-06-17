'use client';
import type { VendedorPago, PaymentTotals } from '@/features/admin/planes/hooks/usePlanesAdmin';
import { useState } from 'react';

interface Props {
  vendedorPagos: VendedorPago[]; totales: PaymentTotals;
  filter: string; onFilterChange: (f: string) => void;
}

function MetodoIcon({ metodo }: { metodo: string }) {
  const isWallet = metodo === 'Yape' || metodo === 'Plin';
  return (
    <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] bg-[var(--bg-muted)] px-3 py-1.5 rounded-full">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {isWallet
          ? <><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></>
          : <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>
        }
      </svg>
      {metodo}
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
    <div className="mb-5">
      <div className="flex items-center gap-4 bg-[var(--bg-card)] rounded-2xl p-4 border border-[var(--border-subtle)] flex-wrap cursor-default hover:shadow-sm transition-shadow">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-sky)] text-white font-extrabold text-base flex items-center justify-center flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-[120px]">
          <div className="font-extrabold text-[var(--text-primary)]">{vendedor.username ?? 'Vendedor'}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{vendedor.correo ?? ''}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[20px] font-extrabold text-[var(--text-primary)]">S/ {vendedor.total_monto.toFixed(2)}</div>
          <div className="text-xs text-[var(--text-secondary)] mt-0.5">{exitosos} exitoso(s) · {txs.length} registro(s)</div>
        </div>
        <button
          className="flex items-center gap-1.5 bg-[var(--bg-muted)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] cursor-pointer transition-all hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal)] flex-shrink-0 whitespace-nowrap"
          onClick={() => setOpen(!open)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {open ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
          </svg>
          {open ? 'Ocultar' : 'Ver boletas'}
        </button>
      </div>

      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 px-1">
          {txs.map(tx => {
            const eColor = tx.estado === 'paid' ? 'var(--color-success)' : tx.estado === 'failed' ? 'var(--color-error)' : 'var(--color-warning)';
            const eHex   = tx.estado === 'paid' ? '#10b981' : tx.estado === 'failed' ? '#ef4444' : '#f59e0b';
            const eLabel = tx.estado === 'paid' ? 'EXITOSO' : tx.estado === 'failed' ? 'FALLIDO' : 'PENDIENTE';
            const isYape  = tx.metodoPago === 'YAPE' || tx.metodoPago === 'yape';
            const isPlin  = tx.metodoPago === 'PLIN' || tx.metodoPago === 'plin';
            const metodo  = isYape ? 'Yape' : isPlin ? 'Plin' : 'Tarjeta';
            const fechaObj = tx.fecha ? new Date(tx.fecha) : null;
            const locOpts: Intl.DateTimeFormatOptions  = { day: '2-digit', month: '2-digit', year: 'numeric' };
            const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
            const fechaStr = fechaObj ? fechaObj.toLocaleDateString('es-PE', locOpts) : '—';
            const horaStr  = fechaObj ? fechaObj.toLocaleTimeString('es-PE', timeOpts) : '';

            return (
              <div key={tx.id} className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden transition-transform hover:-translate-y-0.5">
                {/* Header con color de estado */}
                <div className="flex items-center gap-2 px-3.5 py-2.5" style={{ background: eHex }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    {tx.estado === 'paid'
                      ? <polyline points="20 6 9 17 4 12"/>
                      : tx.estado === 'failed'
                        ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                        : <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>
                    }
                  </svg>
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-white flex-1">{eLabel}</span>
                  <span className="text-[10px] font-mono text-white/75">N° {tx.orderId ?? ('#' + tx.id)}</span>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[26px] font-extrabold leading-none" style={{ color: eColor }}>S/ {tx.monto.toFixed(2)}</div>
                    <MetodoIcon metodo={metodo} />
                  </div>
                  <div className="border-t border-dashed border-[var(--border-subtle)] my-3" />
                  {[
                    { label: 'Plan',      value: tx.planNombre ?? tx.planId, color: tx.planColor },
                    { label: 'Vendedor',  value: vendedor.username ?? '—' },
                    { label: 'Duración',  value: `${tx.meses} mes(es)` },
                    { label: 'Fecha',     value: fechaStr },
                    { label: 'Hora',      value: horaStr },
                    ...(tx.procesadoEn ? [{
                      label: 'Procesado',
                      value: (() => { const p = new Date(tx.procesadoEn!); return `${p.toLocaleDateString('es-PE', locOpts)} ${p.toLocaleTimeString('es-PE', timeOpts)}`; })()
                    }] : []),
                  ].map(d => (
                    <div key={d.label} className="flex justify-between text-xs mb-2">
                      <span className="text-[var(--text-secondary)] font-medium">{d.label}</span>
                      <span className="font-semibold text-right max-w-[58%] break-all" style={{ color: d.color ?? 'var(--text-primary)' }}>{d.value}</span>
                    </div>
                  ))}
                  {tx.transactionId && (
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-[var(--text-secondary)] font-medium">ID Izipay</span>
                      <span className="text-[var(--text-secondary)] font-mono text-[10px] break-all">{tx.transactionId}</span>
                    </div>
                  )}
                </div>
                <div className="bg-[var(--bg-muted)] border-t border-[var(--border-subtle)] px-4 py-2 text-[10px] text-[var(--text-secondary)] text-center tracking-wide uppercase">
                  Procesado por <strong className="text-[var(--text-primary)]">Izipay</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const STAT_CARDS = [
  { label: 'Total recaudado', key: 'total_monto' as const,    prefix: 'S/ ', gradient: 'from-[var(--brand-teal)] to-[var(--brand-sky)]', textColor: 'text-[var(--text-primary)]' },
  { label: 'Exitosos',        key: 'pagos_exitosos' as const,  gradient: 'from-[var(--color-success)] to-[var(--color-success)]', textColor: 'text-[var(--color-success)]' },
  { label: 'Fallidos',        key: 'pagos_fallidos' as const,  gradient: 'from-[var(--color-error)] to-[var(--color-error)]',   textColor: 'text-[var(--color-error)]' },
  { label: 'Pendientes',      key: 'pagos_pending' as const,   gradient: 'from-[var(--color-warning)] to-[var(--color-warning)]', textColor: 'text-[var(--color-warning)]' },
];

const PAY_FILTERS = [
  { key: 'all',     label: 'Todos',     dot: null },
  { key: 'paid',    label: 'Exitosos',  dot: 'var(--color-success)' },
  { key: 'failed',  label: 'Fallidos',  dot: 'var(--color-error)' },
  { key: 'pending', label: 'Pendientes',dot: 'var(--color-warning)' },
] as const;

export default function PaymentPanel({ vendedorPagos, totales, filter, onFilterChange }: Props) {
  const visible = filter === 'all' ? vendedorPagos : vendedorPagos.filter(v => v.transacciones.some(t => t.estado === filter));

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-extrabold text-[var(--text-primary)] mb-1">Historial de Pagos</h2>
        <p className="text-sm text-[var(--text-secondary)]">Transacciones procesadas por Izipay — ordenadas por fecha</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {STAT_CARDS.map(card => (
          <div key={card.key} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 relative overflow-hidden hover:shadow-sm transition-shadow">
            <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${card.gradient}`} />
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--text-secondary)] mb-1">{card.label}</div>
            <div className={`text-[1.6rem] font-extrabold leading-tight ${card.textColor}`}>
              {card.prefix}{typeof totales[card.key] === 'number' && card.prefix ? (totales[card.key] as number).toFixed(2) : totales[card.key]}
            </div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {PAY_FILTERS.map(f => (
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

      <div className="mt-2">
        {visible.length === 0
          ? (
            <div className="flex flex-col items-center justify-center py-16 text-[var(--text-secondary)]">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <p className="text-sm">No hay transacciones aún</p>
            </div>
          )
          : visible.map(v => <BoletaGrid key={v.usuario_id} vendedor={v} filter={filter} />)
        }
      </div>
    </>
  );
}
