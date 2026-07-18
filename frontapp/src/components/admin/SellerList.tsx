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
} from 'lucide-react';
import AdminTable, { Column } from '@/components/admin/AdminTable';

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

// ─── Celdas ───────────────────────────────────────────────────────────────────

const ContactoCell = ({ seller }: { seller: SellerRow }) => (
  <div className="flex items-center gap-3">
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
      <span
        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--bg-card)] ${(STATUS_CONFIG[seller.status] ?? STATUS_CONFIG['REJECTED']).dot}`}
      />
    </div>

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
);

const TiendaCell = ({ seller }: { seller: SellerRow }) =>
  seller.store ? (
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
          {seller.store.total_sales} ventas · ⭐ {seller.store.rating ?? '—'}
        </p>
      </div>
    </div>
  ) : (
    <span className="text-[11px] text-[var(--text-secondary)] italic">
      Sin tienda
    </span>
  );

const EstadoCell = ({ seller }: { seller: SellerRow }) => {
  const cfg = STATUS_CONFIG[seller.status] ?? STATUS_CONFIG['REJECTED'];
  return (
    <div>
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
    </div>
  );
};

const SeguridadCell = ({ seller }: { seller: SellerRow }) => {
  const contract = CONTRACT_CONFIG[seller.contractStatus ?? 'PENDIENTE'];
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1">
        <span className={`text-[10px] font-bold ${contract.color}`}>
          Contrato: {contract.label}
        </span>
      </div>

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

      {(seller.store?.strikes ?? 0) > 0 && (
        <p className="text-[10px] text-[var(--color-error)] font-bold">
          {seller.store!.strikes} strike(s)
        </p>
      )}
    </div>
  );
};

const AccionesCell = ({
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
    <div className={`flex items-center gap-2 justify-end ${busy ? 'opacity-50 pointer-events-none' : ''}`}>
      <Link
        href={`/admin/sellers/${seller.id}`}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--icons-green)]/10 text-[var(--text-secondary)] hover:text-[var(--icons-green)] text-[10px] font-black transition-colors border border-[var(--border-subtle)]"
      >
        Ver detalle
        <ChevronRight className="w-3 h-3" />
      </Link>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="p-1.5 rounded-xl hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
              onKeyDown={(e) => { if (e.key === 'Escape') setMenuOpen(false); }}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
            />
            <div className="absolute right-0 top-8 z-20 w-52 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
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
              {seller.status !== 'SUSPENDED' && (
                <button
                  onClick={() => handleAction('SUSPENDED')}
                  className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-[var(--color-warning)] hover:bg-[var(--color-warning)]/10 transition-colors text-left"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Suspender
                </button>
              )}
              <button
                onClick={() =>
                  handleAction(seller.is_banned ? 'ACTIVE' : 'SUSPENDED')
                }
                className="w-full flex items-center gap-2 px-4 py-3 text-[11px] font-bold text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors text-left border-t border-[var(--border-subtle)]"
              >
                <Ban className="w-3.5 h-3.5" />
                {seller.is_banned ? 'Desbanear usuario' : 'Banear usuario'}
              </button>
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
  );
};

// ─── Card mobile ──────────────────────────────────────────────────────────────

const SellerMobileCard = ({ seller }: { seller: SellerRow }) => {
  const cfg = STATUS_CONFIG[seller.status] ?? STATUS_CONFIG['REJECTED'];
  const contract = CONTRACT_CONFIG[seller.contractStatus ?? 'PENDIENTE'];
  return (
    <div className="p-4 flex items-start gap-3">
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
};

// ─── Componente principal ─────────────────────────────────────────────────────

export default function SellerList({
  sellers,
  loading,
  onResetPassword,
  onStatusChange,
}: SellerListProps) {
  const columns: Column<SellerRow>[] = [
    { key: 'contacto', header: 'Vendedor / Contacto', render: (seller) => <ContactoCell seller={seller} /> },
    { key: 'tienda', header: 'Tienda Registrada', hideMobile: true, render: (seller) => <TiendaCell seller={seller} /> },
    { key: 'estado', header: 'Estado', render: (seller) => <EstadoCell seller={seller} /> },
    { key: 'seguridad', header: 'Seguridad', hideMobile: true, render: (seller) => <SeguridadCell seller={seller} /> },
    {
      key: 'acciones',
      header: 'Acciones',
      align: 'right',
      render: (seller) => (
        <AccionesCell seller={seller} onStatusChange={onStatusChange} onResetPassword={onResetPassword} />
      ),
    },
  ];

  return (
    <AdminTable
      data={sellers}
      columns={columns}
      loading={loading}
      countLabel={sellers.length === 1 ? 'vendedor' : 'vendedores'}
      emptyIcon="Search"
      emptyTitle="No se encontraron vendedores registrados"
      emptyDescription="Ajusta los filtros de búsqueda"
      mobileCardRender={(seller) => <SellerMobileCard seller={seller} />}
    />
  );
}
