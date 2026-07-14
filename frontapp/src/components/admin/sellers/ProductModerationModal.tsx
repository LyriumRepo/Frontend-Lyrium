'use client';

/**
 * ProductModerationModal.tsx
 * Modal completo de detalle de producto para moderación admin.
 * Se abre al hacer click en Aprobar/Rechazar en ProductModeration.
 *
 * Ubicación: src/components/admin/sellers/ProductModerationModal.tsx
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  X,
  Package,
  Store,
  Tag,
  Weight,
  Ruler,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  Leaf,
  Flame,
  Info,
  Phone,
  Mail,
  ShoppingBag,
  Star,
  Clock,
  Hash,
} from 'lucide-react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import ModalsPortal from '@/components/layout/shared/ModalsPortal';
import type { ProductStatus } from '@/features/admin/sellers/types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  type: string;
  description: string | null;
  short_description: string | null;
  status: string;
  sticker: string | null;
  sku: string | null;
  price: number;
  regular_price: number;
  stock: number;
  in_stock: boolean;
  images: Array<{
    src?: string;
    medium?: string;
    large?: string;
    alt?: string;
  }>;
  categories: Array<{ name: string; slug: string }>;
  store: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    email: string;
    phone: string;
  };
  rating: { average: number; count: number };
  characteristics: Array<{ label: string; value: string }>;
  additional_info: Array<{ label: string; value: string }>;
  nutritional_info: {
    serving_note: string | null;
    rows: Array<{ label: string; value: string; daily_value?: string }>;
  } | null;
  weight: number | null;
  dimensions: string | null;
  expirationDate: string | null;
  created_at: string;
  updated_at: string;
}

interface Props {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (
    productId: number,
    action: ProductStatus,
    reason: string,
  ) => Promise<void>;
  isSubmitting: boolean;
  /** Si tiene rechazo previo */
  rejectionReason?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return `S/ ${n.toFixed(2)}`;
}

function imgSrc(detail: ProductDetail): string {
  const img = detail.images?.[0];
  if (!img) return '/no-image.png';
  return img.large ?? img.medium ?? img.src ?? '/no-image.png';
}

// ─── Sección info ─────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 py-2 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] w-28 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-[12px] text-[var(--text-primary)] font-medium flex-1">
        {value}
      </span>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ProductModerationModal({
  productId,
  isOpen,
  onClose,
  onAction,
  isSubmitting,
  rejectionReason,
}: Props) {
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [pendingAction, setPendingAction] = useState<ProductStatus | null>(
    null,
  );

  // ── Cargar detalle del producto ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !productId) return;
    setDetail(null);
    setError(null);
    setReason('');
    setPendingAction(null);
    setLoading(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('laravel_token') : null;
    fetch(`${LARAVEL_API_URL}/products/${productId}`, {
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [isOpen, productId]);

  // ── Cerrar con Escape ──────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleConfirm = async () => {
    if (!pendingAction || !productId) return;
    if (pendingAction === 'REJECTED' && reason.trim().length < 10) return;
    try {
      await onAction(productId, pendingAction, reason);
      onClose();
    } catch {
      // El error ya se muestra vía toast en el padre; el modal se mantiene abierto para reintentar.
    }
  };

  if (!isOpen) return null;

  return (
    <ModalsPortal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden pointer-events-auto"
          style={{ borderRadius: '2rem' }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-4 sm:px-8 sm:py-5 border-b border-[var(--border-subtle)] flex-shrink-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(14,165,233,.08), rgba(132,204,22,.06))',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--icons-green)]/10 rounded-xl">
                <Package className="w-5 h-5 text-[var(--icons-green)]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight">
                  Revisión de Producto
                </h2>
                <p className="text-[10px] text-[var(--text-secondary)] font-bold uppercase tracking-widest">
                  RF-03 · Moderación antes de publicación
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Body (scrollable) ── */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--text-secondary)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--icons-green)]" />
                <p className="text-sm font-bold uppercase tracking-widest">
                  Cargando producto…
                </p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="m-8 p-6 bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 rounded-2xl flex items-center gap-3 text-[var(--color-error)]">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-bold">Error al cargar: {error}</p>
              </div>
            )}

            {/* Contenido */}
            {detail && !loading && (
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border-subtle)]">
                {/* ── COL IZQUIERDA: imagen + tienda ── */}
                <div className="p-6 space-y-5">
                  {/* Imagen */}
                  <div
                    className="relative aspect-square overflow-hidden w-full"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '1.25rem',
                    }}
                  >
                    <Image
                      src={imgSrc(detail)}
                      alt={detail.name}
                      fill
                      sizes="280px"
                      className="object-contain p-4"
                    />
                    {/* Badge tipo */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-[var(--icons-green)] text-white rounded-full">
                      {detail.type}
                    </span>
                  </div>

                  {/* Tienda */}
                  <div
                    className="p-4 space-y-2"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '1rem',
                    }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-1.5 mb-3">
                      <Store className="w-3 h-3" /> Vendedor
                    </p>
                    <p className="font-black text-[var(--text-primary)] text-sm">
                      {detail.store.name}
                    </p>
                    {detail.store.email && (
                      <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> {detail.store.email}
                      </p>
                    )}
                    {detail.store.phone && (
                      <p className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> {detail.store.phone}
                      </p>
                    )}
                  </div>

                  {/* Rating */}
                  {detail.rating.count > 0 && (
                    <div
                      className="p-4 flex items-center gap-3"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1rem',
                      }}
                    >
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-black text-[var(--text-primary)]">
                        {detail.rating.average.toFixed(1)}
                      </span>
                      <span className="text-[11px] text-[var(--text-secondary)]">
                        ({detail.rating.count} reseñas)
                      </span>
                    </div>
                  )}
                </div>

                {/* ── COL DERECHA: toda la info ── */}
                <div className="p-6 space-y-6">
                  {/* Nombre + categorías */}
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {detail.categories.map((c) => (
                        <span
                          key={c.slug}
                          className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full"
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <Tag className="w-2.5 h-2.5 inline mr-1" />
                          {c.name}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] leading-tight uppercase tracking-tight">
                      {detail.name}
                    </h3>
                    {detail.short_description && (
                      <p className="text-[12px] text-[var(--text-secondary)] mt-1 font-medium italic">
                        {detail.short_description}
                      </p>
                    )}
                  </div>

                  {/* Precio + stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      className="p-3 text-center"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.75rem',
                      }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                        Precio
                      </p>
                      <p className="text-lg font-black text-[var(--icons-green)]">
                        {fmt(detail.price)}
                      </p>
                    </div>
                    <div
                      className="p-3 text-center"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '0.75rem',
                      }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                        Stock
                      </p>
                      <p className="text-lg font-black text-[var(--text-primary)]">
                        {detail.stock}
                      </p>
                    </div>
                    <div
                      className="p-3 text-center"
                      style={{
                        background: detail.in_stock
                          ? 'rgba(34,197,94,.08)'
                          : 'rgba(239,68,68,.08)',
                        border: `1px solid ${detail.in_stock ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                        borderRadius: '0.75rem',
                      }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-1">
                        Estado
                      </p>
                      <p
                        className={`text-[11px] font-black ${detail.in_stock ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}
                      >
                        {detail.in_stock ? 'En stock' : 'Sin stock'}
                      </p>
                    </div>
                  </div>

                  {/* Info básica */}
                  <div
                    className="p-4"
                    style={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '1rem',
                    }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
                      <Info className="w-3 h-3" /> Datos del producto
                    </p>
                    {detail.sku && (
                      <InfoRow
                        label="SKU"
                        value={<span className="font-mono">{detail.sku}</span>}
                      />
                    )}
                    {detail.weight && (
                      <InfoRow
                        label="Peso"
                        value={
                          <span className="flex items-center gap-1">
                            <Weight className="w-3 h-3" /> {detail.weight} kg
                          </span>
                        }
                      />
                    )}
                    {detail.dimensions && (
                      <InfoRow
                        label="Dimensiones"
                        value={
                          <span className="flex items-center gap-1">
                            <Ruler className="w-3 h-3" /> {detail.dimensions} cm
                          </span>
                        }
                      />
                    )}
                    {detail.expirationDate && (
                      <InfoRow
                        label="Vencimiento"
                        value={
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{' '}
                            {detail.expirationDate}
                          </span>
                        }
                      />
                    )}
                    <InfoRow
                      label="Creado"
                      value={
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(detail.created_at).toLocaleDateString(
                            'es-PE',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </span>
                      }
                    />
                    <InfoRow
                      label="ID"
                      value={
                        <span className="flex items-center gap-1 font-mono">
                          <Hash className="w-3 h-3" /> {detail.id}
                        </span>
                      }
                    />
                  </div>

                  {/* Descripción */}
                  {detail.description && (
                    <div
                      className="p-4"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1rem',
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-2 flex items-center gap-1.5">
                        <ShoppingBag className="w-3 h-3" /> Descripción
                      </p>
                      <p className="text-[12px] text-[var(--text-primary)] leading-relaxed font-medium">
                        {detail.description}
                      </p>
                    </div>
                  )}

                  {/* Características */}
                  {detail.characteristics.length > 0 && (
                    <div
                      className="p-4"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1rem',
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                        Características
                      </p>
                      {detail.characteristics.map((c, i) => (
                        <InfoRow key={i} label={c.label} value={c.value} />
                      ))}
                    </div>
                  )}

                  {/* Info adicional */}
                  {detail.additional_info.length > 0 && (
                    <div
                      className="p-4"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1rem',
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3">
                        Información adicional
                      </p>
                      {detail.additional_info.map((a, i) => (
                        <InfoRow key={i} label={a.label} value={a.value} />
                      ))}
                    </div>
                  )}

                  {/* Información nutricional */}
                  {(detail.nutritional_info?.rows?.length ?? 0) > 0 && (
                    <div
                      className="p-4"
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '1rem',
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] mb-3 flex items-center gap-1.5">
                        <Leaf className="w-3 h-3 text-[var(--color-success)]" />{' '}
                        Información Nutricional
                      </p>
                      {detail.nutritional_info?.serving_note && (
                        <p className="text-[10px] italic text-[var(--text-secondary)] mb-3">
                          {detail.nutritional_info.serving_note}
                        </p>
                      )}
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr
                            className="text-[9px] font-black uppercase tracking-widest text-[var(--text-secondary)]"
                            style={{
                              borderBottom: '1px solid var(--border-subtle)',
                            }}
                          >
                            <th className="text-left pb-2">Nutriente</th>
                            <th className="text-center pb-2">Cantidad</th>
                            <th className="text-right pb-2">% VD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detail.nutritional_info?.rows?.map((row, i) => (
                            <tr
                              key={i}
                              style={{
                                borderBottom: '1px solid var(--border-subtle)',
                              }}
                            >
                              <td className="py-1.5 font-medium text-[var(--text-primary)]">
                                {row.label}
                              </td>
                              <td className="py-1.5 text-center text-[var(--icons-green)] font-bold flex items-center justify-center gap-1">
                                <Flame className="w-2.5 h-2.5" />
                                {row.value}
                              </td>
                              <td className="py-1.5 text-right text-[var(--text-secondary)]">
                                {row.daily_value ?? '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Rechazo previo */}
                  {rejectionReason && (
                    <div
                      className="p-4 flex items-start gap-3"
                      style={{
                        background: 'rgba(251,191,36,.08)',
                        border: '1px solid rgba(251,191,36,.25)',
                        borderRadius: '1rem',
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">
                          Rechazo anterior
                        </p>
                        <p className="text-[11px] text-[var(--text-secondary)]">
                          {rejectionReason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer: acciones ── */}
          {detail && !loading && (
            <div
              className="flex-shrink-0 px-4 py-4 sm:px-8 sm:py-5 border-t border-[var(--border-subtle)] space-y-4"
              style={{ background: 'var(--bg-secondary)' }}
            >
              {/* Selector de acción */}
              {!pendingAction && (
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingAction('APPROVED')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20 hover:bg-[var(--color-success)] hover:text-white"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Aprobar producto
                  </button>
                  <button
                    type="button"
                    onClick={() => setPendingAction('REJECTED')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 hover:bg-[var(--color-error)] hover:text-white"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar producto
                  </button>
                </div>
              )}

              {/* Confirmación de acción */}
              {pendingAction && (
                <div className="space-y-3">
                  <div
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest"
                    style={{
                      background:
                        pendingAction === 'APPROVED'
                          ? 'rgba(34,197,94,.1)'
                          : 'rgba(239,68,68,.1)',
                      border: `1px solid ${pendingAction === 'APPROVED' ? 'rgba(34,197,94,.2)' : 'rgba(239,68,68,.2)'}`,
                      color:
                        pendingAction === 'APPROVED'
                          ? 'rgb(34,197,94)'
                          : 'rgb(239,68,68)',
                    }}
                  >
                    {pendingAction === 'APPROVED' ? (
                      <>
                        <CheckCircle className="w-4 h-4" /> Confirmando
                        aprobación
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" /> Confirmando rechazo
                      </>
                    )}
                  </div>

                  {/* Motivo — requerido para rechazo, opcional para aprobación */}
                  {(() => {
                    const minLen = 10;
                    const tooShort = pendingAction === 'REJECTED' && reason.trim().length > 0 && reason.trim().length < minLen;
                    return (
                      <div>
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          rows={3}
                          placeholder={
                            pendingAction === 'REJECTED'
                              ? 'Motivo de rechazo (obligatorio, mín. 10 caracteres)…'
                              : 'Notas de auditoría (opcional)…'
                          }
                          required={pendingAction === 'REJECTED'}
                          className={`w-full p-3 text-[12px] font-medium text-[var(--text-primary)] bg-[var(--bg-card)] border rounded-xl resize-none focus:outline-none focus:ring-2 placeholder:text-[var(--text-secondary)] ${
                            tooShort
                              ? 'border-[var(--color-error)] focus:ring-[var(--color-error)]/20'
                              : 'border-[var(--border-subtle)] focus:ring-[var(--icons-green)]/20'
                          }`}
                        />
                        {pendingAction === 'REJECTED' && (
                          <p className={`text-[10px] font-bold mt-1.5 ${tooShort ? 'text-[var(--color-error)]' : 'text-[var(--text-secondary)]'}`}>
                            {tooShort
                              ? `Faltan ${minLen - reason.trim().length} caracteres para poder confirmar el rechazo.`
                              : `${reason.trim().length}/${minLen} caracteres mínimos`}
                          </p>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPendingAction(null);
                        setReason('');
                      }}
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card)] transition-all disabled:opacity-40"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirm}
                      disabled={
                        isSubmitting ||
                        (pendingAction === 'REJECTED' &&
                          reason.trim().length < 10)
                      }
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        pendingAction === 'APPROVED'
                          ? 'bg-[var(--color-success)] hover:bg-[var(--color-success)] text-white'
                          : 'bg-[var(--color-error)] hover:bg-[var(--color-error)] text-white'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{' '}
                          Procesando…
                        </>
                      ) : pendingAction === 'APPROVED' ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Confirmar
                          aprobación
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" /> Confirmar rechazo
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalsPortal>
  );
}
