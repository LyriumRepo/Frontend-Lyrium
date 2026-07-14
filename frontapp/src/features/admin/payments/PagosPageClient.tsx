'use client';

import React, { useState, useMemo, useCallback } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import BaseInputField from '@/components/ui/BaseInputField';
import BaseSelectField from '@/components/ui/BaseSelectField';
import BaseDatePicker from '@/components/ui/BaseDatePicker';
interface SelectOption { value: string; label: string; }
import Skeleton from '@/components/ui/Skeleton';
import BaseStatusBadge from '@/components/ui/BaseStatusBadge';
import BaseModal from '@/components/ui/BaseModal';
import DataTable, { type Column } from '@/components/ui/DataTable';
import { useTransactions, useTransactionDetail } from '@/features/admin/payments/hooks/useTransactions';
import type { Transaction, TransactionFilters } from '@/features/admin/payments/types/transactions';
import { CreditCard, Wallet, Smartphone, BarChart3, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import Icon from '@/components/ui/Icon';
import { exportPaymentsToExcel, exportPaymentsToPdf } from './export';

interface StatusMapping { status: string; label: string; class: string; icon?: string; }

const PAYMENT_STATUS_MAP: StatusMapping[] = [
  { status: 'paid', label: 'Pagado', class: 'bg-[var(--color-success)]/15 text-[var(--color-success)]', icon: 'CheckCircle' },
  { status: 'pending', label: 'Pendiente', class: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]', icon: 'Clock' },
  { status: 'failed', label: 'Fallido', class: 'bg-[var(--color-error)]/15 text-[var(--color-error)]', icon: 'XCircle' },
  { status: 'refunded', label: 'Reembolsado', class: 'bg-[var(--color-info)]/15 text-[var(--color-info)]', icon: 'Undo2' },
];

const TRANSACTION_STATUS_MAP: StatusMapping[] = [
  { status: 'AUTHORISED', label: 'Autorizado', class: 'bg-[var(--color-success)]/15 text-[var(--color-success)]', icon: 'CheckCircle' },
  { status: 'CAPTURED', label: 'Capturado', class: 'bg-[var(--color-success)]/15 text-[var(--color-success)]', icon: 'CheckCircle' },
  { status: 'REFUSED', label: 'Rechazado', class: 'bg-[var(--color-error)]/15 text-[var(--color-error)]', icon: 'XCircle' },
  { status: 'CANCELLED', label: 'Cancelado', class: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]', icon: 'Ban' },
  { status: 'PENDING', label: 'Pendiente', class: 'bg-[var(--color-warning)]/15 text-[var(--color-warning)]', icon: 'Clock' },
  { status: 'EXPIRED', label: 'Expirado', class: 'bg-[var(--color-error)]/15 text-[var(--color-error)]', icon: 'Timer' },
  { status: 'ERROR', label: 'Error', class: 'bg-[var(--color-error)]/15 text-[var(--color-error)]', icon: 'AlertTriangle' },
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
      { label: 'Tarjeta (CARD)', value: `${s.methodDistribution.find(m => m.method === 'CARD')?.count ?? 0}`, icon: 'CreditCard', color: 'sky' as const },
      { label: 'Yape', value: `${s.methodDistribution.find(m => m.method === 'YAPE')?.count ?? 0}`, icon: 'Smartphone', color: 'emerald' as const },
      { label: 'Plin', value: `${s.methodDistribution.find(m => m.method === 'PLIN')?.count ?? 0}`, icon: 'Wallet', color: 'indigo' as const },
    ];
  }, [stats.data]);

  const columns: Column<Transaction>[] = useMemo(() => [
    {
      key: 'orderDate',
      header: 'Orden / Fecha',
      className: 'bg-sky-50/40 dark:bg-sky-500/5',
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
      className: 'bg-[var(--color-success)]/5',
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
      key: 'totalMethod',
      header: 'Total / Método',
      align: 'right',
      className: 'bg-violet-50/40 dark:bg-violet-500/5',
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
      key: 'paymentStatus',
      header: 'Pago',
      className: 'bg-[var(--color-warning)]/5',
      render: (tx) => (
        <BaseStatusBadge
          status={tx.paymentStatus}
          mappings={PAYMENT_STATUS_MAP}
        />
      ),
    },
    {
      key: 'transactionStatus',
      header: 'Transacción',
      className: 'bg-[var(--color-error)]/5',
      render: (tx) => {
        if (!tx.transactionStatus) return <span className="text-xs text-[var(--text-secondary)]">—</span>;
        return (
          <BaseStatusBadge
            status={tx.transactionStatus}
            mappings={TRANSACTION_STATUS_MAP}
          />
        );
      },
    },
  ], []);

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  return (
    <div className="px-4 sm:px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
      <ModuleHeader
        title="Gestión de Pagos"
        subtitle="Monitoreo de transacciones Izipay — CARD, YAPE y PLIN"
        icon="CreditCard"
      />

      {/* KPI Cards — TreasuryModule style */}
      {stats.loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={`kpi-skel-${i}`} className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
              <Skeleton className="h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiItems.map((kpi) => {
            const borderMap: Record<string, string> = {
              sky: 'border-[var(--color-info)]',
              emerald: 'border-[var(--color-success)]',
              indigo: 'border-[var(--icons-green)]',
              amber: 'border-[var(--color-success)]',
              rose: 'border-[var(--color-error)]',
              violet: 'border-[var(--color-info)]',
            };
            const bgMap: Record<string, string> = {
              sky: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
              emerald: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
              indigo: 'bg-[var(--icons-green)]/10 text-[var(--icons-green)]',
              amber: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
              rose: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
              violet: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
            };
            const iconMap: Record<string, React.ReactNode> = {
              BarChart3: <BarChart3 className="w-8 h-8" />,
              TrendingUp: <TrendingUp className="w-8 h-8" />,
              Calendar: <Calendar className="w-8 h-8" />,
              CheckCircle: <CheckCircle className="w-8 h-8" />,
            };
            return (
              <div
                key={kpi.label}
                className={`bg-[var(--bg-card)] p-6 border-l-4 ${borderMap[kpi.color] || borderMap.sky} transition-all hover:scale-[1.02] rounded-2xl shadow-sm`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-3 ${bgMap[kpi.color] || bgMap.sky} rounded-2xl`}>
                    {iconMap[kpi.icon] || <TrendingUp className="w-8 h-8" />}
                  </div>
                  <span className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{kpi.value}</span>
                </div>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-2">{kpi.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Method Distribution — same card style */}
      {methodItems.length > 0 && (
        <div className="space-y-3">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">
            Distribución por método de pago
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {methodItems.map((m) => {
              const borderMap: Record<string, string> = {
                sky: 'border-[var(--color-info)]',
                emerald: 'border-[var(--color-success)]',
                indigo: 'border-[var(--icons-green)]',
              };
              const bgMap: Record<string, string> = {
                sky: 'bg-[var(--color-info)]/10 text-[var(--color-info)]',
                emerald: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
                indigo: 'bg-[var(--icons-green)]/10 text-[var(--icons-green)]',
              };
              const iconMap: Record<string, React.ReactNode> = {
                CreditCard: <CreditCard className="w-8 h-8" />,
                Smartphone: <Smartphone className="w-8 h-8" />,
                Wallet: <Wallet className="w-8 h-8" />,
              };
              return (
                <div
                  key={m.label}
                  className={`bg-[var(--bg-card)] p-6 border-l-4 ${borderMap[m.color] || 'border-[var(--border-subtle)]'} transition-all hover:scale-[1.02] rounded-2xl shadow-sm`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-3 ${bgMap[m.color] || 'bg-[var(--bg-secondary)]'} rounded-2xl`}>
                      {iconMap[m.icon] || <CreditCard className="w-8 h-8" />}
                    </div>
                    <span className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{m.value}</span>
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mt-2">{m.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
              <Icon name="Search" className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">
              Filtros de Búsqueda
            </h3>
          </div>
          <BaseButton
            variant="primary"
            size="sm"
            leftIcon="RotateCcw"
            onClick={() => {
              setSearchInput('');
              setFilters({ page: 1, per_page: 10 });
            }}
          >
            <span className="hidden sm:inline">Limpiar</span>
          </BaseButton>
        </div>

        {/* Búsqueda + toggle filtros */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 min-w-0">
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
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(v => !v)}
            className={`flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-2xl text-xs font-bold border transition-all shrink-0 ${
              showAdvancedFilters || filters.date_from || filters.date_to || filters.payment_status || filters.transaction_status || filters.payment_method
                ? 'bg-[var(--bg-secondary)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                : 'bg-transparent border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
            }`}
          >
            <Icon name="SlidersHorizontal" className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {(filters.date_from || filters.date_to || filters.payment_status || filters.transaction_status || filters.payment_method) && (
              <span className="w-4 h-4 rounded-full bg-[var(--color-info)] text-white text-[9px] font-black flex items-center justify-center leading-none">
                {[filters.date_from, filters.date_to, filters.payment_status, filters.transaction_status, filters.payment_method].filter(Boolean).length}
              </span>
            )}
            <Icon name={showAdvancedFilters ? 'ChevronUp' : 'ChevronDown'} className="w-3 h-3" />
          </button>
        </div>

        {/* Filtros secundarios — colapsables en móvil, siempre visibles en md+ */}
        <div className={`${showAdvancedFilters ? 'grid' : 'hidden'} md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-[var(--border-subtle)]`}>
          <div>
            <BaseDatePicker
              label="Desde"
              value={filters.date_from ?? ''}
              onChange={(v) => updateFilter('date_from', v || undefined)}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div>
            <BaseDatePicker
              label="Hasta"
              value={filters.date_to ?? ''}
              onChange={(v) => updateFilter('date_to', v || undefined)}
              placeholder="dd/mm/aaaa"
            />
          </div>
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
        </div>

        {/* Acciones — Actualizar, Excel, PDF dentro del card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-subtle)]">
          <BaseButton variant="primary" size="sm" leftIcon="RotateCw" onClick={() => refetch()} className="justify-center">
            Actualizar
          </BaseButton>
          <button
            onClick={() => exportPaymentsToExcel(data).catch((err) => {
              console.error(err);
              alert(err instanceof Error ? err.message : 'Error al exportar a Excel');
            })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm"
          >
            <Icon name="FileSpreadsheet" className="w-4 h-4" />
            Excel
          </button>
          <button
            onClick={() => exportPaymentsToPdf(data).catch((err) => {
              console.error(err);
              alert(err instanceof Error ? err.message : 'Error al exportar a PDF');
            })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm"
          >
            <Icon name="FileText" className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* ── Vista mobile: cards ── */}
      <div className="sm:hidden bg-[var(--bg-card)] rounded-2xl shadow-sm border border-[var(--border-subtle)] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[var(--border-subtle)]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-40 rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="py-10 text-center text-[13px] text-[var(--color-error)]">Error al cargar transacciones.</p>
        ) : data.length === 0 ? (
          <p className="py-10 text-center text-[13px] text-[var(--text-muted)]">No se encontraron transacciones.</p>
        ) : (
          <>
            <p className="px-4 pt-3 pb-2 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              {data.length} transacciones
            </p>
            <div className="divide-y divide-[var(--border-subtle)]">
              {data.map((tx) => {
                const method = tx.paymentMethod ?? '—';
                const methodIcon = method === 'CARD'
                  ? <CreditCard className="w-3.5 h-3.5" />
                  : method === 'YAPE'
                  ? <Smartphone className="w-3.5 h-3.5" />
                  : method === 'PLIN'
                  ? <Wallet className="w-3.5 h-3.5" />
                  : null;
                const payBadge = PAYMENT_STATUS_MAP.find(m => m.status === tx.paymentStatus);
                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-start gap-3 hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer active:opacity-70"
                    onClick={() => setSelectedId(tx.id)}
                  >
                    <div className="w-10 h-10 rounded-2xl bg-[var(--color-info)]/10 text-[var(--color-info)] flex items-center justify-center shrink-0">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-xs font-bold text-[var(--text-primary)] truncate">{tx.orderNumber}</p>
                        <span className="text-sm font-black text-[var(--text-primary)] shrink-0">{formatCurrency(tx.total)}</span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{tx.customer?.name ?? '—'}</p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{tx.stores.map(s => s.name).join(', ')}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                          {methodIcon}
                          {method === 'CARD' && tx.cardBrand ? `${tx.cardBrand} ****${tx.cardLast4}` : method}
                        </span>
                        {payBadge && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${payBadge.class}`}>
                            {payBadge.label}
                          </span>
                        )}
                        <span className="text-[10px] text-[var(--text-muted)] ml-auto">{formatDate(tx.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Vista desktop: tabla ── */}
      <div className="hidden sm:block">
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
      </div>

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
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
          />
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Estado Pago</span>
            <BaseStatusBadge
              status={transaction.paymentStatus}
              mappings={PAYMENT_STATUS_MAP}
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
    </div>
  );
}
