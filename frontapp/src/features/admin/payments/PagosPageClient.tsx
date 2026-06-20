'use client';

import React, { useState, useMemo, useCallback } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import BaseInputField from '@/components/ui/BaseInputField';
import BaseSelectField, { type SelectOption } from '@/components/ui/BaseSelectField';
import BaseStatsGrid from '@/components/ui/BaseStatsGrid';
import BaseStatusBadge from '@/components/ui/BaseStatusBadge';
import BaseModal from '@/components/ui/BaseModal';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { useTransactions, useTransactionDetail } from '@/features/admin/payments/hooks/useTransactions';
import type { Transaction, TransactionFilters } from '@/features/admin/payments/types/transactions';
import { CreditCard, Wallet, Smartphone, Package, Briefcase, Layers } from 'lucide-react';

import type { StatusMapping } from '@/components/ui/BaseStatusBadge';

const PAYMENT_STATUS_MAP: StatusMapping[] = [
  { status: 'paid', label: 'Pagado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
  { status: 'pending', label: 'Pendiente', class: 'bg-amber-100 text-amber-700', icon: 'Clock' },
  { status: 'failed', label: 'Fallido', class: 'bg-red-100 text-red-700', icon: 'XCircle' },
  { status: 'refunded', label: 'Reembolsado', class: 'bg-violet-100 text-violet-700', icon: 'Undo2' },
];

const TRANSACTION_STATUS_MAP: StatusMapping[] = [
  { status: 'AUTHORISED', label: 'Autorizado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
  { status: 'CAPTURED', label: 'Capturado', class: 'bg-emerald-100 text-emerald-700', icon: 'CheckCircle' },
  { status: 'REFUSED', label: 'Rechazado', class: 'bg-red-100 text-red-700', icon: 'XCircle' },
  { status: 'CANCELLED', label: 'Cancelado', class: 'bg-amber-100 text-amber-700', icon: 'Ban' },
  { status: 'PENDING', label: 'Pendiente', class: 'bg-amber-100 text-amber-700', icon: 'Clock' },
  { status: 'EXPIRED', label: 'Expirado', class: 'bg-red-100 text-red-700', icon: 'Timer' },
  { status: 'ERROR', label: 'Error', class: 'bg-red-100 text-red-700', icon: 'AlertTriangle' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(amount);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

function methodOption(value: string): SelectOption {
  const labels: Record<string, string> = { CARD: 'Tarjeta', YAPE: 'Yape', PLIN: 'Plin' };
  return { value, label: labels[value] ?? value };
}

export function PagosPageClient() {
  const [filters, setFilters] = useState<TransactionFilters>({ page: 1, per_page: 10 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  const { data, pagination, loading, error, refetch, stats } = useTransactions(filters);
  const { data: detailData } = useTransactionDetail(selectedId);
  const selectedTransaction = detailData?.data ?? null;

  const updateFilter = useCallback(<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  }, []);

  const kpiItems = useMemo(() => {
    if (!stats.data) return [];
    const s = stats.data;
    return [
      { label: 'Hoy', value: formatCurrency(s.today.totalAmount), icon: 'BarChart3', color: 'sky' as const, description: `${s.today.totalTransactions} transacciones` },
      { label: 'Esta Semana', value: formatCurrency(s.thisWeek.totalAmount), icon: 'TrendingUp', color: 'emerald' as const, description: `${s.thisWeek.totalTransactions} transacciones` },
      { label: 'Este Mes', value: formatCurrency(s.thisMonth.totalAmount), icon: 'Calendar', color: 'indigo' as const, description: `${s.thisMonth.totalTransactions} transacciones` },
      { label: 'Tasa de Éxito', value: `${s.overall.successRate}%`, icon: 'CheckCircle', color: 'emerald' as const, description: `${s.overall.successful} exitosas · ${s.overall.failed} fallidas` },
    ];
  }, [stats.data]);

  const methodItems = useMemo(() => {
    if (!stats.data) return [];
    const s = stats.data;
    return [
      { label: 'Tarjeta (CARD)', value: `${s.methodDistribution.find(m => m.method === 'CARD')?.count ?? 0}`, icon: 'CreditCard', color: 'violet' as const },
      { label: 'Yape', value: `${s.methodDistribution.find(m => m.method === 'YAPE')?.count ?? 0}`, icon: 'Smartphone', color: 'amber' as const },
      { label: 'Plin', value: `${s.methodDistribution.find(m => m.method === 'PLIN')?.count ?? 0}`, icon: 'Wallet', color: 'rose' as const },
    ];
  }, [stats.data]);

  const columns: Column<Transaction>[] = useMemo(() => [
    {
      key: 'orderDate',
      header: 'Orden / Fecha',
      className: 'bg-sky-50/40 dark:bg-[var(--bg-muted)]',
      render: (tx) => (
        <div>
          <p className="font-mono text-sm font-bold">{tx.orderNumber}</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{formatDate(tx.createdAt)}</p>
        </div>
      ),
    },
    {
      key: 'customerStores',
      header: 'Cliente / Tienda',
      className: 'bg-emerald-50/40 dark:bg-[var(--bg-muted)]',
      render: (tx) => (
        <div>
          <p className="text-sm font-semibold">{tx.customer?.name ?? '—'}</p>
          <p className="text-[11px] text-[var(--text-secondary)] truncate max-w-[180px]">
            {tx.stores.map(s => s.name).join(', ')}
          </p>
        </div>
      ),
    },
    {
      key: 'tipo',
      header: 'Tipo',
      className: 'bg-cyan-50/40 dark:bg-[var(--bg-muted)]',
      render: (tx) => {
        const config: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
          producto: { label: 'Producto', icon: <Package className="w-3 h-3" />, color: 'text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-500/10' },
          servicio: { label: 'Servicio', icon: <Briefcase className="w-3 h-3" />, color: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10' },
          ambos: { label: 'Ambos', icon: <Layers className="w-3 h-3" />, color: 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/10' },
        };
        const c = config[tx.tipo] ?? config.producto;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${c.color}`}>
            {c.icon}{c.label}
          </span>
        );
      },
    },
    {
      key: 'totalMethod',
      header: 'Total / Método',
      align: 'right',
      className: 'bg-violet-50/40 dark:bg-[var(--bg-muted)]',
      render: (tx) => {
        const method = tx.paymentMethod ?? '—';
        return (
          <div className="text-right">
            <p className="text-sm font-bold">{formatCurrency(tx.total)}</p>
            <p className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider mt-0.5">
              {method === 'CARD' && <CreditCard className="w-2.5 h-2.5" />}
              {method === 'YAPE' && <Smartphone className="w-2.5 h-2.5" />}
              {method === 'PLIN' && <Wallet className="w-2.5 h-2.5" />}
              {method === 'CARD' && tx.cardBrand ? `${tx.cardBrand} ****${tx.cardLast4}` : method}
            </p>
          </div>
        );
      },
    },
    {
      key: 'comision',
      header: 'Comisión',
      align: 'right',
      className: 'bg-rose-50/40 dark:bg-[var(--bg-muted)]',
      render: (tx) => (
        <div className="text-right">
          <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatCurrency(tx.commissionTotal)}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">
            Base: {formatCurrency(tx.commissionAmount)} + IGV
          </p>
        </div>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Pago',
      className: 'bg-amber-50/40 dark:bg-[var(--bg-muted)]',
      render: (tx) => (
        <BaseStatusBadge
          status={tx.paymentStatus}
          mappings={PAYMENT_STATUS_MAP}
          variant="small"
          showIcon
        />
      ),
    },
    {
      key: 'transactionStatus',
      header: 'Transacción',
      className: 'bg-rose-50/40 dark:bg-[var(--bg-muted)]',
      render: (tx) => {
        if (!tx.transactionStatus) return <span className="text-xs text-[var(--text-secondary)]">—</span>;
        return (
          <BaseStatusBadge
            status={tx.transactionStatus}
            mappings={TRANSACTION_STATUS_MAP}
            variant="small"
            showIcon
          />
        );
      },
    },
  ], []);

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
      <ModuleHeader
        title="Gestión de Pagos"
        subtitle="Monitoreo de transacciones Izipay — CARD, YAPE y PLIN"
        icon="CreditCard"
        actions={
          <BaseButton variant="outline" size="sm" leftIcon="RotateCw" onClick={() => refetch()}>
            Actualizar
          </BaseButton>
        }
      />

      <BaseStatsGrid stats={kpiItems} columns={4} isLoading={stats.loading} />

      <div className="space-y-3">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
          Distribución por método de pago
        </p>
        <BaseStatsGrid stats={methodItems} columns={3} isLoading={stats.loading} />
      </div>

      <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-subtle)] space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <BaseInputField
              name="search"
              placeholder="Buscar orden o cliente..."
              icon="Search"
              value={searchInput}
              onChange={(v) => {
                setSearchInput(v);
                updateFilter('search', v || undefined);
              }}
            />
          </div>
          <BaseInputField
            name="date_from"
            type="date"
            label="Desde"
            value={filters.date_from ?? ''}
            onChange={(v) => updateFilter('date_from', v || undefined)}
          />
          <BaseInputField
            name="date_to"
            type="date"
            label="Hasta"
            value={filters.date_to ?? ''}
            onChange={(v) => updateFilter('date_to', v || undefined)}
          />
          <BaseSelectField
            name="payment_status"
            label="Estado Pago"
            value={filters.payment_status ?? ''}
            onChange={(v) => updateFilter('payment_status', v || undefined)}
            options={[
              { value: '', label: 'Todos' },
              ...PAYMENT_STATUS_MAP.map(m => ({ value: m.status, label: m.label })),
            ]}
          />
          <BaseSelectField
            name="transaction_status"
            label="Estado Trans."
            value={filters.transaction_status ?? ''}
            onChange={(v) => updateFilter('transaction_status', v || undefined)}
            options={[
              { value: '', label: 'Todos' },
              ...TRANSACTION_STATUS_MAP.map(m => ({ value: m.status, label: m.label })),
            ]}
          />
          <BaseSelectField
            name="payment_method"
            label="Método"
            value={filters.payment_method ?? ''}
            onChange={(v) => updateFilter('payment_method', v || undefined)}
            options={[
              { value: '', label: 'Todos' },
              methodOption('CARD'),
              methodOption('YAPE'),
              methodOption('PLIN'),
            ]}
          />
          {(filters.search || filters.date_from || filters.date_to || filters.payment_status || filters.transaction_status || filters.payment_method) && (
            <BaseButton
              variant="ghost"
              size="sm"
              leftIcon="X"
              onClick={() => {
                setSearchInput('');
                setFilters({ page: 1, per_page: 10 });
              }}
            >
              Limpiar
            </BaseButton>
          )}
        </div>
      </div>

      <DataTable<Transaction>
        data={data}
        columns={columns}
        loading={loading}
        error={error}
        onRetry={refetch}
        onRowClick={(tx) => setSelectedId(tx.id)}
        keyField="id"
        countLabel="transacciones"
        emptyIcon="CreditCard"
        emptyTitle="Sin transacciones"
        emptyDescription="No se encontraron transacciones con los filtros aplicados."
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
            Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
          </span>
          <div className="flex items-center gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              leftIcon="ArrowLeft"
              disabled={pagination.page <= 1}
              onClick={() => goToPage(pagination.page - 1)}
            >
              Anterior
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              rightIcon="ArrowRight"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => goToPage(pagination.page + 1)}
            >
              Siguiente
            </BaseButton>
          </div>
        </div>
      )}

      <BaseModal
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Detalle de Transacción"
        subtitle={selectedTransaction ? `Orden ${selectedTransaction.orderNumber}` : ''}
        size="2xl"
      >
        {selectedTransaction && <TransactionDetail transaction={selectedTransaction} />}
      </BaseModal>
    </div>
  );
}

function TransactionDetail({ transaction }: { transaction: Transaction }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Orden</p>
          <p className="text-sm font-bold font-mono">{transaction.orderNumber}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Fecha</p>
          <p className="text-sm">{formatDate(transaction.createdAt)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Cliente</p>
          <p className="text-sm font-semibold">{transaction.customer?.name ?? '—'}</p>
          <p className="text-xs text-[var(--text-secondary)]">{transaction.customer?.email ?? ''}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Total</p>
          <p className="text-lg font-black text-[var(--brand-sky)]">{formatCurrency(transaction.total)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Tipo</p>
          <p className="text-sm font-bold capitalize">{transaction.tipo === 'ambos' ? 'Producto y Servicio' : transaction.tipo}</p>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Productos</p>
        <div className="space-y-2">
          {transaction.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2 px-4 bg-[var(--bg-secondary)] rounded-2xl">
              <div>
                <p className="text-xs font-semibold">{item.productName}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">
                  {item.quantity} x {formatCurrency(item.unitPrice)}
                  {item.store && <span> — {item.store.name}</span>}
                </p>
              </div>
              <p className="text-xs font-bold">{formatCurrency(item.lineTotal)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Información de Pago Izipay</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Método</span>
            <span className="text-xs font-semibold uppercase">{transaction.paymentMethod ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Tarjeta</span>
            <span className="text-xs font-semibold">
              {transaction.cardBrand ? `${transaction.cardBrand} ****${transaction.cardLast4}` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Izipay Order ID</span>
            <span className="text-xs font-mono">{transaction.izipayOrderId ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Estado Transacción</span>
            <BaseStatusBadge
              status={transaction.transactionStatus ?? '—'}
              mappings={TRANSACTION_STATUS_MAP}
              variant="small"
              showIcon
            />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Estado Pago</span>
            <BaseStatusBadge
              status={transaction.paymentStatus}
              mappings={PAYMENT_STATUS_MAP}
              variant="small"
              showIcon
            />
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Desglose</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Subtotal</span>
            <span>{formatCurrency(transaction.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Envío</span>
            <span>{formatCurrency(transaction.shippingCost)}</span>
          </div>
          {transaction.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Descuento</span>
              <span className="text-[var(--color-success)]">-{formatCurrency(transaction.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-1 border-t border-[var(--border-subtle)]">
            <span>Total</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--border-subtle)] pt-4">
        <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">Comisión Lyrium</p>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Base</span>
            <span>{formatCurrency(transaction.commissionAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">IGV (18%)</span>
            <span>{formatCurrency(transaction.commissionIgv)}</span>
          </div>
          <div className="flex justify-between font-bold pt-1 border-t border-[var(--border-subtle)] text-rose-600 dark:text-rose-400">
            <span>Total Comisión</span>
            <span>{formatCurrency(transaction.commissionTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
