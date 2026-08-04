'use client';
import BaseModal from '@/components/ui/BaseModal';
import type { VendedorPago } from '@/features/admin/planes/hooks/usePlanesAdmin';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vendedor: VendedorPago | null;
  filter: string;
}

function MetodoIcon({ metodo }: { metodo: string }) {
  const base = "flex items-center gap-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-muted)] px-3 py-1.5 rounded-full";
  if (metodo === 'Yape') return (
    <span className={base}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      Yape
    </span>
  );
  if (metodo === 'Plin') return (
    <span className={base}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
      Plin
    </span>
  );
  return (
    <span className={base}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
      Tarjeta
    </span>
  );
}

function DetailRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-[var(--border-subtle)] last:border-b-0">
      <span className="text-[11px] font-bold text-[var(--text-placeholder)] uppercase tracking-wider min-w-[80px] shrink-0">{label}</span>
      <span className="text-sm font-semibold text-[var(--text-primary)]" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}

function TransactionEntry({ tx, username }: { tx: any; username: string }) {
  const eColor = tx.estado === 'paid' ? '#10b981' : tx.estado === 'failed' ? '#ef4444' : '#f59e0b';
  const eLabel = tx.estado === 'paid' ? 'EXITOSO' : tx.estado === 'failed' ? 'FALLIDO' : 'PENDIENTE';
  const isYape = tx.metodoPago === 'YAPE' || tx.metodoPago === 'yape';
  const isPlin = tx.metodoPago === 'PLIN' || tx.metodoPago === 'plin';
  const metodo = isYape ? 'Yape' : isPlin ? 'Plin' : 'Tarjeta';
  const fechaObj = tx.fecha ? new Date(tx.fecha) : null;
  const locOpts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  const fechaStr = fechaObj ? fechaObj.toLocaleDateString('es-PE', locOpts) : '—';
  const horaStr = fechaObj ? fechaObj.toLocaleTimeString('es-PE', timeOpts) : '';
  const procesadoStr = tx.procesadoEn
    ? new Date(tx.procesadoEn).toLocaleDateString('es-PE', locOpts) + ' ' + new Date(tx.procesadoEn).toLocaleTimeString('es-PE', timeOpts)
    : null;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3" style={{ background: eColor }}>
        <div className="flex items-center gap-1.5 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            {tx.estado === 'paid'
              ? <polyline points="20 6 9 17 4 12" />
              : tx.estado === 'failed'
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
            }
          </svg>
          <span className="text-xs font-extrabold uppercase tracking-wider">{eLabel}</span>
        </div>
        <span className="text-[10px] text-white/80 font-mono ml-auto">N° {tx.orderId ?? ('#' + tx.id)}</span>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="text-[32px] font-extrabold leading-none shrink-0" style={{ color: eColor }}>S/ {Number(tx.monto ?? 0).toFixed(2)}</div>
          <MetodoIcon metodo={metodo} />
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
          <div>
            <DetailRow label="Plan" value={tx.planNombre ?? tx.planId} color={tx.planColor} />
            <DetailRow label="Duración" value={`${tx.meses} mes(es)`} />
            <DetailRow label="Vendedor" value={username} />
          </div>
          <div>
            <DetailRow label="Fecha" value={fechaStr} />
            <DetailRow label="Hora" value={horaStr} />
            {procesadoStr && <DetailRow label="Procesado" value={procesadoStr} />}
            {tx.transactionId && <DetailRow label="ID Izipay" value={tx.transactionId} />}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-dashed border-[var(--border-subtle)]">
          <div className="text-[10px] font-bold text-[var(--text-placeholder)] uppercase tracking-wider mb-2">Detalle del pago</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <div>
              <DetailRow label="Método" value={metodo} />
              {tx.paymentDetail?.payment_method_type === 'CARD' && tx.paymentDetail?.card_brand ? (
                <DetailRow
                  label="Tarjeta"
                  value={`${tx.paymentDetail.card_brand.toUpperCase()} **** ${tx.paymentDetail.card_last4 ?? '----'}`}
                />
              ) : tx.paymentDetail?.payment_method_type ? (
                <DetailRow label="Tipo" value={tx.paymentDetail.payment_method_type} />
              ) : null}
              {tx.paymentDetail?.mode && (
                <DetailRow label="Modo" value={tx.paymentDetail.mode === 'test' ? 'Prueba' : 'Producción'} />
              )}
            </div>
            <div>
              {tx.paymentDetail?.transaction_uuid && (
                <DetailRow label="UUID" value={tx.paymentDetail.transaction_uuid} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--bg-muted)] border-t border-[var(--border-subtle)] px-5 py-2 text-[10px] text-[var(--text-placeholder)] text-center tracking-wide uppercase">Procesado por <strong className="text-[var(--text-secondary)]">Izipay</strong></div>
    </div>
  );
}

export default function PaymentDetailModal({ isOpen, onClose, vendedor, filter }: Props) {
  if (!vendedor) return null;

  const txs = filter === 'all'
    ? vendedor.transacciones
    : vendedor.transacciones.filter(t => t.estado === filter);

  const initials = (vendedor.username ?? 'VE').substring(0, 2).toUpperCase();
  const exitosos = txs.filter(t => t.estado === 'paid').length;

  const subtitle = txs.length > 0
    ? `${exitosos} exitoso(s) · ${txs.length} registro(s)`
    : 'Sin transacciones';

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Boletas — ${vendedor.username ?? 'Vendedor'}`}
      subtitle={subtitle}
      size="4xl"
    >
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-[var(--border-subtle)]">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-sky)] to-[var(--brand-green)] text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="text-base font-extrabold text-[var(--text-primary)]">{vendedor.username ?? 'Vendedor'}</div>
          <div className="text-xs text-[var(--text-placeholder)] mt-0.5 truncate">{vendedor.correo ?? ''}</div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-[22px] font-extrabold text-[var(--text-primary)]">S/ {Number(vendedor.total_monto ?? 0).toFixed(2)}</div>
        </div>
      </div>

      {txs.length === 0 ? (
        <div className="text-center py-12 text-[var(--text-placeholder)] text-sm font-semibold">No hay transacciones para el filtro seleccionado</div>
      ) : (
        <div className="space-y-4">
          {txs.map(tx => (
            <TransactionEntry key={tx.id} tx={tx} username={vendedor.username ?? '—'} />
          ))}
        </div>
      )}
    </BaseModal>
  );
}
