// app/(public)/producto/[slug]/ProductDetailPageClient.tsx
'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  ShoppingCart,
  Store,
  Package,
  Weight,
  Ruler,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  RotateCcw,
  BadgeCheck,
  Tag,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  Check,
  MessageSquare,
  Download,
  Clock,
  MapPin,
  Flame,
  Leaf,
  ChevronDown,
} from 'lucide-react';
import type {
  LaravelProduct,
  LaravelReview,
  ReviewStats,
} from '@/features/public/product/types';
import { useAddToCart } from '@/features/public/product/hooks/useAddToCart';
import { useReviews } from '@/features/public/product/hooks/useReview';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  return `S/ ${price.toFixed(2)}`;
}

function discountPercent(price: number, regular: number) {
  if (!regular || regular <= price) return 0;
  return Math.round(((regular - price) / regular) * 100);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ─── Galería ──────────────────────────────────────────────────────────────────

function ProductGallery({
  images,
  name,
}: {
  images: LaravelProduct['images'];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const prev = useCallback(
    () => setActive((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setActive((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length],
  );
  const src =
    images[active]?.large ??
    images[active]?.medium ??
    images[active]?.src ??
    '/no-image.png';

  return (
    <div className="space-y-3">
      {/* Imagen principal */}
      <div className="relative aspect-square overflow-hidden bg-[#f2f0ea] border border-[rgba(15,14,12,0.08)] group">
        <Image
          key={src}
          src={src}
          alt={images[active]?.alt ?? name}
          fill
          sizes="(max-width:768px) 100vw,40vw"
          className="object-contain p-8 transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          priority
        />

        {/* Flechas de navegación */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Anterior"
              className="
                absolute left-3 top-1/2 -translate-y-1/2
                w-9 h-9 bg-white border border-[rgba(15,14,12,0.1)]
                flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                text-[#3a3935] hover:bg-[#f2f0ea]
              "
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              aria-label="Siguiente"
              className="
                absolute right-3 top-1/2 -translate-y-1/2
                w-9 h-9 bg-white border border-[rgba(15,14,12,0.1)]
                flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity duration-200
                text-[#3a3935] hover:bg-[#f2f0ea]
              "
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Contador */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 text-[10px] tracking-[.06em] text-[#7a7970]">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`
                relative w-[60px] h-[60px] flex-shrink-0 overflow-hidden
                border transition-all duration-200
                ${
                  i === active
                    ? 'border-[#0f0e0c]'
                    : 'border-transparent opacity-50 hover:opacity-100 hover:border-[rgba(15,14,12,0.3)]'
                }
              `}
            >
              <Image
                src={img.thumb ?? img.src}
                alt={img.alt ?? name}
                fill
                sizes="60px"
                className="object-contain p-1 bg-[#f2f0ea]"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'w-[14px] h-[14px]' : 'w-[13px] h-[13px]';
  return (
    <div className="flex gap-[2px]">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${sz} ${
            n <= Math.round(value)
              ? 'text-[#c9a84c] fill-[#c9a84c]'
              : 'text-[#e8e5dc] fill-[#e8e5dc]'
          }`}
        />
      ))}
    </div>
  );
}

// ─── Sticker ──────────────────────────────────────────────────────────────────

const STICKER_MAP: Record<string, { label: string; className: string }> = {
  oferta: { label: 'Oferta', className: 'bg-[#c0392b] text-white' },
  liquidacion: { label: 'Liquidación', className: 'bg-[#c0392b] text-white' },
  nuevo: { label: 'Nuevo', className: 'bg-[#1a3a2a] text-[#e8f5ee]' },
  bestseller: { label: 'Más vendido', className: 'bg-[#3a3935] text-white' },
  envio_gratis: {
    label: 'Envío gratis',
    className: 'bg-[#1a3a2a] text-[#e8f5ee]',
  },
  descuento: { label: 'Descuento', className: 'bg-[#c9a84c] text-[#0f0e0c]' },
};

function StickerBadge({ sticker }: { sticker: string | null }) {
  if (!sticker) return null;
  const cfg = STICKER_MAP[sticker] ?? {
    label: sticker,
    className: 'bg-[#3a3935] text-white',
  };
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-[3px] text-[10px] font-medium tracking-[.1em] uppercase
        ${cfg.className}
      `}
    >
      <Tag className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

// ─── Ficha nutricional (colapsable) ───────────────────────────────────────────

function NutritionalPanel({
  info,
}: {
  info: NonNullable<LaravelProduct['nutritional_info']>;
}) {
  const [open, setOpen] = useState(false);
  const calorieRow = info.rows.find((r) =>
    r.label.toLowerCase().includes('caloría'),
  );

  return (
    <div className="border border-[rgba(15,14,12,0.1)]">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="
          w-full flex items-center justify-between
          px-4 py-3
          hover:bg-[#f2f0ea] transition-colors duration-150
        "
      >
        <div className="flex items-center gap-2.5">
          <Leaf className="w-4 h-4 text-[#2d5e42]" />
          <span className="text-[11px] font-medium tracking-[.1em] uppercase text-[#3a3935]">
            Información nutricional
          </span>
          {calorieRow && (
            <span className="flex items-center gap-1 px-2 py-[2px] bg-[#1a3a2a] text-[#e8f5ee] text-[10px] tracking-[.06em]">
              <Flame className="w-2.5 h-2.5" />
              {calorieRow.value}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-[#7a7970] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Contenido expandible */}
      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className="border-t border-[rgba(15,14,12,0.08)]">
          {info.serving_note && (
            <p className="px-4 py-2 text-[11px] text-[#7a7970] italic bg-[#f2f0ea] border-b border-[rgba(15,14,12,0.08)]">
              {info.serving_note}
            </p>
          )}
          <table className="w-full text-[12px]">
            <thead>
              <tr className="bg-[#f2f0ea]">
                <th className="px-4 py-2 text-left text-[10px] font-medium tracking-[.1em] uppercase text-[#7a7970]">
                  Nutriente
                </th>
                <th className="px-4 py-2 text-center text-[10px] font-medium tracking-[.1em] uppercase text-[#7a7970]">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-right text-[10px] font-medium tracking-[.1em] uppercase text-[#7a7970]">
                  % VD
                </th>
              </tr>
            </thead>
            <tbody>
              {info.rows.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-[rgba(15,14,12,0.05)] hover:bg-[#f2f0ea] transition-colors"
                >
                  <td className="px-4 py-2.5 font-medium text-[#3a3935]">
                    {row.label}
                  </td>
                  <td className="px-4 py-2.5 text-center font-medium text-[#2d5e42]">
                    {row.value}
                  </td>
                  <td className="px-4 py-2.5 text-right text-[#7a7970]">
                    {row.daily_value ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Características ──────────────────────────────────────────────────────────

function CharacteristicsTable({
  characteristics,
  additional_info,
}: {
  characteristics: LaravelProduct['characteristics'];
  additional_info: LaravelProduct['additional_info'];
}) {
  const hasMain = characteristics.length > 0;
  const hasAdditional = additional_info.length > 0;

  if (!hasMain && !hasAdditional) {
    return (
      <p className="text-[#7a7970] italic text-sm">
        Sin características especificadas.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {hasMain && (
        <div>
          <h4 className="text-[10px] font-medium tracking-[.12em] uppercase text-[#7a7970] mb-3">
            Características principales
          </h4>
          <table className="w-full text-[13px] border-collapse">
            <tbody>
              {characteristics.map((attr, i) => (
                <tr
                  key={i}
                  className="border-b border-[rgba(15,14,12,0.06)] hover:bg-[#f2f0ea] transition-colors"
                >
                  <td className="py-2.5 pr-4 text-[#7a7970] font-light w-2/5">
                    {attr.label}
                  </td>
                  <td className="py-2.5 text-[#0f0e0c] font-medium">
                    {attr.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {hasAdditional && (
        <div>
          <h4 className="text-[10px] font-medium tracking-[.12em] uppercase text-[#7a7970] mb-3">
            Información adicional
          </h4>
          <div className="flex flex-wrap gap-2">
            {additional_info.map((attr, i) => (
              <span
                key={i}
                className="
                  inline-flex items-center gap-1.5
                  px-3 py-1.5 border border-[#2d5e42]
                  text-[#2d5e42] text-[11px] tracking-[.06em]
                "
              >
                <span className="opacity-60">{attr.label}:</span>
                <span>{attr.value}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Distribución de rating ───────────────────────────────────────────────────

function RatingDistribution({ stats }: { stats: ReviewStats }) {
  const max = Math.max(...Object.values(stats.distribution), 1);
  return (
    <div className="space-y-1.5">
      {([5, 4, 3, 2, 1] as const).map((n) => {
        const count = stats.distribution[n] ?? 0;
        const pct = Math.round((count / max) * 100);
        return (
          <div key={n} className="flex items-center gap-2 text-[11px]">
            <span className="w-3 text-right text-[#7a7970]">{n}</span>
            <Star className="w-2.5 h-2.5 text-[#c9a84c] fill-[#c9a84c] flex-shrink-0" />
            <div className="flex-1 h-[4px] bg-[#e8e5dc]">
              <div
                className="h-full bg-[#c9a84c] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-5 text-right text-[#7a7970]">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tarjeta de reseña ────────────────────────────────────────────────────────

function ReviewCard({ review }: { review: LaravelReview }) {
  return (
    <div className="py-5 border-b border-[rgba(15,14,12,0.08)] last:border-0">
      <div className="flex items-center gap-3 mb-2.5">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#f2f0ea] border border-[rgba(15,14,12,0.1)] flex items-center justify-center flex-shrink-0 text-[#3a3935] font-medium text-[13px] overflow-hidden">
          {review.user?.avatar ? (
            <Image
              src={review.user.avatar}
              alt={review.user.name}
              width={36}
              height={36}
              className="rounded-full object-cover"
            />
          ) : (
            (review.user?.name?.charAt(0).toUpperCase() ?? '?')
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[13px] text-[#0f0e0c]">
              {review.user?.name ?? 'Usuario'}
            </span>
            {review.isVerifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-[10px] tracking-[.08em] uppercase text-[#2d5e42]">
                <BadgeCheck className="w-3 h-3" />
                Compra verificada
              </span>
            )}
          </div>
        </div>

        <span className="text-[11px] text-[#7a7970] ml-auto flex-shrink-0">
          {formatDate(review.createdAt)}
        </span>
      </div>

      <Stars value={review.rating} />

      {review.title && (
        <p className="mt-2 font-medium text-[13px] text-[#0f0e0c]">
          {review.title}
        </p>
      )}
      {review.comment && (
        <p className="mt-1 text-[12px] text-[#3a3935] leading-relaxed font-light">
          {review.comment}
        </p>
      )}
    </div>
  );
}

// ─── Sección de reseñas ───────────────────────────────────────────────────────

function ReviewsSection({ productId }: { productId: string }) {
  const { reviews, stats, pagination, loading, error, loadMore } =
    useReviews(productId);

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="w-5 h-5 animate-spin text-[#7a7970]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-[13px] text-[#c0392b] py-4">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-[auto_1fr] gap-6 p-5 bg-[#f2f0ea] border border-[rgba(15,14,12,0.08)]">
          <div className="flex flex-col items-center justify-center gap-1.5 border-r border-[rgba(15,14,12,0.08)] pr-6">
            <span className="font-['DM_Serif_Display',Georgia,serif] text-5xl text-[#0f0e0c] leading-none">
              {stats.average.toFixed(1)}
            </span>
            <Stars value={stats.average} size="md" />
            <span className="text-[11px] text-[#7a7970] tracking-[.04em]">
              {stats.count} {stats.count === 1 ? 'reseña' : 'reseñas'}
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-full">
              <RatingDistribution stats={stats} />
            </div>
          </div>
        </div>
      )}

      {/* Lista */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-[#7a7970]">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-[13px]">Sin reseñas aún</p>
          <p className="text-[12px] mt-1 font-light">
            Sé el primero en dejar una opinión.
          </p>
        </div>
      ) : (
        <div>
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}

      {pagination?.hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className="
            w-full py-3 border border-[rgba(15,14,12,0.12)]
            text-[11px] font-medium tracking-[.1em] uppercase text-[#7a7970]
            hover:bg-[#f2f0ea] hover:text-[#0f0e0c]
            transition-all duration-150
            disabled:opacity-40
            flex items-center justify-center gap-2
          "
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {loading ? 'Cargando…' : 'Ver más reseñas'}
        </button>
      )}
    </div>
  );
}

// ─── Campos extra por tipo de producto ───────────────────────────────────────

function ProductTypeInfo({ product }: { product: LaravelProduct }) {
  if (product.type === 'digital') {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 bg-[#f2f0ea] border border-[rgba(15,14,12,0.08)]">
        <div className="flex items-center gap-2.5 text-[13px]">
          <Download className="w-4 h-4 text-[#2d5e42] flex-shrink-0" />
          <div>
            <p className="text-[10px] tracking-[.1em] uppercase text-[#7a7970]">
              Formato
            </p>
            <p className="font-medium text-[#3a3935]">
              {product.fileType?.toUpperCase() ?? '—'}
            </p>
          </div>
        </div>
        {product.downloadLimit && (
          <div className="flex items-center gap-2.5 text-[13px]">
            <Package className="w-4 h-4 text-[#2d5e42] flex-shrink-0" />
            <div>
              <p className="text-[10px] tracking-[.1em] uppercase text-[#7a7970]">
                Descargas
              </p>
              <p className="font-medium text-[#3a3935]">
                {product.downloadLimit}x
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (product.type === 'service') {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 bg-[#f2f0ea] border border-[rgba(15,14,12,0.08)]">
        <div className="flex items-center gap-2.5 text-[13px]">
          <Clock className="w-4 h-4 text-[#2d5e42] flex-shrink-0" />
          <div>
            <p className="text-[10px] tracking-[.1em] uppercase text-[#7a7970]">
              Duración
            </p>
            <p className="font-medium text-[#3a3935]">
              {product.serviceDuration} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 text-[13px]">
          <MapPin className="w-4 h-4 text-[#2d5e42] flex-shrink-0" />
          <div>
            <p className="text-[10px] tracking-[.1em] uppercase text-[#7a7970]">
              Modalidad
            </p>
            <p className="font-medium text-[#3a3935] capitalize">
              {product.serviceModality ?? '—'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!product.weight && !product.dimensions && !product.expirationDate)
    return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-[#f2f0ea] border border-[rgba(15,14,12,0.08)]">
      {product.weight && (
        <div className="flex items-center gap-2.5 text-[13px]">
          <Weight className="w-4 h-4 text-[#7a7970] flex-shrink-0" />
          <div>
            <p className="text-[10px] tracking-[.1em] uppercase text-[#7a7970]">
              Peso
            </p>
            <p className="font-medium text-[#3a3935]">{product.weight} kg</p>
          </div>
        </div>
      )}
      {product.dimensions && (
        <div className="flex items-center gap-2.5 text-[13px]">
          <Ruler className="w-4 h-4 text-[#7a7970] flex-shrink-0" />
          <div>
            <p className="text-[10px] tracking-[.1em] uppercase text-[#7a7970]">
              Dimensiones
            </p>
            <p className="font-medium text-[#3a3935]">{product.dimensions}</p>
          </div>
        </div>
      )}
      {product.expirationDate && (
        <div className="flex items-center gap-2.5 text-[13px]">
          <Calendar className="w-4 h-4 text-[#7a7970] flex-shrink-0" />
          <div>
            <p className="text-[10px] tracking-[.1em] uppercase text-[#7a7970]">
              Vence
            </p>
            <p className="font-medium text-[#3a3935]">
              {product.expirationDate}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sidebar: Productos relacionados ─────────────────────────────────────────

function RelatedProductsSidebar({ products }: { products: LaravelProduct[] }) {
  if (products.length === 0) return null;

  return (
    <aside className="w-full">
      <h2 className="text-[10px] font-medium tracking-[.12em] uppercase text-[#7a7970] mb-4 px-1">
        También te puede gustar
      </h2>
      <div className="divide-y divide-[rgba(15,14,12,0.08)]">
        {products.slice(0, 8).map((rel) => {
          const relDiscount = discountPercent(rel.price, rel.regular_price);
          return (
            <Link
              key={rel.id}
              href={`/producto/${rel.slug}`}
              className="flex gap-3 py-3 group hover:opacity-70 transition-opacity duration-150"
            >
              {/* Imagen */}
              <div className="relative w-[56px] h-[56px] flex-shrink-0 bg-[#f2f0ea] border border-[rgba(15,14,12,0.08)] overflow-hidden">
                <Image
                  src={
                    rel.images[0]?.medium ??
                    rel.images[0]?.src ??
                    '/no-image.png'
                  }
                  alt={rel.images[0]?.alt ?? rel.name}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-0.5">
                <p className="text-[12px] text-[#3a3935] line-clamp-2 leading-snug mb-1.5">
                  {rel.name}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-['DM_Serif_Display',Georgia,serif] text-[15px] text-[#0f0e0c]">
                    {formatPrice(rel.price)}
                  </span>
                  {relDiscount > 0 && (
                    <span className="text-[10px] font-medium text-[#c0392b]">
                      −{relDiscount}%
                    </span>
                  )}
                </div>
                {rel.rating.count > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-2.5 h-2.5 text-[#c9a84c] fill-[#c9a84c]" />
                    <span className="text-[10px] text-[#7a7970]">
                      {rel.rating.average.toFixed(1)} ({rel.rating.count})
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────

type TabKey = 'descripcion' | 'caracteristicas' | 'tienda' | 'comentarios';

interface Props {
  product: LaravelProduct;
  relatedProducts?: LaravelProduct[];
}

export function ProductDetailPageClient({
  product,
  relatedProducts = [],
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>('descripcion');
  const [wishlisted, setWishlisted] = useState(false);

  const {
    addToCart,
    loading: cartLoading,
    addedToCart,
    error: cartError,
  } = useAddToCart();

  const discount = discountPercent(product.price, product.regular_price);
  const inStock = product.in_stock;

  const hasNutritional = !!product.nutritional_info?.rows?.length;
  const hasCharacteristics =
    product.characteristics.length > 0 || product.additional_info.length > 0;

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'descripcion', label: 'Descripción' },
    {
      key: 'caracteristicas',
      label: hasNutritional ? 'Nutrición y características' : 'Características',
    },
    { key: 'tienda', label: 'Tienda' },
    { key: 'comentarios', label: `Reseñas (${product.rating.count})` },
  ];

  return (
    <main className="min-h-screen bg-[#faf9f6]">
      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-[rgba(15,14,12,0.08)]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-[11px] tracking-[.06em] text-[#7a7970] flex-wrap">
          <Link href="/" className="hover:text-[#1a3a2a] transition-colors">
            Inicio
          </Link>
          {product.categories[0] && (
            <>
              <span className="opacity-40">/</span>
              <Link
                href={`/productos/${product.categories[0].slug}`}
                className="hover:text-[#1a3a2a] transition-colors"
              >
                {product.categories[0].name}
              </Link>
            </>
          )}
          <span className="opacity-40">/</span>
          <span className="text-[#3a3935] truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Volver */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[11px] tracking-[.08em] uppercase text-[#7a7970] hover:text-[#1a3a2a] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver
        </Link>

        {/* ── Layout principal: 3 columnas ── */}
        <div className="flex flex-col xl:flex-row gap-10 xl:gap-12">
          {/* COL 1: Galería */}
          <div className="xl:w-[400px] flex-shrink-0">
            <div className="sticky top-4">
              <ProductGallery images={product.images} name={product.name} />
            </div>
          </div>

          {/* COL 2: Info + Tabs */}
          <div className="flex-1 min-w-0">
            {/* ── Info del producto ── */}
            <div className="flex flex-col gap-4">
              {/* Categorías + sticker */}
              <div className="flex flex-wrap items-center gap-2">
                {product.categories.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/productos/${cat.slug}`}
                    className="
                      text-[10px] tracking-[.1em] uppercase font-medium
                      text-[#2d5e42] border border-[#2d5e42]
                      px-2.5 py-[3px]
                      hover:bg-[#2d5e42] hover:text-white
                      transition-all duration-150
                    "
                  >
                    {cat.name}
                  </Link>
                ))}
                <StickerBadge sticker={product.sticker} />
              </div>

              {/* Nombre */}
              <h1
                className="
                  font-['DM_Serif_Display',Georgia,serif]
                  text-[32px] md:text-[38px] font-normal
                  text-[#0f0e0c] leading-[1.1]
                "
              >
                {product.name}
              </h1>

              {product.short_description && (
                <p className="text-[#7a7970] text-[13px] leading-relaxed font-light">
                  {product.short_description}
                </p>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2.5 pb-4 border-b border-[rgba(15,14,12,0.08)]">
                <Stars value={product.rating.average} />
                <span className="text-[12px] text-[#7a7970]">
                  {product.rating.average > 0
                    ? `${product.rating.average.toFixed(1)} · ${product.rating.count} reseñas`
                    : 'Sin reseñas aún'}
                </span>
              </div>

              {/* Precio */}
              <div>
                <p className="text-[10px] tracking-[.12em] uppercase text-[#7a7970] mb-1">
                  Precio
                </p>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-['DM_Serif_Display',Georgia,serif] text-[38px] text-[#0f0e0c] leading-none">
                    {formatPrice(product.price)}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-[16px] text-[#7a7970] line-through font-light">
                        {formatPrice(product.regular_price)}
                      </span>
                      <span className="bg-[#c0392b] text-white text-[10px] font-medium tracking-[.08em] px-2 py-[2px]">
                        −{discount}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Stock */}
              <div
                className={`flex items-center gap-2 text-[12px] tracking-[.04em] ${
                  inStock ? 'text-[#2d5e42]' : 'text-[#c0392b]'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    inStock ? 'bg-[#2d5e42]' : 'bg-[#c0392b]'
                  }`}
                />
                {inStock
                  ? `${product.stock} unidades disponibles`
                  : 'Sin stock'}
              </div>

              {/* Info física / digital / servicio */}
              <ProductTypeInfo product={product} />

              {/* Ficha nutricional */}
              {hasNutritional && (
                <NutritionalPanel info={product.nutritional_info!} />
              )}

              {/* Cantidad */}
              {inStock && (
                <div className="flex items-center gap-5">
                  <span className="text-[11px] tracking-[.1em] uppercase text-[#7a7970]">
                    Cantidad
                  </span>
                  <div className="flex items-center border border-[rgba(15,14,12,0.12)]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 flex items-center justify-center text-[#3a3935] hover:bg-[#f2f0ea] transition-colors text-lg"
                      aria-label="Reducir"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-[14px] font-medium text-[#0f0e0c]">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity((q) => Math.min(product.stock, q + 1))
                      }
                      className="w-9 h-9 flex items-center justify-center text-[#3a3935] hover:bg-[#f2f0ea] transition-colors text-lg"
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Error carrito */}
              {cartError && (
                <div className="flex items-center gap-2 text-[12px] text-[#c0392b] bg-[#fdf0ee] border border-[rgba(192,57,43,0.2)] px-3 py-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {cartError}
                </div>
              )}

              {/* Acciones */}
              <div className="flex gap-2">
                {/* Botón carrito */}
                <button
                  onClick={() => {
                    if (inStock && !cartLoading)
                      addToCart(Number(product.id), quantity);
                  }}
                  disabled={!inStock || cartLoading}
                  className={`
                    flex-1 flex items-center justify-center gap-2.5
                    font-medium text-[12px] tracking-[.1em] uppercase
                    py-3.5 px-6
                    transition-colors duration-150
                    disabled:opacity-50
                    ${
                      addedToCart
                        ? 'bg-[#1a5c34] text-[#e8f5ee]'
                        : inStock
                          ? 'bg-[#1a3a2a] text-[#e8f5ee] hover:bg-[#2d5e42]'
                          : 'bg-[#7a7970] text-white cursor-not-allowed'
                    }
                  `}
                >
                  {cartLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : addedToCart ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  {cartLoading
                    ? 'Agregando…'
                    : addedToCart
                      ? '¡Agregado!'
                      : inStock
                        ? 'Agregar al carrito'
                        : 'Sin stock'}
                </button>

                {/* Favoritos */}
                <button
                  onClick={() => setWishlisted((w) => !w)}
                  className={`
                    w-12 h-12 border flex items-center justify-center
                    transition-all duration-150
                    ${
                      wishlisted
                        ? 'border-[#c0392b] text-[#c0392b] bg-[#fdf0ee]'
                        : 'border-[rgba(15,14,12,0.12)] text-[#7a7970] hover:border-[#c0392b] hover:text-[#c0392b]'
                    }
                  `}
                  aria-label="Favoritos"
                >
                  <Heart
                    className={`w-[18px] h-[18px] ${wishlisted ? 'fill-current' : ''}`}
                  />
                </button>

                {/* Compartir */}
                <button
                  onClick={() =>
                    navigator.share?.({
                      title: product.name,
                      url: window.location.href,
                    })
                  }
                  className="
                    w-12 h-12 border border-[rgba(15,14,12,0.12)]
                    flex items-center justify-center text-[#7a7970]
                    hover:border-[#0f0e0c] hover:text-[#0f0e0c]
                    transition-all duration-150
                  "
                  aria-label="Compartir"
                >
                  <Share2 className="w-[18px] h-[18px]" />
                </button>
              </div>

              {/* Garantías */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Shield, text: 'Compra segura' },
                  { icon: Truck, text: 'Envío rápido' },
                  { icon: RotateCcw, text: 'Devoluciones' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="
                      flex flex-col items-center gap-1.5 p-3
                      border border-[rgba(15,14,12,0.08)]
                      bg-white text-center
                    "
                  >
                    <Icon className="w-4 h-4 text-[#2d5e42]" />
                    <span className="text-[10px] tracking-[.06em] uppercase text-[#7a7970]">
                      {text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card tienda */}
              <Link
                href={`/tienda/${product.store.slug}`}
                className="
                  flex items-center gap-4 p-4
                  border border-[rgba(15,14,12,0.08)] bg-white
                  hover:border-[#1a3a2a]
                  transition-colors duration-150 group
                "
              >
                <div className="w-11 h-11 bg-[#1a3a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {product.store.logo ? (
                    <Image
                      src={product.store.logo}
                      alt={product.store.name}
                      width={44}
                      height={44}
                      className="object-cover"
                    />
                  ) : (
                    <Store className="w-5 h-5 text-[#e8f5ee]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] tracking-[.08em] uppercase text-[#7a7970] mb-0.5">
                    Vendido por
                  </p>
                  <p className="font-medium text-[14px] text-[#0f0e0c] flex items-center gap-1">
                    {product.store.name}
                    <BadgeCheck className="w-3.5 h-3.5 text-[#2d5e42]" />
                  </p>
                  {product.store.phone && (
                    <p className="text-[11px] text-[#7a7970] mt-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {product.store.phone}
                    </p>
                  )}
                </div>
                <ArrowLeft className="w-4 h-4 text-[#7a7970] rotate-180 group-hover:text-[#1a3a2a] transition-colors" />
              </Link>
            </div>

            {/* ── Tabs ── */}
            <div className="mt-10">
              {/* Barra de tabs */}
              <div className="flex border-b border-[rgba(15,14,12,0.1)] mb-6 overflow-x-auto">
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`
                      px-5 py-3 text-[11px] tracking-[.1em] uppercase font-medium
                      border-b-[2px] -mb-px whitespace-nowrap
                      transition-all duration-150
                      ${
                        activeTab === key
                          ? 'border-[#0f0e0c] text-[#0f0e0c]'
                          : 'border-transparent text-[#7a7970] hover:text-[#3a3935]'
                      }
                    `}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Contenido de tabs */}
              <div className="bg-white border border-[rgba(15,14,12,0.08)] p-5 md:p-8">
                {/* Tab: Descripción */}
                {activeTab === 'descripcion' && (
                  <div className="space-y-4">
                    {product.description ? (
                      product.description.split('\n').map((p, i) => (
                        <p
                          key={i}
                          className="text-[#3a3935] leading-[1.9] text-[13px] font-light"
                        >
                          {p}
                        </p>
                      ))
                    ) : (
                      <p className="text-[#7a7970] italic text-[13px]">
                        Sin descripción disponible.
                      </p>
                    )}
                  </div>
                )}

                {/* Tab: Características / Nutrición */}
                {activeTab === 'caracteristicas' && (
                  <div className="space-y-8">
                    {hasNutritional && (
                      <div>
                        <h3 className="text-[10px] font-medium tracking-[.12em] uppercase text-[#7a7970] mb-4 flex items-center gap-2">
                          <Leaf className="w-3.5 h-3.5 text-[#2d5e42]" />
                          Información Nutricional
                        </h3>
                        <div className="border border-[rgba(15,14,12,0.08)] overflow-hidden">
                          {product.nutritional_info!.serving_note && (
                            <div className="bg-[#f2f0ea] px-4 py-2.5 border-b border-[rgba(15,14,12,0.08)]">
                              <p className="text-[11px] text-[#7a7970] italic">
                                {product.nutritional_info!.serving_note}
                              </p>
                            </div>
                          )}
                          <table className="w-full text-[12px]">
                            <thead className="bg-[#f2f0ea]">
                              <tr>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-[.1em] uppercase text-[#7a7970]">
                                  Nutriente
                                </th>
                                <th className="px-4 py-2.5 text-left text-[10px] font-medium tracking-[.1em] uppercase text-[#7a7970]">
                                  Cantidad
                                </th>
                                <th className="px-4 py-2.5 text-right text-[10px] font-medium tracking-[.1em] uppercase text-[#7a7970]">
                                  % VD*
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgba(15,14,12,0.05)]">
                              {product.nutritional_info!.rows.map((row, i) => (
                                <tr
                                  key={i}
                                  className="hover:bg-[#f2f0ea] transition-colors"
                                >
                                  <td className="px-4 py-2.5 font-medium text-[#3a3935]">
                                    {row.label}
                                  </td>
                                  <td className="px-4 py-2.5 text-[#2d5e42] font-medium">
                                    {row.value}
                                  </td>
                                  <td className="px-4 py-2.5 text-right text-[#7a7970]">
                                    {row.daily_value ?? '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {hasCharacteristics && (
                      <div>
                        {hasNutritional && (
                          <h3 className="text-[10px] font-medium tracking-[.12em] uppercase text-[#7a7970] mb-4">
                            Características
                          </h3>
                        )}
                        <CharacteristicsTable
                          characteristics={product.characteristics}
                          additional_info={product.additional_info}
                        />
                      </div>
                    )}

                    {!hasNutritional && !hasCharacteristics && (
                      <p className="text-[#7a7970] italic text-[13px]">
                        Sin información especificada.
                      </p>
                    )}
                  </div>
                )}

                {/* Tab: Tienda */}
                {activeTab === 'tienda' && (
                  <div className="flex items-start gap-5">
                    <div className="w-14 h-14 bg-[#1a3a2a] flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.store.logo ? (
                        <Image
                          src={product.store.logo}
                          alt={product.store.name}
                          width={56}
                          height={56}
                          className="object-cover"
                        />
                      ) : (
                        <Store className="w-7 h-7 text-[#e8f5ee]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-['DM_Serif_Display',Georgia,serif] text-[22px] font-normal text-[#0f0e0c] flex items-center gap-2 mb-3">
                        {product.store.name}
                        <BadgeCheck className="w-4 h-4 text-[#2d5e42]" />
                      </h3>
                      <div className="space-y-1.5">
                        {product.store.email && (
                          <p className="text-[12px] text-[#7a7970] flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            {product.store.email}
                          </p>
                        )}
                        {product.store.phone && (
                          <p className="text-[12px] text-[#7a7970] flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />
                            {product.store.phone}
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/tienda/${product.store.slug}`}
                        className="
                          inline-flex items-center gap-2 mt-4
                          border border-[rgba(15,14,12,0.12)]
                          px-4 py-2 text-[11px] tracking-[.08em] uppercase text-[#3a3935]
                          hover:bg-[#f2f0ea] transition-colors
                        "
                      >
                        <Store className="w-3.5 h-3.5" />
                        Ver tienda completa
                      </Link>
                    </div>
                  </div>
                )}

                {/* Tab: Comentarios */}
                {activeTab === 'comentarios' && (
                  <ReviewsSection productId={product.id} />
                )}
              </div>
            </div>
          </div>

          {/* COL 3: Relacionados (sidebar derecha, solo en xl) */}
          <div className="hidden xl:block xl:w-[220px] flex-shrink-0">
            <div className="sticky top-4">
              <RelatedProductsSidebar products={relatedProducts} />
            </div>
          </div>
        </div>

        {/* Relacionados en mobile/lg (abajo, grid) */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 xl:hidden">
            <h2 className="text-[10px] font-medium tracking-[.12em] uppercase text-[#7a7970] mb-5">
              También te puede gustar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.slice(0, 8).map((rel) => (
                <Link
                  key={rel.id}
                  href={`/producto/${rel.slug}`}
                  className="
                    group bg-white border border-[rgba(15,14,12,0.08)]
                    overflow-hidden
                    hover:border-[#1a3a2a]
                    transition-colors duration-150
                  "
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f2f0ea]">
                    <Image
                      src={
                        rel.images[0]?.medium ??
                        rel.images[0]?.src ??
                        '/no-image.png'
                      }
                      alt={rel.images[0]?.alt ?? rel.name}
                      fill
                      sizes="(max-width:768px) 50vw,25vw"
                      className="object-contain p-3 group-hover:scale-[1.04] transition-transform duration-300"
                    />
                    {rel.sticker && (
                      <div className="absolute top-0 left-0">
                        <StickerBadge sticker={rel.sticker} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] text-[#3a3935] line-clamp-2 leading-snug">
                      {rel.name}
                    </p>
                    <p className="font-['DM_Serif_Display',Georgia,serif] text-[16px] text-[#0f0e0c] mt-1.5">
                      {formatPrice(rel.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
