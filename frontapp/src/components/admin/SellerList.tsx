'use client';

/**
 * SellerList.tsx
 * Tabla de vendedores para el panel de control de administrador.
 * Muestra estado de tienda, alertas, contrato y acciones.
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ShieldAlert,
  Clock,
  Store,
  ExternalLink,
  ChevronRight,
  Ban,
  BadgeCheck,
  MoreVertical,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Search,
} from 'lucide-react';
import { SkeletonRow } from '@/components/ui/Skeleton';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SellerRow {
  id: number;
  name: string;
  company: string;
  email: string;
  phone?: string | null;
  avatar?: string | null;
  status: string; // 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED'
  is_banned?: boolean;
  email_verified?: boolean;
  regDate: string;
  contractStatus?: 'VIGENTE' | 'PENDIENTE' | 'VENCIDO';
  productsTotal?: number;
  has_alerts?: boolean;
  alerts?: string[]; // ['strikes','disputes','failed_payment']
  store?: {
    id: number;
    status: string;
    strikes: number;
    rating: number;
    total_sales: number;
    logo?: string | null;
  } | null;
}

interface SellerListProps {
  sellers: SellerRow[];
  loading?: boolean;
  onResetPassword?: (id: number) => void;
  onStatusChange?: (
    id: number,
    status: string,
    reason?: string,
  ) => Promise<void>;
}

// ─── Helpers visuales ─────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; row: string }
> = {
  ACTIVE: { label: 'Activo', dot: 'bg-[var(--color-success)]', row: '' },
  PENDING: {
    label: 'En espera',
    dot: 'bg-[var(--icons-green)]',
    row: 'border-l-2 border-l-cyan-400/40',
  },
  SUSPENDED: {
    label: 'Suspendido',
    dot: 'bg-[var(--color-error)]',
    row: 'border-l-2 border-l-rose-400/40',
  },
  REJECTED: { label: 'Baja', dot: 'bg-[var(--text-secondary)]', row: 'opacity-60' },
};

const CONTRACT_CONFIG: Record<string, { label: string; color: string }> = {
  VIGENTE: { label: 'Vigente', color: 'text-[var(--color-success)]' },
  PENDIENTE: { label: 'Pendiente', color: 'text-[var(--icons-green)]' },
  VENCIDO: { label: 'Vencido', color: 'text-[var(--color-error)]' },
};

const ALERT_ICONS: Record<
  string,
  { icon: React.ReactNode; tip: string; color: string }
> = {
  strikes: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    tip: 'Tiene strikes',
    color: 'text-[var(--color-error)]',
  },
  disputes: {
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    tip: 'Disputas abiertas',
    color: 'text-[var(--color-warning)]',
  },
  failed_payment: {
    icon: <Clock className="w-3.5 h-3.5" />,
    tip: 'Pagos fallidos',
    color: 'text-[var(--color-warning)]',
  },
};

// ─── Fila individual ──────────────────────────────────────────────────────────

const SellerRow = ({
  seller,
  onStatusChange,
  onResetPassword,
}: {
  seller: SellerRow;
  onStatusChange?: SellerListProps['onStatusChange'];
  onResetPassword?: (id: number) => void;
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const cfg = STATUS_CONFIG[seller.status] ?? STATUS_CONFIG['REJECTED'];
  const contract = CONTRACT_CONFIG[seller.contractStatus ?? 'PENDIENTE'];

  const handleAction = async (action: string) => {
    setMenuOpen(false);
    if (!onStatusChange) return;
    setBusy(true);
    try {
      await onStatusChange(
        seller.id,
        action,
        'Acción desde panel de administración',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <tr
      className={`group transition-colors hover:bg-[var(--bg-secondary)] ${cfg.row} ${busy ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Vendedor / Contacto */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {seller.avatar ? (
              <img
                src={seller.avatar}
                alt={seller.name}
                className="w-10 h-10 rounded-2xl object-cover border border-[var(--border-subtle)]"
              />
            ) : (
              <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-black text-sm">
                {seller.name?.[0]?.toUpperCase()}
              </div>
            )}
            {/* Dot de status */}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-card)] ${cfg.dot}`}
            />
          </div>

          {/* Info */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black text-[var(--text-primary)] truncate max-w-[140px]">
                {seller.name}
              </span>
              {seller.is_banned && (
                <span title="Cuenta baneada" className="flex-shrink-0 flex items-center">
                  <Ban className="w-3.5 h-3.5 text-[var(--color-error)]" />
                </span>
              )}
              {seller.email_verified && (
                <BadgeCheck
                  className="w-3.5 h-3.5 text-[var(--icons-green)] flex-shrink-0"
                  aria-label="Email verificado"
                />
              )}
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] truncate max-w-[160px]">
              {seller.email}
            </p>
            {seller.phone && (
              <p className="text-[10px] text-[var(--text-secondary)] font-mono">
                {seller.phone}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Tienda registrada */}
      <td className="hidden md:table-cell px-4 py-4">
        {seller.store ? (
          <div className="flex items-center gap-2">
            {seller.store.logo ? (
              <img
                src={seller.store.logo}
                alt={seller.company}
                className="w-8 h-8 rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center flex-shrink-0">
                <Store className="w-4 h-4 text-[var(--text-secondary)]" />
              </div>
            )}
            <div>
              <p className="text-xs font-bold text-[var(--text-primary)] truncate max-w-[140px]">
                {seller.company}
              </p>
              <p className="text-[10px] text-[var(--text-secondary)]">
                {seller.store.total_sales} ventas · ⭐{' '}
                {seller.store.rating ?? '—'}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-[11px] text-[var(--text-secondary)] italic">
            Sin tienda
          </span>
        )}
      </td>

      {/* Estado */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border
                        ${seller.status === 'ACTIVE' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : ''}
                        ${seller.status === 'PENDING' ? 'bg-[var(--icons-green)]/10   text-[var(--icons-green)]   border-[var(--icons-green)]/20' : ''}
                        ${seller.status === 'SUSPENDED' ? 'bg-[var(--color-error)]/10    text-[var(--color-error)]    border-[var(--color-error)]/20' : ''}
                        ${seller.status === 'REJECTED' ? 'bg-[var(--text-secondary)]/10    text-[var(--text-muted)]    border-gray-500/20' : ''}
                    `}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-secondary)] mt-1">
          Desde {seller.regDate}
        </p>
      </td>

      {/* Seguridad */}
      <td className="hidden md:table-cell px-4 py-4">
        <div className="space-y-1">
          {/* Contrato */}
          <div className="flex items-center gap-1">
            <span className={`text-[10px] font-bold ${contract.color}`}>
              Contrato: {contract.label}
            </span>
          </div>

          {/* Alertas */}
          {seller.has_alerts && seller.alerts && seller.alerts.length > 0 ? (
            <div className="flex items-center gap-1 flex-wrap">
              {seller.alerts.map((a) => {
                const ac = ALERT_ICONS[a];
                if (!ac) return null;
                return (
                  <span
                    key={a}
                    title={ac.tip}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[var(--bg-secondary)] text-[9px] font-bold ${ac.color}`}
                  >
                    {ac.icon}
                    {ac.tip}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[10px] text-[var(--color-success)] font-bold">
              <ShieldCheck className="w-3 h-3" />
              Sin alertas
            </div>
          )}

          {/* Strikes */}
          {(seller.store?.strikes ?? 0) > 0 && (
            <p className="text-[10px] text-[var(--color-error)] font-bold">
              {seller.store!.strikes} strike(s)
            </p>
          )}
        </div>
      </td>

      {/* Acciones */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2 justify-end">
          {/* Ver detalle */}
          <Link
            href={`/admin/sellers/${seller.id}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--icons-green)]/10 text-[var(--text-secondary)] hover:text-[var(--icons-green)] text-[10px] font-black transition-colors border border-[var(--border-subtle)] group-hover:border-cyan-500/20"
          >
            Ver detalle
            <ChevronRight className="w-3 h-3" />
          </Link>

          {/* Menú de acciones rápidas */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-52 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
                  {/* Activar */}
                  {seller.status !== 'ACTIVE' && (
                    <button
                      onClick={() => handleAction('ACTIVE')}
                      disabled={seller.contractStatus !== 'VIGENTE'}
                      title={
                        seller.contractStatus !== 'VIGENTE'
                          ? 'Requiere contrato vigente'
                          : ''
                      }
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-[var(--color-success)] hover:bg-[var(--color-success)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Activar cuenta
                    </button>
                  )}
                  {/* Suspender */}
                  {seller.status !== 'SUSPENDED' && (
                    <button
                      onClick={() => handleAction('SUSPENDED')}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 transition-colors text-left"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Suspender
                    </button>
                  )}
                  {/* Banear / desbanear */}
                  <button
                    onClick={() =>
                      handleAction(seller.is_banned ? 'ACTIVE' : 'SUSPENDED')
                    }
                    className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors text-left border-t border-[var(--border-subtle)]"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    {seller.is_banned ? 'Desbanear usuario' : 'Banear usuario'}
                  </button>
                  {/* Reset password */}
                  {onResetPassword && (
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onResetPassword(seller.id);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors text-left border-t border-[var(--border-subtle)]"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Resetear contraseña
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SellerList({
  sellers,
  loading,
  onResetPassword,
  onStatusChange,
}: SellerListProps) {
  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden p-8">
        <SkeletonRow count={6} />
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2.5rem] overflow-hidden">
      {/* Header de tabla */}
      <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <h3 className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">
            Gestión Estratégica de Vendedores
          </h3>
          <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">
            Control centralizado de cuentas
          </p>
        </div>
        <span className="px-3 py-1.5 bg-[var(--icons-green)]/10 text-[var(--icons-green)] border border-cyan-500/20 rounded-full text-[10px] font-black">
          {sellers.length} vendedor{sellers.length !== 1 ? 'es' : ''}
        </span>
      </div>

      {sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-secondary)]">
          <Search className="w-10 h-10 opacity-30" />
          <p className="text-sm font-bold">
            No se encontraron vendedores registrados
          </p>
          <p className="text-xs opacity-60">Ajusta los filtros de búsqueda</p>
        </div>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
            {sellers.map((seller) => {
              const cfg = STATUS_CONFIG[seller.status] ?? STATUS_CONFIG['REJECTED'];
              const contract = CONTRACT_CONFIG[seller.contractStatus ?? 'PENDIENTE'];
              return (
                <div key={seller.id} className="p-4 flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    {seller.avatar ? (
                      <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-2xl object-cover border border-[var(--border-subtle)]" />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] font-black text-sm">
                        {seller.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-card)] ${cfg.dot}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-[var(--text-primary)] truncate">{seller.name}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border flex-shrink-0
                        ${seller.status === 'ACTIVE' ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : ''}
                        ${seller.status === 'PENDING' ? 'bg-[var(--icons-green)]/10 text-[var(--icons-green)] border-[var(--icons-green)]/20' : ''}
                        ${seller.status === 'SUSPENDED' ? 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20' : ''}
                        ${seller.status === 'REJECTED' ? 'bg-[var(--text-secondary)]/10 text-[var(--text-muted)] border-gray-500/20' : ''}
                      `}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] truncate mt-0.5">{seller.email}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold ${contract.color}`}>Contrato: {contract.label}</span>
                      {seller.store && (
                        <span className="text-[10px] text-[var(--text-secondary)]">{seller.store.total_sales} ventas · ⭐{seller.store.rating ?? '—'}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Link
                        href={`/admin/sellers/${seller.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--icons-green)] text-[10px] font-black transition-colors border border-[var(--border-subtle)]"
                      >
                        Ver detalle <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet+: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border-subtle)]">
                  <th className="px-4 py-3 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Vendedor / Contacto</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Tienda Registrada</th>
                  <th className="px-4 py-3 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Estado</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Seguridad</th>
                  <th className="px-4 py-3 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {sellers.map((seller) => (
                  <SellerRow
                    key={seller.id}
                    seller={seller}
                    onStatusChange={onStatusChange}
                    onResetPassword={onResetPassword}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
