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
  ServiceStatus,
} from '@/features/admin/sellers/types';
import { CVCard } from './SharedCVUI';
import {
  User,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Bell,
  Info,
  Package,
  Store,
  CheckCircle,
  XCircle,
  Terminal,
  AlertTriangle,
  Users,
  Loader2,
  Search,
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
      val: stats.totalSellers,
      icon: <Users className="w-6 h-6" />,
      color: 'celeste',
      border: 'border-[var(--icons-green)]',
      textColor: 'text-[var(--icons-green)]',
    },
    {
      label: 'Activos',
      val: stats.activeSellers,
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'turquesaClaro',
      border: 'border-[var(--icons-green)]',
      textColor: 'text-[var(--icons-green)]',
    },
    {
      label: 'En Espera',
      val: stats.pending ?? stats.pendingProducts,
      icon: <Clock className="w-6 h-6" />,
      color: 'lima',
      border: 'border-[var(--icons-green)]',
      textColor: 'text-[var(--icons-green)]',
    },
    {
      label: 'Alertas',
      val: stats.alerts,
      icon: <Bell className="w-6 h-6" />,
      color: 'error',
      border: 'border-[var(--color-error)]',
      textColor: 'text-[var(--color-error)]',
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
    critico: 'bg-[var(--color-error)]',
    seguridad: 'bg-[var(--color-warning)]',
    operativo: 'bg-[var(--color-info)]',
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
          className="text-[10px] font-black uppercase tracking-widest text-[var(--icons-green)] hover:bg-[var(--icons-green)]/10 px-6 py-3 rounded-2xl transition-all border border-[var(--icons-green)]/20 w-fit"
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
              className={`p-4 rounded-2xl ${impactMap[n.tipo] ?? 'bg-[var(--icons-green)]'} text-white shadow-xl flex-shrink-0`}
            >
              {getIcon(n.tipo)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <p className="text-sm font-black text-[var(--text-primary)] tracking-tight uppercase">
                  {n.entidad_relacionada}
                </p>
                <span
                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${impactMap[n.tipo] ?? 'bg-[var(--icons-green)]'} text-white`}
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
                <span className="text-[10px] font-black text-[var(--icons-green)] uppercase tracking-widest italic">
                  {n.modulo_origen}
                </span>
              </div>
            </div>
            {n.estado_revision === 'nueva' && (
              <div className="w-3 h-3 rounded-full bg-[var(--icons-green)] mt-2 animate-pulse shadow-lg shadow-cyan-500/20 flex-shrink-0" />
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
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const pending = products.filter(
    (p) => p.status === 'en_espera' || p.status === 'PENDING',
  );

  // Extraer tiendas únicas para el filtro
  const stores = React.useMemo(() => {
    const map = new Map<string, string>();
    pending.forEach((p) => {
      if (p.seller && p.sellerId) map.set(p.seller, String(p.sellerId));
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [pending]);

  // Aplicar filtros
  const filtered = React.useMemo(() => {
    return pending.filter((p) => {
      if (
        search &&
        !p.name.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (storeFilter && p.seller !== storeFilter) return false;
      if (dateFrom && p.date && p.date < dateFrom) return false;
      if (dateTo && p.date && p.date > dateTo) return false;
      return true;
    });
  }, [pending, search, storeFilter, dateFrom, dateTo]);

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
        <CheckCircle className="w-12 h-12 text-[var(--color-success)] mx-auto mb-4 opacity-60" />
        <p className="text-[10px]">
          No hay solicitudes de moderación activas (RF-03)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem]">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm font-bold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>
        <div className="w-px h-6 bg-[var(--border-subtle)]" />
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-black text-[var(--text-primary)] outline-none cursor-pointer uppercase tracking-widest"
        >
          <option value="">Todas las tiendas</option>
          {stores.map(([name]) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="w-px h-6 bg-[var(--border-subtle)]" />
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            Desde
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-bold text-[var(--text-primary)] outline-none"
          />
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            Hasta
          </span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-bold text-[var(--text-primary)] outline-none"
          />
        </div>
        {(search || storeFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearch('');
              setStoreFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            className="px-4 py-2 text-[10px] font-black text-[var(--color-error)] uppercase tracking-widest hover:bg-[var(--color-error)]/10 rounded-xl transition-all"
          >
            Limpiar
          </button>
        )}
        <div className="text-[10px] font-bold text-[var(--text-secondary)] ml-auto">
          {filtered.length} de {pending.length} productos
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden divide-y divide-[var(--border-subtle)] rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
        {filtered.map((p) => {
          const isBusy = busyId === p.id;
          const isEdition = !!p.rejection_reason;
          return (
            <div
              key={p.id}
              className={`p-4 flex gap-3 ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <div className="w-14 h-14 rounded-xl bg-[var(--bg-secondary)] overflow-hidden flex items-center justify-center flex-shrink-0">
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.name} width={56} height={56} className="object-cover w-full h-full" />
                ) : (
                  <Package className="w-6 h-6 text-[var(--text-secondary)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-black text-[var(--text-primary)] text-sm leading-tight truncate">{p.name}</p>
                    <p className="text-[9px] font-mono text-[var(--text-secondary)] mt-0.5">ID #{p.id}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex-shrink-0 ${
                      isEdition ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]' : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                    }`}
                  >
                    {isEdition ? 'Re-enviado' : 'Nuevo'}
                  </span>
                </div>
                {p.rejection_reason && (
                  <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-[var(--color-warning)]">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{p.rejection_reason}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <Store className="w-3 h-3 text-[var(--icons-green)]" />
                  <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">{p.seller}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{p.category}</span>
                  <span className="font-black text-[var(--text-primary)] text-sm">S/ {p.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)]">{p.date ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleAction(p, 'APPROVED')}
                    disabled={isBusy}
                    className="flex-1 px-3 py-2 bg-[var(--color-success)]/10 hover:bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {isBusy ? '...' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => handleAction(p, 'REJECTED')}
                    disabled={isBusy}
                    className="flex-1 px-3 py-2 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    {isBusy ? '...' : 'Rechazar'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet+: tabla */}
      <div className="hidden sm:block overflow-x-auto rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] w-16">
                Imagen
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Producto
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Tienda
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Categoría
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">
                Precio
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Fecha
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const isBusy = busyId === p.id;
              const isEdition = !!p.rejection_reason;
              return (
                <tr
                  key={p.id}
                  className={`border-b border-[var(--border-subtle)] last:border-none hover:bg-[var(--bg-secondary)]/30 transition-colors ${
                    isBusy ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {/* Imagen */}
                  <td className="p-4">
                    <div className="w-14 h-14 rounded-xl bg-[var(--bg-secondary)] overflow-hidden flex items-center justify-center">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          width={56}
                          height={56}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-[var(--text-secondary)]" />
                      )}
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-black text-[var(--text-primary)] text-sm leading-tight">
                          {p.name}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--text-secondary)] mt-0.5">
                          ID #{p.id}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          isEdition
                            ? 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                            : 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                        }`}
                      >
                        {isEdition ? 'Re-enviado' : 'Nuevo'}
                      </span>
                    </div>
                    {/* Rechazo anterior inline */}
                    {p.rejection_reason && (
                      <div className="mt-2 flex items-start gap-1.5 text-[10px] text-[var(--color-warning)]">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {p.rejection_reason}
                        </span>
                      </div>
                    )}
                  </td>

                  {/* Tienda */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-[var(--icons-green)]" />
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">
                        {p.seller}
                      </span>
                    </div>
                  </td>

                  {/* Categoría */}
                  <td className="p-4">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                      {p.category}
                    </span>
                  </td>

                  {/* Precio */}
                  <td className="p-4 text-right">
                    <span className="font-black text-[var(--text-primary)] text-sm">
                      S/ {p.price.toFixed(2)}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                        {p.date ?? '—'}
                      </span>
                    </div>
                  </td>

                  {/* Acciones */}
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(p, 'APPROVED')}
                        disabled={isBusy}
                        className="px-4 py-2 bg-[var(--color-success)]/10 hover:bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isBusy ? '...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleAction(p, 'REJECTED')}
                        disabled={isBusy}
                        className="px-4 py-2 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {isBusy ? '...' : 'Rechazar'}
                      </button>
                    </div>
                    {isBusy && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--icons-green)] mt-1" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── SERVICE MODERATION ───────────────────────────────────────────────────────

interface ServiceModerationProps {
  services: (Product & { rejection_reason?: string | null })[];
  onAction: (service: Product, suggest: ServiceStatus) => void;
  isLoading?: boolean;
}

export const ServiceModeration: React.FC<ServiceModerationProps> = ({
  services,
  onAction,
  isLoading = false,
}) => {
  const [busyId, setBusyId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const pending = services.filter(
    (s) => s.status === 'en_espera' || s.status === 'PENDING',
  );

  const stores = React.useMemo(() => {
    const map = new Map<string, string>();
    pending.forEach((s) => {
      if (s.seller && s.sellerId) map.set(s.seller, String(s.sellerId));
    });
    return Array.from(map.entries()).sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
  }, [pending]);

  const filtered = React.useMemo(() => {
    return pending.filter((s) => {
      if (
        search &&
        !s.name.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (storeFilter && s.seller !== storeFilter) return false;
      if (dateFrom && s.date && s.date < dateFrom) return false;
      if (dateTo && s.date && s.date > dateTo) return false;
      return true;
    });
  }, [pending, search, storeFilter, dateFrom, dateTo]);

  const handleAction = async (service: Product, suggest: ServiceStatus) => {
    setBusyId(service.id);
    try {
      await onAction(service, suggest);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-[var(--text-secondary)]">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="text-sm font-bold">
          Cargando servicios pendientes...
        </span>
      </div>
    );
  }

  if (pending.length === 0) {
    return (
      <div className="p-20 text-center text-[var(--text-secondary)] font-black uppercase tracking-widest border-2 border-dashed border-[var(--border-subtle)] rounded-[3rem]">
        <CheckCircle className="w-12 h-12 text-[var(--color-success)] mx-auto mb-4 opacity-60" />
        <p className="text-[10px]">
          No hay solicitudes de moderación de servicios activas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4 p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem]">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[var(--text-secondary)]" />
          <input
            type="text"
            placeholder="Buscar servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm font-bold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
          />
        </div>
        <div className="w-px h-6 bg-[var(--border-subtle)]" />
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-black text-[var(--text-primary)] outline-none cursor-pointer uppercase tracking-widest"
        >
          <option value="">Todas las tiendas</option>
          {stores.map(([name]) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <div className="w-px h-6 bg-[var(--border-subtle)]" />
        <div className="flex items-center gap-3">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            Desde
          </span>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-bold text-[var(--text-primary)] outline-none"
          />
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
            Hasta
          </span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-xl text-[11px] font-bold text-[var(--text-primary)] outline-none"
          />
        </div>
        {(search || storeFilter || dateFrom || dateTo) && (
          <button
            onClick={() => {
              setSearch('');
              setStoreFilter('');
              setDateFrom('');
              setDateTo('');
            }}
            className="px-4 py-2 text-[10px] font-black text-[var(--color-error)] uppercase tracking-widest hover:bg-[var(--color-error)]/10 rounded-xl transition-all"
          >
            Limpiar
          </button>
        )}
        <div className="text-[10px] font-bold text-[var(--text-secondary)] ml-auto">
          {filtered.length} de {pending.length} servicios
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden divide-y divide-[var(--border-subtle)] rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
        {filtered.map((s) => {
          const isBusy = busyId === s.id;
          return (
            <div
              key={s.id}
              className={`p-4 ${isBusy ? 'opacity-60 pointer-events-none' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-black text-[var(--text-primary)] text-sm leading-tight truncate">{s.name}</p>
                  <p className="text-[9px] font-mono text-[var(--text-secondary)] mt-0.5">ID #{s.id}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-[var(--color-success)]/10 text-[var(--color-success)] flex-shrink-0">
                  Nuevo
                </span>
              </div>
              {s.rejection_reason && (
                <div className="mt-1.5 flex items-start gap-1.5 text-[10px] text-[var(--color-warning)]">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{s.rejection_reason}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-1.5">
                <Store className="w-3 h-3 text-[var(--icons-green)]" />
                <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">{s.seller}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{s.category}</span>
                <span className="font-black text-[var(--text-primary)] text-sm">S/ {s.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                <span className="text-[10px] font-bold text-[var(--text-secondary)]">{s.date ?? '—'}</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => handleAction(s, 'APPROVED')}
                  disabled={isBusy}
                  className="flex-1 px-3 py-2 bg-[var(--color-success)]/10 hover:bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  {isBusy ? '...' : 'Aprobar'}
                </button>
                <button
                  onClick={() => handleAction(s, 'REJECTED')}
                  disabled={isBusy}
                  className="flex-1 px-3 py-2 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {isBusy ? '...' : 'Rechazar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tablet+: tabla */}
      <div className="hidden sm:block overflow-x-auto rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--bg-card)]">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/50">
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Servicio
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Tienda
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Categoría
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] text-right">
                Precio
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Fecha
              </th>
              <th className="p-4 text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => {
              const isBusy = busyId === s.id;
              return (
                <tr
                  key={s.id}
                  className={`border-b border-[var(--border-subtle)] last:border-none hover:bg-[var(--bg-secondary)]/30 transition-colors ${
                    isBusy ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-black text-[var(--text-primary)] text-sm leading-tight">
                          {s.name}
                        </p>
                        <p className="text-[9px] font-mono text-[var(--text-secondary)] mt-0.5">
                          ID #{s.id}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-[var(--color-success)]/10 text-[var(--color-success)]">
                        Nuevo
                      </span>
                    </div>
                    {s.rejection_reason && (
                      <div className="mt-2 flex items-start gap-1.5 text-[10px] text-[var(--color-warning)]">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {s.rejection_reason}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-[var(--icons-green)]" />
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">
                        {s.seller}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                      {s.category}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-black text-[var(--text-primary)] text-sm">
                      S/ {s.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-[var(--text-secondary)]" />
                      <span className="text-[10px] font-bold text-[var(--text-secondary)]">
                        {s.date ?? '—'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAction(s, 'APPROVED')}
                        disabled={isBusy}
                        className="px-4 py-2 bg-[var(--color-success)]/10 hover:bg-[var(--color-success)]/20 text-[var(--color-success)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isBusy ? '...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleAction(s, 'REJECTED')}
                        disabled={isBusy}
                        className="px-4 py-2 bg-[var(--color-error)]/10 hover:bg-[var(--color-error)]/20 text-[var(--color-error)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {isBusy ? '...' : 'Rechazar'}
                      </button>
                    </div>
                    {isBusy && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--icons-green)] mt-1" />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
        <div className="p-3 bg-[var(--icons-green)]/10 text-[var(--icons-green)] rounded-xl">
          <Terminal className="w-5 h-5" />
        </div>
      </div>

      {/* Mobile: cards */}
      <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
        {entries.map((a) => (
          <div key={a.id} className="p-5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] font-mono">{a.fecha}</span>
              <span className="px-2.5 py-1 bg-[var(--text-primary)] text-[var(--bg-card)] text-[8px] font-black rounded-lg uppercase tracking-widest whitespace-nowrap">
                {a.accion}
              </span>
            </div>
            <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tighter">{a.entidad}</p>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic font-medium mt-1.5">
              {a.metadata?.motivo ?? 'N/A'}
            </p>
            <span className="inline-block mt-2 text-[10px] font-black text-[var(--icons-green)] uppercase tracking-widest bg-[var(--icons-green)]/10 px-3 py-1.5 rounded-lg border border-[var(--icons-green)]/20">
              {a.usuario}
            </span>
          </div>
        ))}
      </div>

      {/* Tablet+: tabla */}
      <div className="hidden sm:block overflow-x-auto">
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
                  <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tighter group-hover:text-[var(--icons-green)] transition-colors">
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
                  <span className="text-[10px] font-black text-[var(--icons-green)] uppercase tracking-widest bg-[var(--icons-green)]/10 px-3 py-1.5 rounded-lg border border-[var(--icons-green)]/20 whitespace-nowrap">
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
