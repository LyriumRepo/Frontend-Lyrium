'use client';

import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Order, OrderType } from '@/features/seller/sales/types';
import { formatCurrency, formatDate } from '@/shared/lib/utils/formatters';
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
  sucursal: { label: 'Recojo en sucursal', icon: 'Store' },
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
  processing: { class: 'bg-blue-100 text-blue-700' },
  shipped: { class: 'bg-purple-100 text-purple-700' },
  delivered: { class: 'bg-emerald-100 text-emerald-700' },
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

interface SalesTableProps {
  data: Order[];
  loading: boolean;
  onViewDetail: (order: Order) => void;
  onConfirm: (orderId: string) => void;
  onCancel: (orderId: string) => void;
  isAdvancing: boolean;
  isCancelling: boolean;
}

export default function SalesTable({
  data,
  loading,
  onViewDetail,
  onConfirm,
  onCancel,
  isAdvancing,
  isCancelling,
}: SalesTableProps) {
  const columns = React.useMemo(
    () => [
      columnHelper.accessor('orderNumber', {
        header: 'Orden',
        cell: (info) => (
          <span className="text-xs font-black text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-100 font-mono tracking-tight whitespace-nowrap truncate max-w-[160px] block">
            {info.getValue()}
          </span>
        ),
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
        header: 'Resumen',
        cell: (info) => (
          <span className="text-xs font-semibold text-[var(--text-secondary)] truncate max-w-[200px] block">
            {info.getValue() || '-'}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'deliveryType',
        header: 'Tipo de atención / entrega',
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
        header: 'Estado',
        cell: (info) => {
          const order = info.row.original;
          const config = ORDER_STATUS_CONFIG[order.estado] ?? { class: 'bg-gray-100 text-gray-600' };
          return <StatusBadge label={order.statusLabel} className={config.class} />;
        },
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="text-sm font-black text-[var(--text-primary)] tracking-tight">
            {formatCurrency(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('fecha', {
        header: 'Fecha',
        cell: (info) => (
          <span className="text-xs font-bold text-[var(--text-secondary)] whitespace-nowrap">
            {formatDate(info.getValue())}
          </span>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Acciones',
        cell: (info) => {
          const order = info.row.original;
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
        },
      }),
    ],
    [onViewDetail, onConfirm, onCancel, isAdvancing, isCancelling]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)]">
                {['Orden', 'Tipo', 'Cliente', 'Resumen', 'Atención / Entrega', 'Cant.', 'Pago', 'Estado', 'Total', 'Fecha', 'Acciones'].map((h) => (
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
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full py-24 flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-subtle)] shadow-sm">
        <div className="relative inline-block">
          <div className="w-24 h-24 bg-[var(--bg-muted)] rounded-[2.5rem] flex items-center justify-center shadow-inner border border-[var(--border-subtle)] text-[var(--text-secondary)]">
            <Icon name="Inbox" className="w-12 h-12 stroke-[1.5px]" />
          </div>
        </div>
        <div className="space-y-3 mt-8">
          <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
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
    <div className="bg-[var(--bg-card)] rounded-3xl overflow-hidden border border-[var(--border-subtle)] shadow-sm transition-all hover:shadow-md">
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
    </div>
  );
}
