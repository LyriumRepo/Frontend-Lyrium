'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { Eye, Info } from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type TipoEnvio =
  | 'domicilio'
  | 'agencia'
  | 'sucursal'
  | 'atencion_domicilio'
  | 'atencion_sede';

type EstadoPedido =
  | 'validado_vendedor'
  | 'despachado'
  | 'en_transporte'
  | 'en_domicilio'
  | 'listo_recojo_agencia'
  | 'listo_recojo_sucursal'
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
}

interface Order {
  id: string;
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
}

// ─── Config de flujos ─────────────────────────────────────────────────────────

interface FlowStep {
  id: number;
  label: string;
  icon: string;
}

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
  sucursal: {
    label: 'Recojo en Sucursal',
    icon: 'Store',
    color: 'text-[#59a6cb]',
    accent: 'bg-[#59a6cb]/10 border-[#59a6cb]/20 text-[#59a6cb]',
    steps: [
      { id: 1, label: 'Validado', icon: 'CheckSquare' },
      { id: 2, label: 'Despachado', icon: 'Package' },
      { id: 3, label: 'Listo Sucursal', icon: 'Store' },
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

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockOrders: Order[] = [
  {
    id: '#PED-2024-001',
    fecha: '15 Feb 2024',
    hora: '10:30',
    tienda: 'Vida Natural Perú',
    detalle: '3 productos',
    total: 'S/ 125.50',
    estado: 'en_transporte',
    estadoLabel: 'En transporte',
    tipo: 'productos',
    tipo_envio: 'domicilio',
    currentStep: 3,
    envio: {
      direccion: 'Av. Siempre Viva 123, Lima',
      carrier: 'Olva Courier',
      tracking: 'OLV-123456789',
      tracking_url: 'https://www.olvacourier.com/seguimiento/?numero=OLV-123456789',
    },
  },
  {
    id: '#PED-2024-002',
    fecha: '14 Feb 2024',
    hora: '16:45',
    tienda: 'Tech Store Lima',
    detalle: '1 producto',
    total: 'S/ 450.00',
    estado: 'listo_recojo_agencia',
    estadoLabel: 'Listo para recojo en agencia',
    tipo: 'productos',
    tipo_envio: 'agencia',
    currentStep: 4,
    envio: {
      direccion: 'Calle Falsa 456, Arequipa',
      carrier: 'Shalom',
      tracking: 'SHL-987654321',
      tracking_url: 'https://www.shalom.com.pe/rastreo?guia=SHL-987654321',
    },
  },
  {
    id: '#PED-2024-003',
    fecha: '10 Feb 2024',
    hora: '09:15',
    tienda: 'Moda & Estilo',
    detalle: '5 productos',
    total: 'S/ 280.00',
    estado: 'listo_recojo_sucursal',
    estadoLabel: 'Listo para recojo en sucursal',
    tipo: 'productos',
    tipo_envio: 'sucursal',
    currentStep: 4,
    envio: {
      direccion: 'Urb. Los Rosales Mz A Lt 5, Trujillo',
      carrier: '-',
      tracking: '-',
      tracking_url: '',
    },
  },
  {
    id: '#SRV-2024-001',
    fecha: '16 Feb 2024',
    hora: '11:00',
    tienda: 'Clínica Dental Pro',
    detalle: 'Limpieza Dental Profunda',
    total: 'S/ 180.00',
    estado: 'en_camino',
    estadoLabel: 'En camino',
    tipo: 'servicios',
    tipo_envio: 'atencion_domicilio',
    currentStep: 2,
  },
  {
    id: '#SRV-2024-002',
    fecha: '12 Feb 2024',
    hora: '14:20',
    tienda: 'Centro Estético Lyra',
    detalle: 'Masaje Relajante (60 min)',
    total: 'S/ 120.00',
    estado: 'confirmacion_paciente',
    estadoLabel: 'Confirmación del paciente',
    tipo: 'servicios',
    tipo_envio: 'atencion_sede',
    currentStep: 2,
  },
  {
    id: '#SRV-2024-003',
    fecha: '08 Feb 2024',
    hora: '08:50',
    tienda: 'Clínica Dental Pro',
    detalle: 'Consulta Odontológica',
    total: 'S/ 50.00',
    estado: 'validacion_centro_salud',
    estadoLabel: 'Validación del Centro de Salud',
    tipo: 'servicios',
    tipo_envio: 'atencion_domicilio',
    currentStep: 1,
  },
];

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
    case 'listo_recojo_sucursal':
      return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'Store' };
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

// ─── Sub-componente: Stepper de seguimiento ───────────────────────────────────

function OrderFlowStepper({
  tipoEnvio,
  currentStep,
}: {
  tipoEnvio: TipoEnvio;
  currentStep: number;
}) {
  const flow = FLOW_CONFIG[tipoEnvio];
  const steps = flow.steps;
  const progress = Math.max(0, Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100));

  return (
    <div className="space-y-5">
      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${flow.accent}`}
        >
          <Icon name={flow.icon as any} className="w-3 h-3" />
          {flow.label}
        </span>
      </div>

      <div className="relative flex justify-between items-start pt-1 pb-8">
        <div className="absolute top-[21px] left-[5%] right-[5%] h-[3px] bg-gray-100 dark:bg-[var(--bg-secondary)] rounded-full z-0">
          <div
            className="h-full bg-sky-500 dark:bg-[var(--brand-green)] rounded-full transition-all duration-1000 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10" style={{ width: `${100 / steps.length}%` }}>
              <div
                className={`w-[40px] h-[40px] rounded-[14px] border-[4px] flex items-center justify-center transition-all duration-300 shadow-sm
                ${isCompleted
                    ? 'bg-white dark:bg-[var(--bg-card)] border-emerald-500 text-emerald-500 dark:border-[var(--icons-green)] dark:text-[var(--icons-green)]'
                    : isActive
                      ? 'bg-sky-500 dark:bg-[var(--brand-green)] border-sky-500 dark:border-[var(--brand-green)] text-white shadow-lg shadow-sky-500/20 dark:shadow-lime-500/20 -translate-y-1'
                      : 'bg-white dark:bg-[var(--bg-card)] border-gray-200 dark:border-[var(--border-subtle)] text-gray-300 dark:text-[var(--text-secondary)]'
                  }`}
              >
                {isCompleted ? <Icon name="Check" className="w-4 h-4" /> : <Icon name={step.icon as any} className="w-4 h-4" />}
              </div>
              <span
                className={`mt-3 text-[8px] font-black uppercase tracking-wider text-center leading-tight transition-colors
                ${isActive
                    ? 'text-gray-800 dark:text-[var(--text-primary)]'
                    : isCompleted
                      ? 'text-emerald-500 dark:text-[var(--icons-green)]'
                      : 'text-gray-400 dark:text-[var(--text-secondary)]'
                  }`}
              >
                {step.label}
              </span>
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

  return (
    <div className="p-6 bg-gray-50 dark:bg-[var(--bg-muted)]/50 rounded-[2rem] border border-gray-100 dark:border-[var(--border-subtle)] space-y-4">
      <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest">
        Información de Envío
      </h5>

      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-white dark:bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)] border border-gray-100 dark:border-[var(--border-subtle)] flex-shrink-0 shadow-sm">
          <Icon name="MapPin" className="w-4 h-4" />
        </div>
        <div>
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">
            {tipoEnvio === 'domicilio'
              ? 'Dirección de entrega'
              : tipoEnvio === 'agencia'
                ? 'Ciudad / Agencia'
                : 'Sucursal'}
          </p>
          <p className="text-sm font-bold text-gray-700 dark:text-[var(--text-primary)]">{envio.direccion}</p>
        </div>
      </div>

      {tipoEnvio !== 'sucursal' && (
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
              <span className="text-[11px] font-bold text-amber-500">Pendiente de despacho</span>
            )}
          </div>
        </div>
      )}

      {hasTracking && hasUrl && (
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
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function CustomerOrdersPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [orders] = useState<Order[]>(mockOrders);
  const [filteredOrders, setFiltered] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelected] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showLegendModal, setShowLegendModal] = useState(false);

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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelected(null), 300);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500" />
      </div>
    );
  }

  const selectClass =
    'w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-secondary)] p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 transition-all duration-300 cursor-pointer';
  const inputClass =
    'w-full text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] bg-transparent p-3 border-2 border-gray-200 dark:border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--brand-green)] focus:ring-2 focus:ring-sky-100 transition-all duration-300';

  const shippingOptions =
    filters.categoria === 'productos'
      ? [
        { value: 'domicilio', label: 'Entrega a domicilio' },
        { value: 'agencia', label: 'Recojo en agencia' },
        { value: 'sucursal', label: 'Recojo en sucursal' },
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
    sucursal: [
      { value: 'validado_vendedor', label: 'Validado por vendedor' },
      { value: 'despachado', label: 'Despachado' },
      { value: 'en_transporte', label: 'En transporte' },
      { value: 'listo_recojo_sucursal', label: 'Listo para recojo en sucursal' },
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
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-[var(--text-primary)]">
          Historial de Pedidos
        </h1>
        <p className="text-slate-500 dark:text-[var(--text-muted)] mt-1">
          Revisa todos tus pedidos realizados en Lyrium
        </p>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)]">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-[var(--brand-green)] dark:to-[#1A3A32] rounded-2xl flex items-center justify-center shadow-lg">
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
              <option value="Vida Natural Perú">Vida Natural Perú</option>
              <option value="Tech Store Lima">Tech Store Lima</option>
              <option value="Moda & Estilo">Moda & Estilo</option>
              <option value="Clínica Dental Pro">Clínica Dental Pro</option>
              <option value="Centro Estético Lyra">Centro Estético Lyra</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
              Desde
            </label>
            <input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-300 uppercase tracking-widest ml-1">
              Hasta
            </label>
            <input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
              className={inputClass}
            />
          </div>

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

        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-3 px-8 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 dark:from-[var(--brand-green)] dark:to-[#1A3A32] text-white font-bold text-sm hover:from-sky-600 hover:to-sky-700 dark:hover:from-[#1A3A32] dark:hover:to-[var(--brand-green)] transition-all duration-300 shadow-lg hover:shadow-xl">
            <Icon name="Search" className="w-5 h-5" />
            Aplicar Filtros
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-[var(--border-subtle)] overflow-hidden">
        <div className="bg-gradient-to-r from-sky-400 to-sky-500 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-8 flex items-center justify-between relative overflow-hidden">
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

        <div className="p-8 overflow-x-auto">
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
            <table className="w-full">
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
          )}
        </div>
      </div>

      {showLegendModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex justify-center items-center p-4 lg:p-6 animate-fadeIn"
          onClick={() => setShowLegendModal(false)}
        >
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col"
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
                  onClick={() => setShowLegendModal(false)}
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
                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">3. Recojo en sucursal</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                      Si deseas acudir presencialmente a la tienda correspondiente.
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
                      Su pedido de producto está listo para que lo recoja en agencia logística o en sucursal.
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
                  onClick={() => setShowLegendModal(false)}
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
          className="fixed inset-0 bg-black/40 backdrop-blur-xl z-50 flex justify-center items-center p-4 lg:p-6 animate-fadeIn"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-[var(--bg-secondary)] w-full lg:w-[700px] h-full rounded-[2.5rem] overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col transition-all duration-700"
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
                  <h5 className="text-[10px] font-black text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-5">
                    Seguimiento del Pedido
                  </h5>
                  <OrderFlowStepper tipoEnvio={selectedOrder.tipo_envio} currentStep={selectedOrder.currentStep} />
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
                  <div className="flex justify-between items-center p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#182420] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-sky-50 dark:bg-[var(--bg-muted)] rounded-xl flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)]">
                        <Icon name="Package" className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)]">{selectedOrder.detalle}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Subtotal Bruto</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-700 dark:text-[var(--text-primary)]">{selectedOrder.total}</span>
                  </div>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={closeModal}
                  className="py-5 rounded-2xl bg-gray-100 dark:bg-[var(--bg-muted)] text-gray-600 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-[#2A3F33] transition-all"
                >
                  Cerrar Ventana
                </button>
                <button className="py-5 rounded-2xl bg-gradient-to-r from-green-400 to-sky-500 dark:from-[var(--brand-green)] dark:to-[var(--brand-green-hover)] text-white font-black text-xs uppercase tracking-[0.2em] hover:shadow-lg hover:shadow-sky-200 transition-all flex items-center justify-center gap-3">
                  <Icon name="Upload" className="w-5 h-5" />
                  Descargar Comprobante
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}