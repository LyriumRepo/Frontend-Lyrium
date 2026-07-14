'use client';

import { useState, useEffect, useCallback } from 'react';
import { useEcho } from '@laravel/echo-react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { Eye, Info } from "lucide-react";
import { orderApi, OrderResource } from '@/shared/lib/api/orderRepository';
import { BaseDatePicker } from '@/components/ui';
import ClientRescheduleModal, { SelectedSpecialist } from './ClientRescheduleModal';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TipoEnvio =
  | 'domicilio'
  | 'agencia'
  | 'retiro_en_tienda'
  | 'atencion_domicilio'
  | 'atencion_sede';

type EstadoPedido =
  | 'validado_vendedor'
  | 'despachado'
  | 'en_transporte'
  | 'en_domicilio'
  | 'listo_recojo_agencia'
  | 'listo_recojo_tienda'
  | 'confirmado_cliente'
  | 'validacion_centro_salud'
  | 'en_camino'
  | 'confirmacion_paciente'
  | 'cancelado';

interface EnvioInfo {
  direccion: string;
  carrier: string;
  tracking: string;
  tracking_url: string;
  branch?: {
    name: string;
    address: string;
    department: string;
    province: string;
    district: string;
    phone: string | null;
    hours: string | null;
  } | null;
}

interface Order {
  id: string;
  originalId: number;
  fecha: string;
  hora: string;
  tienda: string;
  detalle: string;
  total: string;
  estado: EstadoPedido;
  estadoLabel: string;
  tipo: 'productos' | 'servicios';
  tipo_envio?: TipoEnvio;
  currentStep?: number;
  envio?: EnvioInfo;
  imagen?: string;
  /** ISO "YYYY-MM-DD" — scheduled appointment date (services only) */
  fechaCita?: string;
  /** Number of client-initiated reschedules already done (0 or 1) */
  reprogramaciones?: number;
  /** True once the client sent a reschedule request to the health center */
  solicitudEnviada?: boolean;
  paymentMethod?: string | null;
  userEmail?: string | null;
  orderItems?: Array<{
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    storeName?: string;
  }>;
  orderServiceItems?: Array<{
    serviceName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    storeName?: string;
  }>;
  subtotalAmount?: number;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
}

// ─── Config de flujos ─────────────────────────────────────────────────────────

interface FlowStep {
  id: number;
  label: string;
  icon: string;
}

const TRACKING_LABELS: Record<TipoEnvio, string[]> = {
  domicilio: [
    'Tu pedido ha sido validado por el vendedor',
    'Tu pedido ha sido despachado con éxito',
    '¡Tu pedido va en camino!',
    '¡Ya llegamos! Repartidor en tu domicilio',
    '¡Recibido! Confirmamos la entrega de tu pedido',
  ],
  agencia: [
    'Tu pedido ha sido validado por el vendedor',
    'Tu pedido ha sido despachado con éxito',
    '¡Tu pedido va en camino!',
    'Listo para recoger en agencia',
    '¡Recibido! Confirmamos la entrega de tu pedido',
  ],
  retiro_en_tienda: [
    'Tu pedido ha sido validado por el vendedor',
    'Tu pedido está siendo despachado',
    'Listo para recoger en tienda',
    '¡Recibido! Confirmamos la entrega de tu pedido',
  ],
  atencion_domicilio: [
    'Validación del centro de salud',
    '¡El especialista va en camino!',
    'Atención completada',
  ],
  atencion_sede: [
    'Validación del centro de salud',
    'Atención completada',
  ],
};

const FLOW_CONFIG: Record<
  TipoEnvio,
  { label: string; icon: string; color: string; accent: string; steps: FlowStep[] }
> = {
  domicilio: {
    label: 'Entrega a Domicilio',
    icon: 'Home',
    color: 'text-lime-500',
    accent: 'bg-lime-500/10 border-lime-700/20 text-[#bde90d]',
    steps: [
      { id: 1, label: 'Validado', icon: 'CheckSquare' },
      { id: 2, label: 'Despachado', icon: 'Package' },
      { id: 3, label: 'En Transporte', icon: 'Truck' },
      { id: 4, label: 'En Domicilio', icon: 'Home' },
      { id: 5, label: 'Confirmado', icon: 'UserCheck' },
    ],
  },
  agencia: {
    label: 'Recojo en Agencia',
    icon: 'ShieldCheck',
    color: 'text-[#78e69d]',
    accent: 'bg-[#78e69d]/10 border-[#78e69d]/20 text-[#78e69d]',
    steps: [
      { id: 1, label: 'Validado', icon: 'CheckSquare' },
      { id: 2, label: 'Despachado', icon: 'Package' },
      { id: 3, label: 'En Transporte', icon: 'Truck' },
      { id: 4, label: 'Listo Agencia', icon: 'MapPin' },
      { id: 5, label: 'Confirmado', icon: 'UserCheck' },
    ],
  },
  retiro_en_tienda: {
    label: 'Retiro en Tienda',
    icon: 'Store',
    color: 'text-sky-500',
    accent: 'bg-sky-500/10 border-sky-700/20 text-sky-400',
    steps: [
      { id: 1, label: 'Validado', icon: 'CheckSquare' },
      { id: 2, label: 'Despacho', icon: 'Package' },
      { id: 3, label: 'Listo en Tienda', icon: 'Store' },
      { id: 4, label: 'Confirmado', icon: 'UserCheck' },
    ],
  },
  atencion_domicilio: {
    label: 'Atención a Domicilio',
    icon: 'Home',
    color: 'text-lime-500',
    accent: 'bg-lime-500/10 border-lime-700/20 text-[#bde90d]',
    steps: [
      { id: 1, label: 'Validación del Centro de Salud', icon: 'ShieldCheck' },
      { id: 2, label: 'En Camino', icon: 'Truck' },
      { id: 3, label: 'Confirmación del paciente', icon: 'UserCheck' },
    ],
  },
  atencion_sede: {
    label: 'Atención en Sede',
    icon: 'Building2',
    color: 'text-[#59a6cb]',
    accent: 'bg-[#59a6cb]/10 border-[#59a6cb]/20 text-[#59a6cb]',
    steps: [
      { id: 1, label: 'Validación del Centro de Salud', icon: 'ShieldCheck' },
      { id: 2, label: 'Confirmación del paciente', icon: 'UserCheck' },
    ],
  },
};

// ─── Helpers: API → UI mapping ────────────────────────────────────────────────

const STATUS_MAP: Record<string, EstadoPedido> = {
  pending_seller: 'validado_vendedor',
  confirmed: 'despachado',
  processing: 'en_transporte',
  shipped: 'en_domicilio',
  delivered: 'confirmado_cliente',
  cancelled: 'cancelado',
};

const STATUS_LABEL_MAP: Record<string, string> = {
  pending_seller: 'Validado por vendedor',
  confirmed: 'Despachado',
  processing: 'En transporte',
  shipped: 'En domicilio',
  delivered: 'Confirmado por cliente',
  cancelled: 'Cancelado',
};

const STATUS_STEP_MAP: Record<string, number> = {
  pending_seller: 1,
  confirmed: 2,
  processing: 3,
  shipped: 4,
  delivered: 5,
  cancelled: 0,
};

const STATUS_STEP_MAP_RETiro: Record<string, number> = {
  pending_seller: 1,
  confirmed: 2,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
};

function getStatusStep(statusKey: string, tipoEnvio: TipoEnvio): number {
  if (tipoEnvio === 'retiro_en_tienda') {
    return STATUS_STEP_MAP_RETiro[statusKey] ?? 1;
  }
  return STATUS_STEP_MAP[statusKey] ?? 1;
}

function parseDateToDisplay(iso: string): { fecha: string; hora: string } {
  try {
    const d = new Date(iso);
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];
    return {
      fecha: `${d.getDate()} ${meses[d.getMonth()]} ${d.getFullYear()}`,
      hora: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
    };
  } catch {
    return { fecha: iso, hora: '--' };
  }
}

const SHIPPING_TYPE_MAP: Record<string, TipoEnvio> = {
  delivery: 'domicilio',
  pickup: 'retiro_en_tienda',
  service_home: 'atencion_domicilio',
  service_store: 'atencion_sede',
};

function mapOrderResourceToOrder(raw: OrderResource): Order {
  const item = raw as any;
  const createdAt = item.createdAt ?? item.created_at;
  const { fecha, hora } = parseDateToDisplay(createdAt);
  const items = item.items ?? [];
  const serviceItems = item.serviceItems ?? [];
  const itemCount = items.length;
  const serviceItemCount = serviceItems.length;
  const firstItem = items[0];
  const tienda = firstItem?.store?.name ?? firstItem?.store_name ?? item.customer_name ?? 'Tienda';
  const firstImage = firstItem?.product?.image ?? '';
  const detalleParts: string[] = [];
  if (itemCount > 0) detalleParts.push(`${itemCount} ${itemCount === 1 ? 'producto' : 'productos'}`);
  if (serviceItemCount > 0) detalleParts.push(`${serviceItemCount} ${serviceItemCount === 1 ? 'servicio' : 'servicios'}`);
  const detalle = detalleParts.length > 0 ? detalleParts.join(' y ') : 'Sin productos';
  const statusKey = item.status ?? 'pending_seller';
  const shippingTypeRaw = item.shipping?.type;
  const tipoEnvio = shippingTypeRaw ? (SHIPPING_TYPE_MAP[shippingTypeRaw] ?? 'domicilio') : 'domicilio';

  return {
    id: item.orderNumber ?? item.order_number ?? `#ORD-${item.id}`,
    originalId: Number(item.id),
    fecha,
    hora,
    tienda,
    detalle,
    total: `S/ ${Number(item.total).toFixed(2)}`,
    estado: (() => {
      const base = STATUS_MAP[statusKey] ?? 'validado_vendedor';
      if (statusKey === 'shipped') {
        if (tipoEnvio === 'retiro_en_tienda') return 'listo_recojo_tienda';
        if (tipoEnvio === 'agencia') return 'listo_recojo_agencia';
      }
      if (statusKey === 'processing' && tipoEnvio === 'retiro_en_tienda') return 'despachado';
      return base;
    })(),
    estadoLabel: item.statusLabel ?? STATUS_LABEL_MAP[statusKey] ?? statusKey,
    tipo: 'productos',
    tipo_envio: tipoEnvio,
    currentStep: getStatusStep(statusKey, tipoEnvio),
    imagen: firstImage,
    envio: item.shipping
      ? {
          direccion: item.branch
            ? item.branch.name
            : combineAddressParts([item.shipping.address, item.shipping.city]),
          carrier: 'Por determinar',
          tracking: '-',
          tracking_url: '',
          branch: item.branch ? {
            name: item.branch.name,
            address: item.branch.address ?? '',
            department: item.branch.department ?? '',
            province: item.branch.province ?? '',
            district: item.branch.district ?? '',
            phone: item.branch.phone ?? null,
            hours: item.branch.hours ?? null,
          } : null,
        }
      : undefined,
    paymentMethod: item.paymentMethod ?? null,
    userEmail: item.user?.email ?? null,
    orderItems: items.map((i: any) => ({
      productName: i.productName ?? i.product_name ?? '',
      unitPrice: Number(i.unitPrice ?? i.unit_price ?? 0),
      quantity: Number(i.quantity ?? 1),
      lineTotal: Number(i.lineTotal ?? i.line_total ?? 0),
      storeName: i.store?.name ?? '',
    })),
    orderServiceItems: serviceItems.map((i: any) => ({
      serviceName: i.serviceName ?? i.service_name ?? '',
      unitPrice: Number(i.unitPrice ?? i.unit_price ?? 0),
      quantity: Number(i.quantity ?? 1),
      lineTotal: Number(i.lineTotal ?? i.line_total ?? 0),
      storeName: i.storeName ?? i.store_name ?? '',
    })),
    subtotalAmount: Number(item.subtotal ?? 0),
    taxAmount: Number(item.taxAmount ?? item.tax_amount ?? 0),
    shippingCost: Number(item.shippingCost ?? item.shipping_cost ?? 0),
    discountAmount: Number(item.discountAmount ?? item.discount_amount ?? 0),
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusStyles = (estado: EstadoPedido) => {
  switch (estado) {
    case 'validado_vendedor':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'CheckSquare' };
    case 'despachado':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'Package' };
    case 'en_transporte':
      return { bg: 'bg-sky-100', text: 'text-sky-700', icon: 'Truck' };
    case 'en_domicilio':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'Home' };
    case 'listo_recojo_agencia':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'MapPin' };
    case 'listo_recojo_tienda':
      return { bg: 'bg-sky-100', text: 'text-sky-700', icon: 'Store' };
    case 'confirmado_cliente':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: 'CheckCircle' };

    case 'validacion_centro_salud':
      return { bg: 'bg-sky-100', text: 'text-sky-700', icon: 'ShieldCheck' };
    case 'en_camino':
      return { bg: 'bg-blue-100', text: 'text-blue-700', icon: 'Truck' };
    case 'confirmacion_paciente':
      return { bg: 'bg-green-100', text: 'text-green-700', icon: 'CheckCircle' };

    case 'cancelado':
      return { bg: 'bg-red-100', text: 'text-red-700', icon: 'XCircle' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'Clock' };
  }
};

const MONTHS: Record<string, number> = {
  ene: 0, enero: 0, jan: 0, january: 0, feb: 1, febrero: 1, mar: 2, marzo: 2, apr: 3, abril: 3, abr: 3, may: 4, mayo: 4, jun: 5, junio: 5, jul: 6, julio: 6, aug: 7,
  ago: 7, agosto: 7, sep: 8, set: 8, septiembre: 8, oct: 9, octubre: 9, nov: 10, noviembre: 10, dec: 11, dic: 11, diciembre: 11,
};

function parseDisplayDate(dateText: string): Date | null {
  const match = dateText.trim().match(/^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú.]+)\s+(\d{4})$/);
  if (!match) return null;

  const day = Number(match[1]);
  const monthRaw = match[2].toLowerCase().replace('.', '').trim();
  const year = Number(match[3]);
  const month = MONTHS[monthRaw];

  if (Number.isNaN(day) || Number.isNaN(year) || month === undefined) return null;

  return new Date(year, month, day);
}

function getDateBounds(dateValue: string): Date | null {
  if (!dateValue) return null;
  const parsed = new Date(`${dateValue}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function combineAddressParts(parts: (string | null | undefined)[]): string {
  const filtered = parts.filter((p): p is string => !!p);
  return filtered.length > 0 ? filtered.join(', ') : 'Sin dirección';
}

// ─── Sub-componente: Stepper de seguimiento ───────────────────────────────────

// Paleta de progresión para pasos completados: de lima claro → verde profundo
const STEP_COMPLETED_COLORS = [
  { border: 'border-[#bde90d]', shadow: 'shadow-[#bde90d]/40', dot: '#bde90d' },
  { border: 'border-[#6BAF7B]', shadow: 'shadow-[#6BAF7B]/40', dot: '#6BAF7B' },
  { border: 'border-emerald-500', shadow: 'shadow-emerald-400/40', dot: '#10b981' },
  { border: 'border-teal-500',   shadow: 'shadow-teal-400/40',   dot: '#14b8a6' },
];

function OrderTrackingCards({
  tipoEnvio,
  currentStep,
}: {
  tipoEnvio: TipoEnvio;
  currentStep: number;
}) {
  const steps = FLOW_CONFIG[tipoEnvio].steps;
  const activeIndex = Math.min(Math.max(currentStep - 1, 0), steps.length - 1);
  const totalSteps = steps.length;
  const progress = totalSteps > 1
    ? ((activeIndex) / (totalSteps - 1)) * 100
    : 100;

  return (
    <div className="space-y-4 animate-card-entrance">
      <div className="relative flex justify-between items-start pt-2 pb-6">
        {/* Línea base + barra de progreso con gradiente */}
        <div className="absolute top-[20px] sm:top-[28px] left-[5%] right-[5%] h-[3px] bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-full z-0">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-in-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(to right, #bde90d, #6BAF7B, #2A5A4D)',
            }}
          />
        </div>

        {steps.map((s, i) => {
          const imgSrc = `/imagenes-seguimiento/${i + 1}.png`;
          const isCompleted = i < activeIndex;
          const isActive = i === activeIndex;
          const color = STEP_COMPLETED_COLORS[Math.min(i, STEP_COMPLETED_COLORS.length - 1)];

          return (
            <div
              key={s.id}
              className="flex flex-col items-center relative z-10 gap-1 sm:gap-2"
              style={{ width: `${100 / totalSteps}%` }}
            >
              {/* Círculo del paso */}
              <div className="relative">
                <div
                  className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full border-2 sm:border-[3px] overflow-hidden transition-all duration-700 flex-shrink-0 flex items-center justify-center bg-white dark:bg-[var(--bg-card)]
                    ${isCompleted
                      ? `${color.border} shadow-lg ${color.shadow}`
                      : isActive
                        ? 'border-sky-500 dark:border-[var(--turquesa-500)] shadow-lg shadow-sky-400/30 dark:shadow-[var(--turquesa-500)]/30 scale-110 ring-4 ring-sky-200/50 dark:ring-[var(--turquesa-500)]/20'
                        : 'border-gray-200 dark:border-[var(--border-subtle)] opacity-50'
                    }`}
                >
                  <img
                    src={imgSrc}
                    alt={`Paso ${s.id}`}
                    className={`w-[90%] h-[90%] rounded-full object-cover transition-all duration-700 ${!isCompleted && !isActive ? 'grayscale opacity-60' : ''}`}
                  />
                </div>

                {/* Badge de completado */}
                {isCompleted && (
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-[var(--bg-card)]"
                    style={{ backgroundColor: color.dot }}
                  >
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Anillo pulsante del paso activo */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full border-2 border-sky-400 dark:border-[var(--turquesa-500)] animate-ping opacity-25 pointer-events-none" />
                )}
              </div>

              {/* Etiqueta del paso */}
              <p className={`text-center text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-tight px-0.5 transition-all duration-700
                ${isActive
                  ? 'text-sky-600 dark:text-[var(--icons-green)]'
                  : isCompleted
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-gray-300 dark:text-[var(--border-subtle)]'
                }`}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-componente: Card de tracking ────────────────────────────────────────

function TrackingCard({ envio, tipoEnvio }: { envio: EnvioInfo; tipoEnvio: TipoEnvio }) {
  const flow = FLOW_CONFIG[tipoEnvio];
  const hasTracking = envio.tracking && envio.tracking !== '-';
  const hasUrl = !!envio.tracking_url;
  const isPickup = tipoEnvio === 'retiro_en_tienda' && envio.branch;

  return (
    <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] space-y-4">
      <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">
        {isPickup ? 'Sucursal de Retiro' : 'Información de Envío'}
      </h5>

      {isPickup ? (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white dark:bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-emerald-500 border border-gray-100 dark:border-[var(--border-subtle)] flex-shrink-0 shadow-sm">
              <Icon name="Store" className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                Sucursal
              </p>
              <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">{envio.branch!.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pl-[52px]">
            {envio.branch!.address && (
              <div className="col-span-2">
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Dirección</p>
                <p className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)]">{envio.branch!.address}</p>
              </div>
            )}
            {envio.branch!.district && (
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Distrito</p>
                <p className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)]">{envio.branch!.district}</p>
              </div>
            )}
            {envio.branch!.province && (
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Provincia</p>
                <p className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)]">{envio.branch!.province}</p>
              </div>
            )}
            {envio.branch!.phone && (
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Teléfono</p>
                <p className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)]">{envio.branch!.phone}</p>
              </div>
            )}
            {envio.branch!.hours && (
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Horario</p>
                <p className="text-xs font-bold text-gray-600 dark:text-[var(--text-secondary)]">{envio.branch!.hours}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white dark:bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)] border border-gray-100 dark:border-[var(--border-subtle)] flex-shrink-0 shadow-sm">
            <Icon name="MapPin" className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
              {tipoEnvio === 'domicilio'
                ? 'Dirección de entrega'
                : tipoEnvio === 'retiro_en_tienda'
                  ? 'Sucursal de retiro'
                  : 'Ciudad / Agencia'}
            </p>
            <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">{envio.direccion}</p>
          </div>
        </div>
      )}

      {!isPickup && (
        <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-white dark:bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)] border border-gray-100 dark:border-[var(--border-subtle)] flex-shrink-0 shadow-sm">
              <Icon name="Truck" className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
                Operador / Número de seguimiento
              </p>
              {hasTracking ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">{envio.carrier}</span>
                  <span className="text-[10px] font-black text-gray-400">·</span>
                  <span className="font-mono text-[11px] font-black text-sky-600 dark:text-[var(--icons-green)] tracking-wider">
                    {envio.tracking}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-bold text-sky-500 dark:text-[var(--icons-green)]">Pendiente de despacho</span>
              )}
            </div>
          </div>
      )}

      {!isPickup && hasTracking && hasUrl && (
        <a
          href={envio.tracking_url}
          target="_blank"
          rel="noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-colors ${flow.accent} hover:opacity-80`}
        >
          <Icon name="ExternalLink" className="w-3.5 h-3.5" />
          Rastrear mi pedido en {envio.carrier}
        </a>
      )}

      {isPickup && (
        <div className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
          <Icon name="Store" className="w-3.5 h-3.5" />
          Recoger en sucursal — Sin costo de envío
        </div>
      )}
    </div>
  );
}

// ─── Generación de Boleta de Compra (mismo diseño que el paso 4 del checkout) ──

const TOP_IMG =
  'https://fv5-5.files.fm/thumb_show.php?i=msu7t9u4py&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';
const BOTTOM_IMG =
  'https://fv5-8.files.fm/thumb_show.php?i=8dn38fae9w&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';

function loadImageAsDataUrl(url: string): Promise<string> {
  return fetch(url)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onloadend = () => res(reader.result as string);
          reader.readAsDataURL(blob);
        }),
    );
}

async function downloadBoletaCompra(order: Order): Promise<void> {
  const items = order.orderItems ?? [];
  const itemsHtml = items
    .map(
      (i) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 16px; font-weight: 500; color: #1f2937;">${i.productName}</td>
      <td style="padding: 12px 16px; text-align: center; color: #374151;">${i.quantity}</td>
      <td style="padding: 12px 16px; text-align: right; font-weight: 700; color: #1f2937;">S/ ${i.lineTotal.toFixed(2)}</td>
    </tr>`,
    )
    .join('');

  const totalQty = items.reduce((a, i) => a + i.quantity, 0);
  const subtotalVal = items.reduce((s, i) => s + i.lineTotal, 0);
  const shippingVal = order.shippingCost ?? 0;
  const discountVal = order.discountAmount ?? 0;
  // Usar total del backend (viene como "S/ 49.80"); fallback: subtotal + envío - descuento
  const parsedTotal = parseFloat(String(order.total ?? '').replace(/[^0-9.]/g, ''));
  const finalTotal = !isNaN(parsedTotal) && parsedTotal > 0
    ? parsedTotal
    : (subtotalVal + shippingVal - discountVal);
  // IGV extraído de los precios (informativo, ya incluido en subtotal)
  const igvInfo = Math.round((subtotalVal - subtotalVal / 1.18) * 100) / 100;

  const breakdownRows = `
    <tr style="border-top: 2px solid #e5e7eb;">
      <td style="padding: 10px 16px; font-size: 13px; color: #374151;">Subtotal</td>
      <td style="padding: 10px 16px;"></td>
      <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #1f2937;">S/ ${subtotalVal.toFixed(2)}</td>
    </tr>
    ${shippingVal > 0 ? `
    <tr>
      <td style="padding: 10px 16px; font-size: 13px; color: #374151;">Envío</td>
      <td style="padding: 10px 16px;"></td>
      <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #1f2937;">S/ ${shippingVal.toFixed(2)}</td>
    </tr>` : ''}
    ${discountVal > 0 ? `
    <tr>
      <td style="padding: 10px 16px; font-size: 13px; color: #374151;">Descuento</td>
      <td style="padding: 10px 16px;"></td>
      <td style="padding: 10px 16px; text-align: right; font-weight: 700; color: #dc2626;">-S/ ${discountVal.toFixed(2)}</td>
    </tr>` : ''}
    <tr>
      <td colspan="3" style="padding: 4px 16px; font-size: 10px; color: #9ca3af; font-style: italic;">
        Precios incluyen IGV (18%): S/ ${igvInfo.toFixed(2)}
      </td>
    </tr>`;

  const fbImg = 'https://fv5-4.files.fm/thumb_show.php?i=726g592gj8&view&v=1&PHPSESSID=53ba53ad2030b8e5aae3cf48c4ba83f8e248150a';
  const igImg = 'https://cdn-icons-png.flaticon.com/128/4138/4138124.png';
  const waImg = 'https://cdn-icons-png.flaticon.com/128/15713/15713434.png';

  const html = `<!DOCTYPE html>
<html>
<head><title>Boleta de Compra - ${order.id}</title>
<style>
  @media print {
    body * { visibility: hidden; }
    #boleta-wrapper, #boleta-wrapper * { visibility: visible; }
    #boleta-wrapper { position: absolute; left: 0; top: 0; width: 100%; }
    .no-print { display: none !important; }
    #boleta-top-img, #boleta-bottom-img { display: block !important; width: 100% !important; height: auto !important; }
    .print-turquoise { background-color: #0EA5E9 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color: white !important; }
    #boleta-print-area { break-inside: avoid; page-break-inside: avoid; }
    @page { size: portrait; margin: 0mm; }
  }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background: #f3f4f6; }
</style>
</head>
<body>
<div id="boleta-wrapper" style="max-width: 672px; margin: 0 auto; padding: 16px;">
  <div id="boleta-print-area" style="max-width: 672px; margin: 0 auto;">
    <div class="no-print" style="text-align: right; margin-bottom: 16px;">
      <button onclick="window.print()" style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 16px; background: #0EA5E9; color: white; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; border: none; cursor: pointer;">
        Descargar Boleta
      </button>
    </div>

    <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
      <img id="boleta-top-img" src="${TOP_IMG}" alt="Encabezado boleta" style="width: 100%; height: auto; display: block;" />

      <div style="padding: 8px 24px 16px; margin-top: -8px; position: relative; z-index: 10;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr class="print-turquoise" style="background: #0EA5E9; color: white;">
              <th style="text-align: left; padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Producto</th>
              <th style="text-align: center; padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Cantidad</th>
              <th style="text-align: right; padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            ${breakdownRows}
            <tr class="print-turquoise" style="background: #0EA5E9; color: white;">
              <td style="padding: 12px 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; font-size: 12px;">TOTAL</td>
              <td style="padding: 12px 16px; text-align: center; font-weight: 900;">${totalQty}</td>
              <td style="padding: 12px 16px; text-align: right; font-weight: 900; font-size: 16px;">S/ ${finalTotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style="padding: 0 24px 24px; display: flex; flex-direction: column; align-items: center; gap: 16px;">
        <div style="text-align: center; font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;">
          Orden N° ${order.id}
        </div>

        <div style="display: flex; align-items: center; justify-content: center; border-top: 1.5px solid #d1f0eb; margin-top: 8px; padding-top: 24px; padding-bottom: 8px; width: 100%;">
          <a href="https://www.facebook.com" target="_blank" style="padding: 0 16px;">
            <img src="${fbImg}" width="48" height="48" alt="Facebook" style="border-radius: 50%;" />
          </a>
          <div style="width: 1px; height: 54px; background: #c8e8e4;"></div>
          <a href="https://www.instagram.com/lyrium_biomarketplace/" target="_blank" style="padding: 0 16px;">
            <img src="${igImg}" width="48" height="48" alt="Instagram" style="border-radius: 10px;" />
          </a>
          <div style="width: 1px; height: 54px; background: #c8e8e4;"></div>
          <a href="https://wa.me/51937093420" target="_blank" style="padding: 0 16px;">
            <img src="${waImg}" width="48" height="48" alt="WhatsApp" />
          </a>
        </div>
      </div>

      <img id="boleta-bottom-img" src="${BOTTOM_IMG}" alt="Pie boleta" style="width: 100%; height: auto; display: block;" />
    </div>
  </div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CustomerOrdersPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFiltered] = useState<Order[]>([]);
  const [selectedOrder, setSelected] = useState<Order | null>(null);
  const [showPaymentBreakdown, setShowPaymentBreakdown] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLegendModal, setShowLegendModal] = useState(false);
  const [isLegendClosing, setIsLegendClosing] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const handleCloseLegend = useCallback(() => {
    if (isLegendClosing) return;
    setIsLegendClosing(true);
    setTimeout(() => {
      setShowLegendModal(false);
      setIsLegendClosing(false);
    }, 250);
  }, [isLegendClosing]);

  const loadOrders = useCallback(async () => {
    try {
      setFetching(true);
      setFetchError('');
      const result = await orderApi.list(1);
      // Los pedidos solo-servicio ya se gestionan en "Reservas" — no deben duplicarse aquí.
      const productOrders = (result.data ?? []).filter(
        (o) => ((o as any).items?.length ?? 0) > 0,
      );
      const mapped = productOrders.map(mapOrderResourceToOrder);
      setOrders(mapped);
      setFiltered(mapped);
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
      const msg = err instanceof TypeError ? 'No pudimos conectar con el servidor. Verifica que el backend esté corriendo.' : 'No pudimos cargar tus pedidos. Intenta nuevamente.';
      setFetchError(msg);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      loadOrders();
    }
  }, [loading, isAuthenticated, loadOrders]);

  useEcho<{ order_id: string; status: string; active: boolean }>(
    `user.${user?.id ?? 0}`,
    'OrderStatusChanged',
    (event) => {
      const { order_id, status } = event;

      const applyUpdate = (o: Order): Order => {
        if (o.originalId !== Number(order_id)) return o;
        const newEstado = status === 'processing' && o.tipo_envio === 'retiro_en_tienda'
          ? 'despachado'
          : STATUS_MAP[status] ?? 'validado_vendedor';
        return {
          ...o,
          estado: newEstado,
          estadoLabel: STATUS_LABEL_MAP[status] ?? status,
          currentStep: getStatusStep(status, o.tipo_envio ?? 'domicilio'),
        };
      };

      setOrders(prev => prev.map(applyUpdate));
      setFiltered(prev => prev.map(applyUpdate));
      setSelected(prev => prev && prev.originalId === Number(order_id)
        ? applyUpdate(prev)
        : prev
      );
    },
    [user]
  );

  const [filters, setFilters] = useState({
    categoria: 'productos',
    empresa: '',
    fechaInicio: '',
    fechaFin: '',
    tipo_envio: '',
    estado: '',
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/login');
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    let result = [...orders];

    result = result.filter((o) => o.tipo === filters.categoria);

    if (filters.empresa) {
      result = result.filter((o) => o.tienda.toLowerCase().includes(filters.empresa.toLowerCase()));
    }

    if (filters.tipo_envio) {
      result = result.filter((o) => o.tipo_envio === filters.tipo_envio);
    }

    if (filters.estado) {
      result = result.filter((o) => o.estado === filters.estado);
    }

    const startDate = getDateBounds(filters.fechaInicio);
    const endDate = getDateBounds(filters.fechaFin);

    if (startDate || endDate) {
      result = result.filter((o) => {
        const orderDate = parseDisplayDate(o.fecha);
        if (!orderDate) return false;

        const normalizedOrderDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate());

        if (startDate) {
          const normalizedStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
          if (normalizedOrderDate < normalizedStart) return false;
        }

        if (endDate) {
          const normalizedEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
          if (normalizedOrderDate > normalizedEnd) return false;
        }

        return true;
      });
    }

    setFiltered(result);
  }, [filters, orders]);

  const openDetails = (order: Order) => {
    setSelected(order);
    setShowPaymentBreakdown(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelected(null), 300);
  };

  // ─── Reschedule logic ─────────────────────────────────────────────────────

  function canShowRescheduleButton(order: Order): boolean {
    if (order.tipo !== 'servicios') return false;
    const validTypes: TipoEnvio[] = ['atencion_sede', 'atencion_domicilio'];
    return (
      !!order.tipo_envio &&
      validTypes.includes(order.tipo_envio as TipoEnvio) &&
      order.estado === 'validacion_centro_salud'
    );
  }

  const handleRescheduleConfirm = (orderId: string, newDateISO: string, specialist: SelectedSpecialist) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? { ...o, reprogramaciones: (o.reprogramaciones ?? 0) + 1, fechaCita: newDateISO }
        : o
    );
    setOrders(updated);
    const updatedOrder = updated.find((o) => o.id === orderId);
    if (updatedOrder && selectedOrder?.id === orderId) setSelected(updatedOrder);
    setShowRescheduleModal(false);
  };

  const handleSendRequest = (orderId: string) => {
    const updated = orders.map((o) =>
      o.id === orderId ? { ...o, solicitudEnviada: true } : o
    );
    setOrders(updated);
    const updatedOrder = updated.find((o) => o.id === orderId);
    if (updatedOrder && selectedOrder?.id === orderId) setSelected(updatedOrder);
    setShowRescheduleModal(false);
  };

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
          <Icon name="AlertCircle" className="w-10 h-10 text-red-500" />
        </div>
        <p className="text-lg font-bold text-gray-800 dark:text-[var(--text-primary)]">{fetchError}</p>
        <button
          onClick={loadOrders}
          className="px-6 py-3 rounded-xl bg-sky-500 dark:bg-[var(--brand-green)] text-white font-bold text-sm hover:bg-sky-600 dark:hover:bg-[var(--brand-green-hover)] transition-all"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const selectClass =
    'w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-secondary)] p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 transition-all duration-300 cursor-pointer';
  const shippingOptions =
    filters.categoria === 'productos'
      ? [
        { value: 'domicilio', label: 'Entrega a domicilio' },
        { value: 'agencia', label: 'Recojo en agencia' },
        { value: 'retiro_en_tienda', label: 'Retiro en tienda' },
      ]
      : [
        { value: 'atencion_domicilio', label: 'Atención a domicilio' },
        { value: 'atencion_sede', label: 'Atención en sede' },
      ];

  const statusOptions: Record<TipoEnvio, { value: EstadoPedido; label: string }[]> = {
    domicilio: [
      { value: 'validado_vendedor', label: 'Validado por vendedor' },
      { value: 'despachado', label: 'Despachado' },
      { value: 'en_transporte', label: 'En transporte' },
      { value: 'en_domicilio', label: 'En domicilio' },
      { value: 'confirmado_cliente', label: 'Confirmado por cliente' },
    ],
    agencia: [
      { value: 'validado_vendedor', label: 'Validado por vendedor' },
      { value: 'despachado', label: 'Despachado' },
      { value: 'en_transporte', label: 'En transporte' },
      { value: 'listo_recojo_agencia', label: 'Listo para recojo en agencia' },
      { value: 'confirmado_cliente', label: 'Confirmado por cliente' },
    ],
    retiro_en_tienda: [
      { value: 'validado_vendedor', label: 'Validado por vendedor' },
      { value: 'despachado', label: 'Despachado' },
      { value: 'en_transporte', label: 'En transporte' },
      { value: 'listo_recojo_tienda', label: 'Listo para recoger en tienda' },
      { value: 'confirmado_cliente', label: 'Confirmado por cliente' },
    ],
    atencion_domicilio: [
      { value: 'validacion_centro_salud', label: 'Validación del Centro de Salud' },
      { value: 'en_camino', label: 'En camino' },
      { value: 'confirmacion_paciente', label: 'Confirmación del paciente' },
    ],
    atencion_sede: [
      { value: 'validacion_centro_salud', label: 'Validación del Centro de Salud' },
      { value: 'confirmacion_paciente', label: 'Confirmación del paciente' },
    ],
  };

  const selectedStatusOptions = filters.tipo_envio ? statusOptions[filters.tipo_envio as TipoEnvio] ?? [] : [];

  return (
    <div className="space-y-8 animate-fadeIn">
      <ModuleHeader
        title="Mis Pedidos"
        subtitle="Revisa el estado e historial completo de tus compras en Lyrium"
        icon="Package"
      />

      <div className="bg-white dark:bg-[var(--bg-secondary)] p-4 sm:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] rounded-2xl flex items-center justify-center shadow-lg">
              <Icon name="Search" className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)]">
              Filtros de Búsqueda
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setShowLegendModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 dark:bg-[var(--bg-muted)] text-sky-600 dark:text-[var(--icons-green)] font-black text-[10px] uppercase tracking-widest border border-sky-100 dark:border-[var(--border-subtle)] hover:bg-sky-100 dark:hover:bg-[#1b2b24] transition-colors"
          >
            <Info className="w-4 h-4" />
            Leyenda
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
              Tienda
            </label>
            <select
              value={filters.empresa}
              onChange={(e) => setFilters({ ...filters, empresa: e.target.value })}
              className={selectClass}
            >
              <option value="">Todos</option>
              {Array.from(new Set(orders.map(o => o.tienda).filter(Boolean))).sort().map(tienda => (
                <option key={tienda} value={tienda}>{tienda}</option>
              ))}
            </select>
          </div>

          <BaseDatePicker
            label="Desde"
            value={filters.fechaInicio}
            onChange={(v) => setFilters({ ...filters, fechaInicio: v })}
            placeholder="Seleccionar fecha"
          />

          <BaseDatePicker
            label="Hasta"
            value={filters.fechaFin}
            onChange={(v) => setFilters({ ...filters, fechaFin: v })}
            placeholder="Seleccionar fecha"
          />

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
              Tipo de envío
            </label>
            <select
              value={filters.tipo_envio}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  tipo_envio: e.target.value,
                  estado: '',
                })
              }
              className={selectClass}
            >
              <option value="">Todos</option>
              {shippingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
              Estado
            </label>
            <select
              disabled={!filters.tipo_envio}
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className={`${selectClass} ${!filters.tipo_envio ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {!filters.tipo_envio ? 'Seleccione un tipo de envío' : 'Todos los estados'}
              </option>
              {selectedStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>


      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-4 sm:p-8 flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
          <div className="flex items-center gap-5 text-white relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
              <Icon name="Package" className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter leading-none">Mis Pedidos</h3>
              <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1">Historial Completo</p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 flex-wrap justify-end">
            <span className="px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
              {filteredOrders.length} Pedidos
            </span>

            <select
              value={filters.categoria}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  categoria: e.target.value as 'productos' | 'servicios',
                  tipo_envio: '',
                  estado: '',
                })
              }
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-2 outline-none"
            >
              <option value="productos" className="text-black">
                Productos
              </option>
              <option value="servicios" className="text-black">
                Servicios
              </option>
            </select>
          </div>
        </div>

        <div className="p-4 sm:p-8 overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 dark:bg-[var(--bg-muted)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Package" className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-gray-800 dark:text-[var(--text-primary)] mb-2">
                No se encontraron registros
              </h3>
              <p className="text-sm text-gray-500 dark:text-[var(--text-muted)]">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <>
            <table className="hidden md:table w-full">
              <thead>
                <tr className="border-b-2 border-gray-100 dark:border-[var(--border-subtle)]">
                  {['ID Pedido', 'Fecha', 'Hora', 'Tienda', 'Detalle', 'Total', 'Tipo Envío', 'Estado', 'Acciones'].map((h) => (
                    <th
                      key={h}
                      className="text-left py-4 px-4 text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const statusStyles = getStatusStyles(order.estado);
                  const tipoConfig = order.tipo_envio ? FLOW_CONFIG[order.tipo_envio] : null;

                  return (
                    <tr key={order.id} className="border-b border-gray-50 dark:border-[var(--border-subtle)] hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors">
                      <td className="py-4 px-4">
                        <span className="text-sm font-black text-sky-600 dark:text-[var(--icons-green)]">{order.id}</span>
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-700 dark:text-[var(--text-primary)]">{order.fecha}</td>
                      <td className="py-4 px-4 font-bold text-gray-700 dark:text-[var(--text-primary)]">{order.hora}</td>
                      <td className="py-4 px-4 font-bold text-gray-800 dark:text-[var(--text-primary)]">
                        {order.tienda.length > 5 ? (
                          <div className="relative group w-[50px]">
                            <span className="block truncate whitespace-nowrap overflow-hidden text-ellipsis">{order.tienda}</span>
                            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
                              {order.tienda}
                              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                          </div>
                        ) : (
                          <span>{order.tienda}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-600 dark:text-[var(--text-muted)]">
                        {order.detalle.length > 5 ? (
                          <div className="relative group w-[50px]">
                            <span className="block truncate whitespace-nowrap overflow-hidden text-ellipsis">{order.detalle}</span>
                            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
                              {order.detalle}
                              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                          </div>
                        ) : (
                          <span>{order.detalle}</span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-[var(--text-primary)]">{order.total}</td>
                      <td className="py-4 px-4">
                        {tipoConfig ? (() => {
                          const servicio = tipoConfig.label
                            .replace('Entrega a ', '')
                            .replace('Recojo en ', '');

                          return servicio.length > 10 ? (
                            <div className="relative group w-[90px]">
                              <span className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-black uppercase border ${tipoConfig.accent} block truncate whitespace-nowrap overflow-hidden text-ellipsis`}>
                                <Icon name={tipoConfig.icon as any} className="w-3 h-3 shrink-0" />
                                <span className="truncate">{servicio}</span>
                              </span>

                              <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
                                {servicio}
                                <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                              </div>
                            </div>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-black uppercase border ${tipoConfig.accent}`}>
                              <Icon name={tipoConfig.icon as any} className="w-3 h-3" />
                              {servicio}
                            </span>
                          );
                        })() : (
                          <span className="text-[10px] font-bold text-gray-400">Servicio</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {order.estadoLabel.length > 5 ? (
                          <div className="relative group w-[90px]">
                            <span className={`flex items-center gap-1 block truncate whitespace-nowrap overflow-hidden text-ellipsis px-2 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text} text-[10px] font-black uppercase tracking-wider`}>
                              <Icon name={statusStyles.icon as any} className="w-3 h-3 shrink-0" />
                              <span className="block truncate">{order.estadoLabel}</span>
                            </span>

                            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden -translate-x-1/2 whitespace-nowrap rounded-xl bg-black px-3 py-2 text-xs font-bold text-white shadow-lg group-hover:block">
                              {order.estadoLabel}
                              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-black" />
                            </div>
                          </div>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text} text-[10px] font-black uppercase tracking-wider`}>
                            <Icon name={statusStyles.icon as any} className="w-3 h-3" />
                            {order.estadoLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => openDetails(order)}
                            className="px-2 py-2 rounded-2xl bg-sky-50 dark:bg-[var(--brand-green)] text-sky-600 dark:text-white hover:bg-sky-100 dark:hover:bg-[var(--brand-green-hover)] border border-sky-200 dark:border-[var(--border-subtle)] transition-colors flex items-center justify-center"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="block md:hidden space-y-4">
              {filteredOrders.map((order) => {
                const statusStyles = getStatusStyles(order.estado);
                const tipoConfig = order.tipo_envio ? FLOW_CONFIG[order.tipo_envio] : null;
                const servicio = tipoConfig
                  ? tipoConfig.label.replace('Entrega a ', '').replace('Recojo en ', '')
                  : null;

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)] p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2 mb-3 flex-wrap">
                      <div className="min-w-0 max-w-full break-words">
                        <span className="text-sm font-black text-sky-600 dark:text-[var(--icons-green)] break-all">{order.id}</span>
                        <p className="text-[11px] font-bold text-gray-400 dark:text-[var(--text-muted)] mt-0.5">
                          {order.fecha} · {order.hora}
                        </p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${statusStyles.bg} ${statusStyles.text} text-[9px] font-black uppercase tracking-wider shrink-0 whitespace-nowrap`}>
                        <Icon name={statusStyles.icon as any} className="w-3 h-3" />
                        {order.estadoLabel}
                      </span>
                    </div>

                    <div className="space-y-1.5 mb-3">
                      <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{order.tienda}</p>
                      <p className="text-xs font-bold text-gray-500 dark:text-[var(--text-muted)]">{order.detalle}</p>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-50 dark:border-[var(--border-subtle)]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-gray-900 dark:text-[var(--text-primary)]">{order.total}</span>
                        {tipoConfig ? (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-xl text-[9px] font-black uppercase border ${tipoConfig.accent}`}>
                            <Icon name={tipoConfig.icon as any} className="w-3 h-3" />
                            {servicio}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400">Servicio</span>
                        )}
                      </div>

                      <button
                        onClick={() => openDetails(order)}
                        className="px-3 py-2 rounded-2xl bg-sky-50 dark:bg-[var(--brand-green)] text-sky-600 dark:text-white hover:bg-sky-100 dark:hover:bg-[var(--brand-green-hover)] border border-sky-200 dark:border-[var(--border-subtle)] transition-colors flex items-center gap-1.5 shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-wide">Ver</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            </>
          )}
        </div>
      </div>

      {(showLegendModal || isLegendClosing) && (
        <div
          className={`fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex justify-center items-center p-4 lg:p-6 ${isLegendClosing ? 'animate-fade-out-overlay' : 'animate-fadeIn'}`}
          onClick={handleCloseLegend}
        >
          <div
            className={`bg-white dark:bg-[var(--bg-secondary)] w-full max-w-2xl md:max-w-xl lg:max-w-2xl max-h-[80vh] rounded-[2.5rem] overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col ${isLegendClosing ? 'animate-scale-out' : 'animate-scaleIn'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-300 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-6 text-white relative flex-shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                    <Icon name="BookOpen" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter leading-none">Leyenda</h3>
                    <p className="text-[9px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1">
                      Tipos de envío y estados
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCloseLegend}
                  className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all"
                >
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 lg:p-8 overflow-y-auto space-y-8">
              <section className="space-y-4">
                <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                  Tipo de envíos para productos
                </h4>

                <div className="grid gap-4">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">1. Entrega a domicilio</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Si deseas que tu pedido llegue hasta la puerta de tu casa.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">2. Recojo en agencia</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Si deseas recoger tu pedido en la agencia del operador logístico designado por la tienda correspondiente.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">3. Retiro en tienda</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Si deseas recoger tu pedido directamente en la sucursal de la tienda.
                    </p>
                  </div>

                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                  Tipo de envíos para servicio
                </h4>

                <div className="grid gap-4">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">1. Atención a domicilio</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Si deseas que el especialista asignado para el servicio acuda a tu domicilio.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">2. Atención en sede</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Si deseas acudir presencialmente a recibir tu servicio.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                  Estados
                </h4>

                <div className="grid gap-4">
                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Validado por vendedor o centro de salud</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      El vendedor o centro de salud validó su pedido.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Despachado</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Su pedido de un producto terminó su preparación.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">En transporte o en camino</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Su pedido de un producto o servicio ya ha sido enviado.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Listo en domicilio</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Su pedido de un producto está en su domicilio y espera su confirmación.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Listo para recojo</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Su pedido de producto está listo para que lo recoja en agencia logística.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Confirmación cliente/paciente</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Ya sea su pedido un producto o servicio, este espera su confirmación para finalizarlo.
                    </p>
                  </div>
                </div>
              </section>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCloseLegend}
                  className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-[var(--bg-muted)] text-slate-700 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-[#2A3F33] transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showModal && selectedOrder && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[60] flex justify-center items-center p-4 lg:p-6 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] w-full md:max-w-xl lg:max-w-[700px] max-h-[80vh] rounded-[2.5rem] overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col transition-all duration-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-300 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-6 text-white relative flex-shrink-0">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                    <Icon name="Receipt" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tighter leading-none">Detalles del Pedido</h3>
                    <p className="text-[9px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1">Información detallada</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all"
                >
                  <Icon name="X" className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 lg:p-8 space-y-6 overflow-y-auto flex-1">
              <div className="p-8 bg-sky-50 dark:bg-[var(--bg-muted)]/50 rounded-[2.5rem] border border-sky-100/50 flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-white dark:bg-[var(--bg-secondary)] rounded-[1.5rem] flex items-center justify-center shadow-lg border border-sky-50">
                  <Icon name="Store" className="w-10 h-10 text-sky-600 dark:text-[var(--icons-green)]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-sky-400 dark:text-[var(--icons-green)] uppercase tracking-widest mb-1">Establecimiento</p>
                  <h4 className="text-2xl font-black text-gray-800 dark:text-[var(--text-primary)] tracking-tighter">
                    {selectedOrder.tienda}
                  </h4>
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verificado por Lyrium</span>
                  </div>
                </div>
                <div
                  className={`px-5 py-2.5 rounded-2xl text-white ${selectedOrder.estado === 'confirmado_cliente' || selectedOrder.estado === 'confirmacion_paciente'
                    ? 'bg-gradient-to-r from-green-400 to-sky-500'
                    : selectedOrder.estado === 'cancelado'
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : selectedOrder.estado === 'en_transporte' || selectedOrder.estado === 'en_camino'
                        ? 'bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)]'
                        : selectedOrder.estado === 'despachado' || selectedOrder.estado === 'validado_vendedor' || selectedOrder.estado === 'validacion_centro_salud'
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500'
                    }`}
                >
                  <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">Estado</p>
                  <p className="text-xs font-black uppercase tracking-tighter">{selectedOrder.estadoLabel}</p>
                </div>
              </div>

              {selectedOrder.tipo_envio && selectedOrder.currentStep !== undefined && (
                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between mb-5">
                    <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">
                      Seguimiento del Pedido
                    </h5>
                    {canShowRescheduleButton(selectedOrder) && (
                      <button
                        onClick={() => setShowRescheduleModal(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-[var(--bg-muted)] border border-sky-200 dark:border-[var(--border-subtle)] text-sky-600 dark:text-[var(--icons-green)] text-[9px] font-black uppercase tracking-widest hover:bg-sky-100 dark:hover:bg-[#1b2b24] transition-colors"
                      >
                        <Icon name="CalendarClock" className="w-3.5 h-3.5" />
                        Reprogramar cita
                      </button>
                    )}
                  </div>
                  <OrderTrackingCards tipoEnvio={selectedOrder.tipo_envio} currentStep={selectedOrder.currentStep} />
                  {/* Info badge: reprogramaciones restantes */}
                  {canShowRescheduleButton(selectedOrder) && (
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)]">
                      <Icon
                        name={(selectedOrder.reprogramaciones ?? 0) >= 1 ? 'AlertCircle' : 'Info'}
                        className={`w-3.5 h-3.5 flex-shrink-0 ${(selectedOrder.reprogramaciones ?? 0) >= 1 ? 'text-sky-500 dark:text-[var(--icons-green)]' : 'text-sky-500 dark:text-[var(--icons-green)]'}`}
                      />
                      <p className="text-[9px] font-bold text-gray-500 dark:text-[var(--text-muted)]">
                        {selectedOrder.solicitudEnviada
                          ? 'Solicitud de reprogramación enviada al centro de salud.'
                          : (selectedOrder.reprogramaciones ?? 0) >= 1
                            ? 'Límite de reprogramaciones alcanzado. Puede enviar una solicitud al centro de salud.'
                            : `Reprogramaciones disponibles: ${1 - (selectedOrder.reprogramaciones ?? 0)} de 1`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedOrder.tipo === 'productos' && selectedOrder.tipo_envio && selectedOrder.envio && (
                <TrackingCard envio={selectedOrder.envio} tipoEnvio={selectedOrder.tipo_envio} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center shadow-sm text-sky-500 dark:text-[var(--icons-green)] border border-gray-100 dark:border-[var(--border-subtle)]">
                    <Icon name="Calendar" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Fecha de Emisión</p>
                    <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">{selectedOrder.fecha}</p>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-[var(--bg-secondary)] rounded-2xl flex items-center justify-center shadow-sm text-sky-500 dark:text-[var(--icons-green)] border border-gray-100 dark:border-[var(--border-subtle)]">
                    <Icon name="FileText" className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">ID de Transacción</p>
                    <p className="text-sm font-black text-sky-600 dark:text-[var(--icons-green)]">{selectedOrder.id}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <h5 className="text-xs font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">Resumen de Pago</h5>
                  <div className="h-px flex-1 mx-4 bg-gray-100 dark:bg-[var(--border-subtle)]" />
                </div>
                <div className="p-8 bg-white dark:bg-[var(--bg-secondary)] rounded-[3rem] border border-gray-100 dark:border-[var(--border-subtle)] shadow-xl space-y-5">
                  <button
                    type="button"
                    onClick={() => setShowPaymentBreakdown(v => !v)}
                    className="w-full flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-sky-50 dark:bg-[var(--bg-muted)] rounded-xl flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)]">
                        <Icon name="Package" className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{selectedOrder.detalle}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subtotal Bruto</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-700 dark:text-[var(--text-primary)]">{selectedOrder.total}</span>
                      <Icon
                        name={showPaymentBreakdown ? 'ChevronUp' : 'ChevronDown'}
                        className="w-4 h-4 text-gray-400"
                      />
                    </div>
                  </button>

                  {showPaymentBreakdown && (
                    <div className="px-3 pb-1 -mt-2 space-y-1.5">
                      {(selectedOrder.orderItems ?? []).map((it, idx) => (
                        <div key={`prod-${idx}`} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                            {it.productName} <span className="text-gray-400">×{it.quantity}</span>
                          </span>
                          <span className="font-mono font-bold text-gray-600 dark:text-gray-300">
                            S/ {it.lineTotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {(selectedOrder.orderServiceItems ?? []).map((it, idx) => (
                        <div key={`serv-${idx}`} className="flex justify-between items-center text-xs">
                          <span className="text-gray-500 dark:text-gray-400 truncate max-w-[220px]">
                            {it.serviceName} <span className="text-gray-400">×{it.quantity}</span>
                            <span className="ml-1.5 text-[9px] font-black uppercase text-violet-500 bg-violet-50 dark:bg-violet-500/10 px-1.5 py-0.5 rounded">Servicio</span>
                          </span>
                          <span className="font-mono font-bold text-gray-600 dark:text-gray-300">
                            S/ {it.lineTotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-6 border-t border-dashed border-gray-200 dark:border-[var(--border-subtle)]">
                    <div className="bg-gradient-to-br from-slate-900 to-gray-900 dark:from-[var(--brand-green-hover)] dark:via-[var(--brand-green)] dark:to-[var(--brand-green-hover)] p-5 rounded-[2.5rem] flex items-center justify-between text-white shadow-2xl">
                      <div>
                        <p className="text-[10px] font-bold text-sky-300 dark:text-[var(--icons-green)] uppercase tracking-[0.3em] mb-1">Monto Total Final</p>
                        <h6 className="text-3xl font-black tracking-tighter">{selectedOrder.total}</h6>
                      </div>
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/20">
                        <Icon name="CheckCircle" className="w-8 h-8 text-green-400 dark:text-[var(--icons-green)]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedOrder.estado !== 'cancelado' && (
                <button
                  onClick={() => downloadBoletaCompra(selectedOrder)}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-sky-200 dark:hover:shadow-[var(--brand-green)]/30 transition-all flex items-center justify-center gap-3"
                >
                  <Icon name="Download" className="w-5 h-5" />
                  Descargar Boleta de Compra
                </button>
              )}

              <button
                onClick={async () => {
                  try {
                    const result = await orderApi.requestReceipt(selectedOrder.originalId);
                    router.push(`/customer/chat?conversation=${result.conversationId}`);
                  } catch (err) {
                    console.error('Error al solicitar comprobante:', err);
                    alert('No se pudo abrir el chat con el vendedor. Intenta nuevamente.');
                  }
                }}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-sky-200 dark:hover:shadow-[var(--brand-green)]/30 transition-all flex items-center justify-center gap-3"
              >
                <Icon name="MessageCircle" className="w-5 h-5" />
                Pedir Comprobante al Vendedor
              </button>
            </div>
          </div>
        </div>
      )}

      {showRescheduleModal && selectedOrder && (
        <ClientRescheduleModal
          isOpen={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          order={{
            id: selectedOrder.id,
            tipo_envio: selectedOrder.tipo_envio,
            estado: selectedOrder.estado,
            fechaCita: selectedOrder.fechaCita,
            reprogramaciones: selectedOrder.reprogramaciones,
            solicitudEnviada: selectedOrder.solicitudEnviada,
            tienda: selectedOrder.tienda,
            detalle: selectedOrder.detalle,
          }}
          onConfirm={handleRescheduleConfirm}
          onSendRequest={handleSendRequest}
        />
      )}
    </div>
  );
}