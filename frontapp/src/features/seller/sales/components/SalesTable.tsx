'use client';

import React, { useState, useMemo, memo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Order, OrderType } from '@/features/seller/sales/types';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import Icon from '@/components/ui/Icon';

const columnHelper = createColumnHelper<Order>();

const ORDER_TYPE_CONFIG: Record<OrderType, { label: string; icon: string; class: string }> = {
  product: { label: 'Producto', icon: 'Package', class: 'bg-blue-100 text-blue-700' },
  service: { label: 'Servicio', icon: 'Briefcase', class: 'bg-purple-100 text-purple-700' },
  mixed: { label: 'Mixto', icon: 'LayoutGrid', class: 'bg-amber-100 text-amber-700' },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; icon: string; class: string }> = {
  pendiente: { label: 'Pendiente', icon: 'Clock', class: 'bg-amber-100 text-amber-700' },
  verificado: { label: 'Verificado', icon: 'CheckCircle', class: 'bg-emerald-100 text-emerald-700' },
};

const DELIVERY_LABELS: Record<string, { label: string; icon: string }> = {
  domicilio: { label: 'Entrega a domicilio', icon: 'Truck' },
  agencia: { label: 'Recojo en agencia', icon: 'Package' },
  retiro_tienda: { label: 'Retiro en tienda', icon: 'Store' },
};

const SERVICE_MODALITY_LABELS: Record<string, { label: string; icon: string }> = {
  home: { label: 'Atención a domicilio', icon: 'Home' },
  domicilio: { label: 'Atención a domicilio', icon: 'Home' },
  in_person: { label: 'Atención en sede', icon: 'Building' },
  presencial: { label: 'Atención en sede', icon: 'Building' },
};

function getProductDelivery(order: Order): { label: string; icon: string } | null {
  if (order.orderType === 'product' || order.orderType === 'mixed') {
    const key = order.tipo_envio || 'domicilio';
    if (DELIVERY_LABELS[key]) return DELIVERY_LABELS[key];
  }
  return null;
}

function getServiceAttention(order: Order): { label: string; icon: string } | null {
  if (order.orderType !== 'service' && order.orderType !== 'mixed') return null;
  const key = order.serviceItems?.[0]?.modality ?? null;
  if (key && SERVICE_MODALITY_LABELS[key]) return SERVICE_MODALITY_LABELS[key];
  return { label: 'Atención no definida', icon: 'Home' };
}

function DeliveryBadge({ order }: { order: Order }) {
  const product = getProductDelivery(order);
  const service = getServiceAttention(order);

  if (order.orderType === 'mixed') {
    const p = product ?? { label: 'Tipo no definido', icon: 'ShoppingBag' };
    const s = service ?? { label: 'Atención no definida', icon: 'Home' };
    return (
      <div className="flex flex-col gap-0.5">
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded-md whitespace-nowrap">
          <Icon name={p.icon} className="w-3 h-3" />
          Producto: {p.label}
        </span>
        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md whitespace-nowrap">
          <Icon name={s.icon} className="w-3 h-3" />
          Servicio: {s.label}
        </span>
      </div>
    );
  }

  const config = product ?? service;
  if (!config) return <span className="text-xs text-[var(--text-muted)]">—</span>;

  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-700 bg-gray-50/80 px-2 py-1 rounded-md border border-gray-100/60 whitespace-nowrap">
      <Icon name={config.icon} className="w-3.5 h-3.5 text-gray-500" />
      {config.label}
    </span>
  );
}

const ORDER_STATUS_CONFIG: Record<string, { class: string }> = {
  pending_seller: { class: 'bg-amber-100 text-amber-700' },
  confirmed: { class: 'bg-sky-100 text-sky-700' },
  on_the_way: { class: 'bg-orange-100 text-orange-700' },
  processing: { class: 'bg-blue-100 text-blue-700' },
  shipped: { class: 'bg-purple-100 text-purple-700' },
  delivered: { class: 'bg-emerald-100 text-emerald-700' },
  completed: { class: 'bg-emerald-100 text-emerald-700' },
  cancelled: { class: 'bg-red-100 text-red-700' },
};

function StatusBadge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider ${className}`}>
      {label}
    </span>
  );
}

function TypeBadge({ orderType }: { orderType: OrderType }) {
  const config = ORDER_TYPE_CONFIG[orderType] ?? ORDER_TYPE_CONFIG.product;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider ${config.class}`}>
      <Icon name={config.icon} className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

function PaymentBadge({ status, statusLabel }: { status: string; statusLabel: string }) {
  const config = PAYMENT_STATUS_CONFIG[status];
  if (!config) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider bg-gray-100 text-gray-600">
        {statusLabel || status}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-extrabold uppercase tracking-wider ${config.class}`}>
      <Icon name={config.icon} className="w-2.5 h-2.5" />
      {config.label}
    </span>
  );
}

function ActionsCell({
  order,
  onViewDetail,
  onConfirm,
  onCancel,
  isAdvancing,
  isCancelling,
}: {
  order: Order;
  onViewDetail: (order: Order) => void;
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  isAdvancing: boolean;
  isCancelling: boolean;
}) {
  const canConfirm = order.estado === 'pending_seller' && !isAdvancing;
  const canCancel = order.estado === 'pending_seller' && !isCancelling;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => { e.stopPropagation(); onViewDetail(order); }}
        className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-sky-600 hover:border-sky-200 transition-all shadow-sm active:scale-90 flex items-center justify-center"
        title="Ver detalle"
      >
        <Icon name="Eye" className="w-4 h-4" />
      </button>
      {canConfirm && (
        <button
          onClick={(e) => { e.stopPropagation(); onConfirm(order.id); }}
          className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-emerald-600 hover:border-emerald-200 transition-all shadow-sm active:scale-90 flex items-center justify-center"
          title="Confirmar"
        >
          <Icon name="CheckCircle" className="w-4 h-4" />
        </button>
      )}
      {canCancel && (
        <button
          onClick={(e) => { e.stopPropagation(); onCancel(order.id); }}
          className="w-8 h-8 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-red-600 hover:border-red-200 transition-all shadow-sm active:scale-90 flex items-center justify-center"
          title="Cancelar"
        >
          <Icon name="XCircle" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

const SKELETON_WIDTHS = ['55%', '40%', '65%', '75%', '60%', '30%', '45%', '50%', '35%', '45%', '40%'];

function SkeletonRows() {
  return (
    <tbody className="divide-y divide-[var(--border-subtle)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {SKELETON_WIDTHS.map((w, j) => (
            <td key={j} className="px-6 py-5">
              <div className="h-4 bg-[var(--bg-secondary)] rounded-md" style={{ width: w }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ─── Mobile accordion card ───────────────────────────────────────────────────

interface MobileOrderCardProps {
  order: Order;
  onViewDetail: (order: Order) => void;
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  isAdvancing: boolean;
  isCancelling: boolean;
}

function MobileOrderCard({ order, onViewDetail, onConfirm, onCancel, isAdvancing, isCancelling }: MobileOrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusConfig = ORDER_STATUS_CONFIG[order.estado] ?? { class: 'bg-gray-100 text-gray-600' };
  const canConfirm = order.estado === 'pending_seller' && !isAdvancing;
  const canCancel  = order.estado === 'pending_seller' && !isCancelling;

  return (
    <div className={`rounded-2xl border bg-[var(--bg-card)] overflow-hidden transition-colors ${
      expanded ? 'border-sky-400/40' : 'border-[var(--border-subtle)]'
    }`}>

      {/* ── Fila colapsada — siempre visible ── */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-[var(--bg-secondary)]/60 transition-colors"
      >
        {/* Nº Orden + Tipo + Cliente */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[9px] font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md font-mono tracking-tight whitespace-nowrap">
              {order.orderNumber}
            </span>
            <TypeBadge orderType={order.orderType} />
          </div>
          <p className="text-sm font-bold text-[var(--text-primary)] truncate leading-tight">
            {order.cliente}
          </p>
        </div>

        {/* Estado + Total */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge label={order.statusLabel} className={statusConfig.class} />
          <span className="text-sm font-black text-[var(--text-primary)] tracking-tight">
            {formatCurrency(order.total)}
          </span>
        </div>

        <Icon
          name={expanded ? 'ChevronUp' : 'ChevronDown'}
          className="w-4 h-4 flex-shrink-0 text-[var(--text-secondary)]"
        />
      </button>

      {/* ── Panel expandido ── */}
      {expanded && (
        <div className="border-t border-[var(--border-subtle)] px-4 py-3 space-y-3">

          {/* Concepto */}
          {order.itemsSummary && (
            <div className="flex items-start justify-between gap-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] pt-0.5 flex-shrink-0">Concepto</span>
              <span className="text-xs font-semibold text-[var(--text-primary)] text-right leading-snug">{order.itemsSummary}</span>
            </div>
          )}

          {/* Modalidad */}
          <div className="flex items-center justify-between gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex-shrink-0">Modalidad</span>
            <DeliveryBadge order={order} />
          </div>

          {/* Tres datos en fila */}
          <div className="grid grid-cols-3 gap-2 pt-0.5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Cantidad</p>
              <span className="text-sm font-black text-[var(--text-primary)]">{order.unidades}</span>
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Pago</p>
              <PaymentBadge status={order.estado_pago} statusLabel={order.paymentStatusLabel} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">Fecha</p>
              <span className="text-[10px] font-bold text-[var(--text-secondary)] whitespace-nowrap">
                {new Date(order.fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => onViewDetail(order)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-[var(--border-subtle)] text-[11px] font-black text-[var(--text-secondary)] hover:border-sky-500/30 hover:text-sky-500 hover:bg-sky-500/5 transition-colors"
            >
              <Icon name="Eye" className="w-3.5 h-3.5" /> Ver
            </button>
            {canConfirm && (
              <button
                onClick={() => onConfirm(order.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-500/20 text-[11px] font-black text-emerald-600 hover:bg-emerald-500/10 transition-colors"
              >
                <Icon name="CheckCircle" className="w-3.5 h-3.5" /> Confirmar
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(order.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-red-500/20 text-[11px] font-black text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <Icon name="XCircle" className="w-3.5 h-3.5" /> Cancelar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SalesTable ───────────────────────────────────────────────────────────────

interface SalesTableProps {
  data: Order[];
  loading: boolean;
  onViewDetail: (order: Order) => void;
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  isAdvancing: boolean;
  isCancelling: boolean;
}

const PAGE_SIZE = 10;

const SalesTable = memo(function SalesTable({
  data,
  loading,
  onViewDetail,
  onConfirm,
  onCancel,
  isAdvancing,
  isCancelling,
}: SalesTableProps) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);

  const paginatedData = useMemo(
    () => data.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [data, safePage]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('orderNumber', {
        header: 'Número de Orden',
        cell: (info) => (
          <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 font-mono tracking-tight whitespace-nowrap truncate max-w-[160px] block">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('fecha', {
        header: 'Fecha',
        cell: (info) => {
          const d = new Date(info.getValue());
          return (
            <div className="leading-tight">
              <div className="text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">
                {d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
              <div className="text-[10px] text-[var(--text-placeholder)] whitespace-nowrap mt-0.5">
                {d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor('orderType', {
        header: 'Tipo',
        cell: (info) => <TypeBadge orderType={info.getValue()} />,
      }),
      columnHelper.accessor('cliente', {
        header: 'Cliente',
        cell: (info) => (
          <span className="text-sm font-bold text-[var(--text-primary)] truncate max-w-[160px] block">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('itemsSummary', {
        header: 'Concepto',
        cell: (info) => (
          <span className="text-xs font-semibold text-[var(--text-secondary)] truncate max-w-[200px] block">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'deliveryType',
        header: 'Modalidad',
        cell: (info) => <DeliveryBadge order={info.row.original} />,
      }),
      columnHelper.accessor('unidades', {
        header: 'Cant.',
        cell: (info) => (
          <span className="text-sm font-black text-[var(--text-primary)]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('estado_pago', {
        header: 'Pago',
        cell: (info) => {
          const order = info.row.original;
          return <PaymentBadge status={info.getValue()} statusLabel={order.paymentStatusLabel} />;
        },
      }),
      columnHelper.accessor('estado', {
        header: 'Estado de la Orden',
        cell: (info) => {
          const order = info.row.original;
          const config = ORDER_STATUS_CONFIG[order.estado] ?? { class: 'bg-gray-100 text-gray-600' };
          return <StatusBadge label={order.statusLabel} className={config.class} />;
        },
      }),
      columnHelper.accessor((row) => row.sellerSubtotal ?? row.total, {
        id: 'total',
        header: 'Total',
        cell: (info) => (
          <span className="text-sm font-black text-[var(--text-primary)] tracking-tight">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => (
          <ActionsCell
            order={info.row.original}
            onViewDetail={onViewDetail}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isAdvancing={isAdvancing}
            isCancelling={isCancelling}
          />
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <>
        {/* Mobile skeleton */}
        <div className="sm:hidden space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-28 bg-[var(--bg-secondary)] rounded-md" />
                <div className="h-5 w-16 bg-[var(--bg-secondary)] rounded-md" />
              </div>
              <div className="h-4 w-40 bg-[var(--bg-secondary)] rounded-md" />
              <div className="h-4 w-20 bg-[var(--bg-secondary)] rounded-md ml-auto" />
            </div>
          ))}
        </div>

        {/* Desktop skeleton */}
        <div className="hidden sm:block bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-sm">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-secondary)]">
                  {['Número de Orden', 'Tipo', 'Cliente', 'Concepto', 'Modalidad', 'Cant.', 'Pago', 'Estado de la Orden', 'Total', 'Fecha', 'Acciones'].map((h) => (
                    <th key={h} className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <SkeletonRows />
            </table>
          </div>
        </div>
      </>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-16 sm:py-24 flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-card)] rounded-[2rem] sm:rounded-[3rem] border border-[var(--border-subtle)] shadow-sm">
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[var(--bg-muted)] rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-inner border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            <Icon name="Inbox" className="w-10 h-10 sm:w-12 sm:h-12 stroke-[1.5px]" />
          </div>
        </div>
        <div className="space-y-3 mt-6 sm:mt-8">
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tighter">
            No se encontraron pedidos
          </h3>
          <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">
            No hay registros que coincidan con los filtros aplicados actualmente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ══ MÓVIL: accordion cards (sm:hidden) ══════════════════════════════ */}
      <div className="sm:hidden space-y-2">
        {paginatedData.map((order) => (
          <MobileOrderCard
            key={order.id}
            order={order}
            onViewDetail={onViewDetail}
            onConfirm={onConfirm}
            onCancel={onCancel}
            isAdvancing={isAdvancing}
            isCancelling={isCancelling}
          />
        ))}

        {/* Paginación móvil */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1 pt-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">
              {data.length} órdenes · Pág. {safePage + 1}/{totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Icon name="ChevronRight" className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ DESKTOP: tabla completa (hidden sm:block) ════════════════════════ */}
      <div className="hidden sm:block bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-sm transition-all hover:shadow-md">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)]">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      scope="col"
                      className="px-6 py-5 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest border-b border-[var(--border-subtle)] whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group hover:bg-[var(--bg-secondary)] transition-colors cursor-pointer"
                  onClick={() => onViewDetail(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación desktop */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30">
            <span className="text-[11px] font-bold text-[var(--text-secondary)]">
              {data.length} órdenes
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#69BEEB]/30 hover:text-[#5AAFE6] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-1.5 text-[11px] font-bold text-[var(--text-secondary)]">
                Pág. {safePage + 1} de {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={safePage >= totalPages - 1}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#69BEEB]/30 hover:text-[#5AAFE6] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
});

export default SalesTable;