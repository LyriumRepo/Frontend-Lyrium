'use client';
import type { VendedorPago, PaymentTotals } from '@/features/admin/planes/hooks/usePlanesAdmin';
import { useState } from 'react';
import AdminTable, { Column } from '@/components/admin/AdminTable';
import AdminIndicatorGrid from '@/components/admin/AdminIndicatorGrid';
import PaymentDetailModal from './PaymentDetailModal';

interface Props {
  vendedorPagos: VendedorPago[]; totales: PaymentTotals;
  filter: string; onFilterChange: (f: string) => void;
}

function VendorRow({ vendedor, filter, onViewBoletas }: { vendedor: VendedorPago; filter: string; onViewBoletas: () => void }) {
  const txs = filter === 'all' ? vendedor.transacciones : vendedor.transacciones.filter(t => t.estado === filter);
  const initials = (vendedor.username ?? 'VE').substring(0, 2).toUpperCase();
  const exitosos = txs.filter(t => t.estado === 'paid').length;

  return (
    <div className="flex items-center gap-4 bg-[var(--bg-card)] rounded-2xl p-5 shadow-sm border border-[var(--border-subtle)] flex-wrap cursor-default">
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--brand-sky)] to-[var(--brand-green)] text-white font-extrabold text-lg flex items-center justify-center flex-shrink-0">{initials}</div>
      <div className="flex-1 min-w-[120px]">
        <div className="text-base font-extrabold text-[var(--text-primary)]">{vendedor.username ?? 'Vendedor'}</div>
        <div className="text-xs text-[var(--text-placeholder)] mt-0.5">{vendedor.correo ?? ''}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[22px] font-extrabold text-[var(--text-primary)]">S/ {Number(vendedor.total_monto ?? 0).toFixed(2)}</div>
        <div className="text-xs text-[var(--text-placeholder)] mt-0.5">{exitosos} exitoso(s) · {txs.length} registro(s)</div>
      </div>
      <button className="flex items-center gap-1.5 bg-[var(--bg-muted)] border-none rounded-xl px-4 py-2 text-xs font-semibold text-[var(--text-primary)] cursor-pointer transition-all hover:bg-[var(--bg-card)] flex-shrink-0 whitespace-nowrap"
        onClick={onViewBoletas}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        Ver boletas
      </button>
    </div>
  );
}

export default function PaymentPanel({ vendedorPagos, totales, filter, onFilterChange }: Props) {
  const [modalVendedor, setModalVendedor] = useState<VendedorPago | null>(null);
  const visible = filter === 'all' ? vendedorPagos : vendedorPagos.filter(v => v.transacciones.some(t => t.estado === filter));

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-[var(--text-primary)] mb-2">Historial de Pagos</h2>
        <p className="text-sm text-[var(--text-placeholder)]">Transacciones procesadas por Izipay — ordenadas por fecha</p>
      </div>
      <AdminIndicatorGrid
        indicators={[
          { label: 'Total recaudado', value: `S/ ${Number(totales.total_monto ?? 0).toFixed(2)}`, icon: 'Wallet', color: 'turquesa' },
          { label: 'Pagos exitosos', value: totales.pagos_exitosos, icon: 'CheckCircle', color: 'verde' },
          { label: 'Pagos fallidos', value: totales.pagos_fallidos, icon: 'XCircle', color: 'rose' },
          { label: 'Pendientes', value: totales.pagos_pendientes, icon: 'Clock', color: 'turquesaClaro' },
        ]}
        columns={4}
      />
      <div className="flex gap-2 mb-5 flex-wrap" style={{ marginTop:'20px' }}>
        {(['all','paid','failed','pending'] as const).map(f => (
          <button key={f} className={`px-4 py-2.5 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-300 flex items-center gap-2
            ${filter === f ? 'bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white border-transparent shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            onClick={() => onFilterChange(f)}>
            {f !== 'all' && <span className="w-2 h-2 rounded-full bg-[var(--brand-sky)] dark:bg-[var(--color-success)]" />}
            {f === 'all' ? 'Todos' : f === 'paid' ? 'Exitosos' : f === 'failed' ? 'Fallidos' : 'Pendientes'}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <AdminTable
          data={visible}
          columns={paymentColumns(filter, setModalVendedor)}
          keyField="usuario_id"
          emptyIcon="CreditCard"
          emptyTitle="No hay transacciones aún"
          mobileCardRender={(v) => <VendorRow vendedor={v} filter={filter} onViewBoletas={() => setModalVendedor(v)} />}
        />
      </div>

      <PaymentDetailModal
        isOpen={!!modalVendedor}
        onClose={() => setModalVendedor(null)}
        vendedor={modalVendedor}
        filter={filter}
      />
    </>
  );
}

function paymentColumns(filter: string, setModalVendedor: (v: VendedorPago | null) => void): Column<VendedorPago>[] {
  return [
    {
      key: 'vendedor',
      header: 'Vendedor',
      render: (v) => <VendorRow vendedor={v} filter={filter} onViewBoletas={() => setModalVendedor(v)} />,
    },
  ];
}
