'use client';

/**
 * ModuleSections.tsx
 * Secciones del panel de control de vendedores.
 * Conectado al backend Laravel.
 */

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Seller,
  Product,
  Notification,
  AuditEntry,
  ProductStatus,
} from '@/features/admin/sellers/types';
import { CVStatusBadge, CVCard } from './SharedCVUI';
import BaseButton from '@/components/ui/BaseButton';
import {
  User,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Bell,
  Info,
  Sliders,
  Package,
  Store,
  CheckCircle,
  XCircle,
  Terminal,
  AlertTriangle,
  Users,
  Loader2,
} from 'lucide-react';

// ─── Tipos extendidos ─────────────────────────────────────────────────────────

interface StatsProps {
  totalSellers: number;
  activeSellers: number;
  pendingProducts: number;
  alerts: number;
  // Stats reales del backend (GET /api/admin/sellers/stats)
  pending?: number; // vendedores en espera (store.status = 'pending')
}

// ─── STATS OVERVIEW ───────────────────────────────────────────────────────────

export const StatsOverview: React.FC<{ stats: StatsProps }> = ({ stats }) => {
  const cards = [
    {
      label: 'Vendedores',
      // Usa totalSellers real del backend
      val: stats.totalSellers,
      icon: <Users className="w-6 h-6" />,
      color: 'blue',
      border: 'border-blue-500',
      textColor: 'text-blue-500',
    },
    {
      label: 'Activos',
      // activeSellers viene de stats.active del backend
      val: stats.activeSellers,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'emerald',
      border: 'border-emerald-400',
      textColor: 'text-emerald-400',
    },
    {
      label: 'En Espera',
      // pending = vendedores con store.status='pending' (sin contrato/sin aprobar)
      // Usa stats.pending si viene del backend, sino fallback a pendingProducts
      val: stats.pending ?? stats.pendingProducts,
      icon: <Clock className="w-6 h-6" />,
      color: 'amber',
      border: 'border-amber-400',
      textColor: 'text-amber-400',
    },
    {
      label: 'Alertas',
      // alerts = stores con strikes > 0 || disputas abiertas || pagos fallidos
      val: stats.alerts,
      icon: <Bell className="w-6 h-6" />,
      color: 'rose',
      border: 'border-rose-500',
      textColor: 'text-rose-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((c) => (
        <CVCard
          key={c.label}
          className="p-7 border-l-4 shadow-sm hover:shadow-md transition-all"
          border={c.border}
        >
          <div className="flex items-center justify-between mb-5">
            <div
              className={`p-3 bg-[var(--bg-secondary)] rounded-xl ${c.textColor}`}
            >
              {c.icon}
            </div>
            <span className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
              {c.val}
            </span>
          </div>
          <h3 className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
            {c.label}
          </h3>
        </CVCard>
      ))}
    </div>
  );
};

// ─── NOTIFICATIONS LIST ───────────────────────────────────────────────────────

export const NotificationList: React.FC<{
  notifications: Notification[];
  onMarkAllRead: () => void;
}> = ({ notifications, onMarkAllRead }) => {
  const impactMap: Record<string, string> = {
    critico: 'bg-rose-500',
    seguridad: 'bg-amber-500',
    operativo: 'bg-blue-500',
  };

  const getIcon = (tipo: string) => {
    if (tipo === 'critico') return <ShieldAlert className="w-6 h-6" />;
    if (tipo === 'seguridad') return <ShieldCheck className="w-6 h-6" />;
    return <Info className="w-6 h-6" />;
  };

  return (
    <CVCard className="p-8" border="border-[var(--border-subtle)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Centro de Notificaciones
          </h2>
          <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
            Alertas en tiempo real (RF-01)
          </p>
        </div>
        <button
          onClick={onMarkAllRead}
          className="text-[10px] font-black uppercase tracking-widest text-sky-500 hover:bg-sky-500/10 px-6 py-3 rounded-2xl transition-all border border-sky-500/20 w-fit"
        >
          Marcar todas como leídas
        </button>
      </div>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-start gap-5 p-6 rounded-[2rem] border transition-all ${
              n.estado_revision === 'nueva'
                ? 'bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-sm'
                : 'bg-[var(--bg-secondary)]/30 border-transparent'
            }`}
          >
            <div
              className={`p-4 rounded-2xl ${impactMap[n.tipo] ?? 'bg-sky-500'} text-white shadow-xl flex-shrink-0`}
            >
              {getIcon(n.tipo)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <p className="text-sm font-black text-[var(--text-primary)] tracking-tight uppercase">
                  {n.entidad_relacionada}
                </p>
                <span
                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${impactMap[n.tipo] ?? 'bg-sky-500'} text-white`}
                >
                  {n.tipo}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                {n.mensaje}
              </p>
              <div className="flex items-center gap-3 mt-4 flex-wrap">
                <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {n.timestamp}
                </span>
                <span className="w-1 h-1 rounded-full bg-[var(--text-secondary)]" />
                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest italic">
                  {n.modulo_origen}
                </span>
              </div>
            </div>
            {n.estado_revision === 'nueva' && (
              <div className="w-3 h-3 rounded-full bg-sky-500 mt-2 animate-pulse shadow-lg shadow-sky-500/20 flex-shrink-0" />
            )}
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-10 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-3xl">
            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
              Sin notificaciones nuevas
            </p>
          </div>
        )}
      </div>
    </CVCard>
  );
};

// ─── PRODUCT MODERATION (RF-03) ───────────────────────────────────────────────

interface ProductModerationProps {
  products: (Product & { rejection_reason?: string | null })[];
  onAction: (product: Product, suggest: ProductStatus) => void;
  isLoading?: boolean;
}

export const ProductModeration: React.FC<ProductModerationProps> = ({
  products,
  onAction,
  isLoading = false,
}) => {
  const [busyId, setBusyId] = useState<number | null>(null);

  const pending = products.filter(
    (p) => p.status === 'en_espera' || p.status === 'PENDING',
  );

  const handleAction = async (product: Product, suggest: ProductStatus) => {
    setBusyId(product.id);
    try {
      await onAction(product, suggest);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[var(--text-secondary)]">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-bold">
          Cargando productos pendientes...
        </span>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="p-20 text-center text-[var(--text-secondary)] font-black uppercase tracking-widest border-2 border-dashed border-[var(--border-subtle)] rounded-[3rem]">
        <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-60" />
        <p className="text-[10px]">
          No hay solicitudes de moderación activas (RF-03)
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {pending.map((p) => {
        const isBusy = busyId === p.id;
        // Heurística: si tiene rejection_reason previo → edición re-enviada
        const isEdition = !!p.rejection_reason;

        return (
          <CVCard
            key={p.id}
            className={`group border-[var(--border-subtle)] hover:border-sky-500 transition-all shadow-sm hover:shadow-2xl overflow-hidden ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
          >
            {/* Imagen */}
            <div className="h-64 bg-[var(--bg-secondary)] flex items-center justify-center relative overflow-hidden">
              {p.imageUrl ? (
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <Package className="w-16 h-16 text-[var(--text-secondary)] group-hover:scale-110 transition-transform duration-500" />
              )}

              {/* Badges RF-03 */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <div
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 ${
                    isEdition
                      ? 'bg-orange-500 text-white shadow-orange-500/20'
                      : 'bg-emerald-500 text-white shadow-emerald-500/20'
                  }`}
                >
                  {isEdition ? (
                    <>
                      <Sliders className="w-3 h-3" /> Re-enviado
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3" /> Nuevo Registro
                    </>
                  )}
                </div>
                <div className="px-4 py-2 bg-[var(--bg-card)]/90 backdrop-blur-md text-[var(--text-primary)] text-[10px] font-black rounded-xl shadow-lg uppercase tracking-widest border border-[var(--border-subtle)] flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Pendiente
                </div>
              </div>

              {/* Precio en hover */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1 opacity-70">
                  Precio Propuesto
                </p>
                <p className="text-2xl font-black italic tracking-tighter">
                  S/{' '}
                  {p.price.toLocaleString('es-PE', {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              {/* Overlay de carga */}
              {isBusy && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Contenido */}
            <div className="p-8">
              <h3 className="font-black text-[var(--text-primary)] text-lg mb-1 tracking-tight truncate uppercase leading-tight">
                {p.name}
              </h3>

              {/* ID para referencia de auditoría */}
              <p className="text-[9px] font-mono text-[var(--text-secondary)] mb-4">
                ID #{p.id} · {p.date ?? '—'}
              </p>

              <div className="flex flex-col gap-1.5 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
                    <Store className="w-3.5 h-3.5 text-sky-500" />
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate">
                    {p.seller}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  </div>
                  <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                    {p.category}
                  </p>
                </div>
              </div>

              {/* Motivo de rechazo anterior (si es re-envío) */}
              {p.rejection_reason && (
                <div className="mb-6 p-3 bg-amber-400/10 border border-amber-400/20 rounded-2xl">
                  <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Rechazo anterior
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {p.rejection_reason}
                  </p>
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-4">
                <BaseButton
                  onClick={() => handleAction(p, 'APPROVED')}
                  variant="secondary"
                  leftIcon="CheckCircle"
                  size="md"
                  fullWidth
                  disabled={isBusy}
                >
                  {isBusy ? 'Procesando...' : 'Aprobar'}
                </BaseButton>
                <BaseButton
                  onClick={() => handleAction(p, 'REJECTED')}
                  variant="danger"
                  leftIcon="XCircle"
                  size="md"
                  fullWidth
                  disabled={isBusy}
                >
                  {isBusy ? 'Procesando...' : 'Rechazar'}
                </BaseButton>
              </div>
            </div>
          </CVCard>
        );
      })}
    </div>
  );
};

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────

export const AuditLog: React.FC<{ entries: AuditEntry[] }> = ({ entries }) => {
  return (
    <CVCard border="border-[var(--border-subtle)]">
      <div className="p-8 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/30 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
            Historial Forense Inmutable
          </h2>
          <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest mt-1">
            RF-04: Trazabilidad Absoluta (Log de Transacciones)
          </p>
        </div>
        <div className="p-3 bg-sky-500/10 text-sky-500 rounded-xl">
          <Terminal className="w-5 h-5" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Log de auditoría">
          <thead>
            <tr className="bg-[var(--bg-secondary)]/50 border-b border-[var(--border-subtle)] text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              {[
                'Fecha / Hora',
                'Tienda / Entidad',
                'Acción Crítica',
                'Justificación Técnica',
                'Admin Interventor',
              ].map((h, i) => (
                <th
                  key={h}
                  scope="col"
                  className={`px-8 py-5 ${i === 4 ? 'text-right' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {entries.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-[var(--bg-secondary)]/30 transition-all group"
              >
                <td className="px-8 py-6 text-[11px] font-bold text-[var(--text-secondary)] font-mono whitespace-nowrap">
                  {a.fecha}
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tighter group-hover:text-sky-500 transition-colors">
                    {a.entidad}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="px-3 py-1.5 bg-[var(--text-primary)] text-[var(--bg-card)] text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm whitespace-nowrap">
                    {a.accion}
                  </span>
                </td>
                <td className="px-8 py-6 max-w-xs">
                  <div className="relative group/note">
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic font-medium truncate">
                      {a.metadata?.motivo ?? 'N/A'}
                    </p>
                    {/* Tooltip con texto completo */}
                    {a.metadata?.motivo && (
                      <div className="absolute bottom-full left-0 mb-2 invisible group-hover/note:visible bg-[var(--text-primary)] text-[var(--bg-card)] p-3 rounded-xl text-[10px] w-64 shadow-2xl z-10">
                        {a.metadata.motivo}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest bg-sky-500/10 px-3 py-1.5 rounded-lg border border-sky-500/20 whitespace-nowrap">
                    {a.usuario}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entries.length === 0 && (
        <div className="p-20 text-center">
          <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest">
            Sin registros en el log de auditoría
          </p>
        </div>
      )}
    </CVCard>
  );
};
