'use client';

/**
 * SellerDetailPageClient.tsx
 * Vista de detalle completo de un vendedor.
 * Conectado a GET /api/admin/sellers/{id}
 */

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { adminSellerRepository } from '@/shared/lib/api/adminSellerRepository';
import {
  ArrowLeft,
  Store,
  ShieldAlert,
  ShieldCheck,
  Mail,
  Phone,
  FileText,
  Star,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  BadgeCheck,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusLabel: Record<string, { label: string; color: string }> = {
  active: {
    label: 'Activa',
    color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  },
  pending: {
    label: 'En espera',
    color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  },
  suspended: {
    label: 'Suspendida',
    color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
  },
};

const alertLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  strikes: {
    label: 'Tiene strikes activos',
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  disputes: {
    label: 'Disputas abiertas',
    icon: <ShieldAlert className="w-4 h-4" />,
  },
  failed_payment: {
    label: 'Pagos fallidos pendientes',
    icon: <XCircle className="w-4 h-4" />,
  },
};

const contractStatusLabel: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Vigente', color: 'text-emerald-400' },
  PENDING: { label: 'Pendiente', color: 'text-amber-400' },
  EXPIRED: { label: 'Vencido', color: 'text-rose-400' },
  INACTIVE: { label: 'Inactivo', color: 'text-gray-400' },
};

// ─── Subcomponentes ───────────────────────────────────────────────────────────

const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem] p-6 space-y-4">
    <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
      {title}
    </h3>
    {children}
  </div>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
    <span className="text-xs text-[var(--text-secondary)] font-medium">
      {label}
    </span>
    <span className="text-xs font-bold text-[var(--text-primary)] text-right max-w-[60%]">
      {value ?? '—'}
    </span>
  </div>
);

const StatBadge = ({
  value,
  label,
  icon,
}: {
  value: number;
  label: string;
  icon: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center p-4 bg-[var(--bg-secondary)] rounded-2xl gap-1">
    <span className="text-[var(--text-secondary)]">{icon}</span>
    <span className="text-2xl font-black text-[var(--text-primary)]">
      {value}
    </span>
    <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest text-center">
      {label}
    </span>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────

export function SellerDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params?.id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'sellers', 'detail', id],
    queryFn: () => adminSellerRepository.getSellerDetail(id),
    enabled: !isNaN(id) && id > 0,
    staleTime: 30_000,
  });

  const banMutation = useMutation({
    mutationFn: () => adminSellerRepository.toggleBan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'sellers', 'detail', id],
      });
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers', 'list'] });
    },
  });

  const storeStatusMutation = useMutation({
    mutationFn: (status: 'active' | 'pending' | 'suspended') => {
      if (!data?.store?.id) throw new Error('No se pudo identificar la tienda');
      return adminSellerRepository.updateStoreStatus(data.store.id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'sellers', 'detail', id],
      });
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 sm:px-8 pb-20 font-industrial animate-pulse space-y-6">
        <div className="h-20 bg-[var(--bg-card)] rounded-[2rem]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-[var(--bg-card)] rounded-[2rem]" />
          ))}
        </div>
      </div>
    );
  }

  if (isNaN(id) || id <= 0) {
    return (
      <div className="px-4 sm:px-8 pb-20 font-industrial">
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-400 font-bold">
          ID de vendedor inválido.
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-4 sm:px-8 pb-20 font-industrial">
        <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] text-rose-400 font-bold">
          No se pudo cargar la información del vendedor.
        </div>
      </div>
    );
  }

  const { user, store, open_disputes, pending_payments } = data;
  const storeStatus = statusLabel[store?.status ?? ''] ?? {
    label: 'Desconocido',
    color: 'text-gray-400 bg-gray-400/10 border-gray-400/20',
  };
  const activeContract = store?.contracts?.find((c) => c.status === 'ACTIVE');

  return (
    <div className="px-4 sm:px-8 pb-20 space-y-8 animate-fadeIn font-industrial">
      <ModuleHeader
        title="Detalle del Vendedor"
        subtitle={`${user.display_name} · ID #${user.id}`}
        icon="User"
        actions={
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        }
      />

      {/* ── Stats rápidas ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBadge
          value={store?.total_sales ?? 0}
          label="Ventas totales"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatBadge
          value={store?.strikes ?? 0}
          label="Strikes"
          icon={<AlertTriangle className="w-5 h-5" />}
        />
        <StatBadge
          value={open_disputes}
          label="Disputas abiertas"
          icon={<ShieldAlert className="w-5 h-5" />}
        />
        <StatBadge
          value={pending_payments}
          label="Pagos pendientes"
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {/* ── Grid de información ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Usuario */}
        <InfoCard title="Datos del usuario">
          <div className="flex items-center gap-4 mb-2">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.display_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500 font-black text-xl">
                {user.display_name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-black text-[var(--text-primary)]">
                {user.display_name}
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                @{user.username}
              </p>
            </div>
          </div>
          <InfoRow
            label="Email"
            value={
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </span>
            }
          />
          <InfoRow label="Teléfono" value={user.phone ?? '—'} />
          <InfoRow
            label="Doc. Identidad"
            value={
              user.document_number
                ? `${user.document_type}: ${user.document_number}`
                : '—'
            }
          />
          <InfoRow
            label="Email verificado"
            value={
              user.email_verified ? (
                <span className="text-emerald-400">Verificado</span>
              ) : (
                <span className="text-amber-400">Pendiente</span>
              )
            }
          />
          <InfoRow
            label="Estado cuenta"
            value={
              user.is_banned ? (
                <span className="text-rose-400">Baneado</span>
              ) : (
                <span className="text-emerald-400">Activo</span>
              )
            }
          />
          <InfoRow
            label="Registro"
            value={new Date(user.created_at).toLocaleDateString('es-PE')}
          />
        </InfoCard>

        {/* Tienda */}
        <InfoCard title="Datos de la tienda">
          {store ? (
            <>
              <div className="flex items-center gap-3 mb-2">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={store.trade_name}
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center">
                    <Store className="w-5 h-5 text-[var(--text-secondary)]" />
                  </div>
                )}
                <div>
                  <p className="font-black text-[var(--text-primary)]">
                    {store.trade_name}
                  </p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {store.slug}
                  </p>
                </div>
              </div>
              <InfoRow
                label="Estado tienda"
                value={
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${storeStatus.color}`}
                  >
                    {storeStatus.label}
                  </span>
                }
              />
              <InfoRow
                label="RUC"
                value={<span className="font-mono">{store.ruc}</span>}
              />
              <InfoRow label="Razón Social" value={store.razon_social} />
              <InfoRow label="Rep. Legal" value={store.rep_legal_nombre} />
              <InfoRow label="DNI Rep." value={store.rep_legal_dni} />
              <InfoRow
                label="Comisión"
                value={`${((store.commission_rate ?? 0) * 100).toFixed(1)}%`}
              />
              <InfoRow
                label="Rating"
                value={
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {store.rating ?? '—'}
                  </span>
                }
              />
              <InfoRow
                label="Aprobada"
                value={
                  store.approved_at
                    ? new Date(store.approved_at).toLocaleDateString('es-PE')
                    : '—'
                }
              />
            </>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] py-4 text-center">
              Sin tienda registrada
            </p>
          )}
        </InfoCard>

        {/* Contrato y alertas */}
        <div className="space-y-4">
          <InfoCard title="Contrato activo">
            {activeContract ? (
              <>
                <InfoRow
                  label="N° Contrato"
                  value={
                    <span className="font-mono">
                      {activeContract.contract_number}
                    </span>
                  }
                />
                <InfoRow
                  label="Estado"
                  value={
                    <span
                      className={
                        contractStatusLabel[activeContract.status]?.color ??
                        'text-gray-400'
                      }
                    >
                      {contractStatusLabel[activeContract.status]?.label ??
                        activeContract.status}
                    </span>
                  }
                />
                <InfoRow label="Inicio" value={activeContract.start_date} />
                <InfoRow
                  label="Vencimiento"
                  value={activeContract.end_date ?? 'Indefinido'}
                />
              </>
            ) : (
              <div className="flex items-center gap-2 text-amber-400 text-sm font-bold py-2">
                <AlertTriangle className="w-4 h-4" />
                Sin contrato vigente
              </div>
            )}
          </InfoCard>

          <InfoCard title="Alertas activas">
            {(store?.strikes ?? 0) === 0 &&
            open_disputes === 0 &&
            pending_payments === 0 ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold py-2">
                <ShieldCheck className="w-4 h-4" />
                Sin alertas activas
              </div>
            ) : (
              <div className="space-y-2">
                {(store?.strikes ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-bold p-2 bg-rose-400/10 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                    {store!.strikes} strike(s) acumulado(s)
                  </div>
                )}
                {open_disputes > 0 && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold p-2 bg-amber-400/10 rounded-xl">
                    <ShieldAlert className="w-4 h-4" />
                    {open_disputes} disputa(s) abierta(s)
                  </div>
                )}
                {pending_payments > 0 && (
                  <div className="flex items-center gap-2 text-orange-400 text-xs font-bold p-2 bg-orange-400/10 rounded-xl">
                    <Clock className="w-4 h-4" />
                    {pending_payments} pago(s) pendiente(s)
                  </div>
                )}
              </div>
            )}
          </InfoCard>
        </div>
      </div>

      {/* ── Acciones administrativas ──────────────────────────────────── */}
      {store && (
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem] p-6">
          <h3 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-4">
            Acciones administrativas
          </h3>
          <div className="flex flex-wrap gap-3">
            {store.status !== 'active' && (
              <button
                onClick={() => storeStatusMutation.mutate('active')}
                disabled={
                  storeStatusMutation.isPending || !store.has_active_contract
                }
                title={
                  !store.has_active_contract ? 'Requiere contrato vigente' : ''
                }
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-black hover:bg-emerald-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                Activar tienda
              </button>
            )}
            {store.status !== 'suspended' && (
              <button
                onClick={() => storeStatusMutation.mutate('suspended')}
                disabled={storeStatusMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-black hover:bg-amber-500/20 transition-colors disabled:opacity-40"
              >
                <XCircle className="w-4 h-4" />
                Suspender tienda
              </button>
            )}
            <button
              onClick={() => banMutation.mutate()}
              disabled={banMutation.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black border transition-colors disabled:opacity-40 ${
                user.is_banned
                  ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
              }`}
            >
              {user.is_banned ? (
                <>
                  <BadgeCheck className="w-4 h-4" /> Desbanear usuario
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" /> Banear usuario
                </>
              )}
            </button>
          </div>
          {!store.has_active_contract && (
            <p className="text-[10px] text-amber-400 font-bold mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              No se puede activar la tienda sin un contrato vigente (RF-16).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
