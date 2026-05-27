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
  ACTIVE: { label: 'Activo', dot: 'bg-emerald-400', row: '' },
  PENDING: {
    label: 'En espera',
    dot: 'bg-amber-400',
    row: 'border-l-2 border-l-amber-400/40',
  },
  SUSPENDED: {
    label: 'Suspendido',
    dot: 'bg-rose-400',
    row: 'border-l-2 border-l-rose-400/40',
  },
  REJECTED: { label: 'Baja', dot: 'bg-gray-500', row: 'opacity-60' },
};

const CONTRACT_CONFIG: Record<string, { label: string; color: string }> = {
  VIGENTE: { label: 'Vigente', color: 'text-emerald-400' },
  PENDIENTE: { label: 'Pendiente', color: 'text-amber-400' },
  VENCIDO: { label: 'Vencido', color: 'text-rose-400' },
};

const ALERT_ICONS: Record<
  string,
  { icon: React.ReactNode; tip: string; color: string }
> = {
  strikes: {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    tip: 'Tiene strikes',
    color: 'text-rose-400',
  },
  disputes: {
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    tip: 'Disputas abiertas',
    color: 'text-amber-400',
  },
  failed_payment: {
    icon: <Clock className="w-3.5 h-3.5" />,
    tip: 'Pagos fallidos',
    color: 'text-orange-400',
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
                <Ban
                  className="w-3.5 h-3.5 text-rose-400 flex-shrink-0"
                  title="Cuenta baneada"
                />
              )}
              {seller.email_verified && (
                <BadgeCheck
                  className="w-3.5 h-3.5 text-sky-400 flex-shrink-0"
                  title="Email verificado"
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
      <td className="px-4 py-4">
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
                        ${seller.status === 'ACTIVE' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20' : ''}
                        ${seller.status === 'PENDING' ? 'bg-amber-400/10   text-amber-400   border-amber-400/20' : ''}
                        ${seller.status === 'SUSPENDED' ? 'bg-rose-400/10    text-rose-400    border-rose-400/20' : ''}
                        ${seller.status === 'REJECTED' ? 'bg-gray-500/10    text-gray-400    border-gray-500/20' : ''}
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
      <td className="px-4 py-4">
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
            <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
              <ShieldCheck className="w-3 h-3" />
              Sin alertas
            </div>
          )}

          {/* Strikes */}
          {(seller.store?.strikes ?? 0) > 0 && (
            <p className="text-[10px] text-rose-400 font-bold">
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
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-sky-500/10 text-[var(--text-secondary)] hover:text-sky-400 text-[10px] font-black transition-colors border border-[var(--border-subtle)] group-hover:border-sky-500/20"
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
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-emerald-400 hover:bg-emerald-400/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Activar cuenta
                    </button>
                  )}
                  {/* Suspender */}
                  {seller.status !== 'SUSPENDED' && (
                    <button
                      onClick={() => handleAction('SUSPENDED')}
                      className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-amber-400 hover:bg-amber-400/10 transition-colors text-left"
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
                    className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-rose-400 hover:bg-rose-400/10 transition-colors text-left border-t border-[var(--border-subtle)]"
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
        <span className="px-3 py-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full text-[10px] font-black">
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                {[
                  'Vendedor / Contacto',
                  'Tienda Registrada',
                  'Estado',
                  'Seguridad',
                  'Acciones',
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ))}
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
      )}
    </div>
  );
}
