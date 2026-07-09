'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Tag, Calendar, Check, Loader2, Leaf, Package, FolderOpen, Star, ShieldCheck, Barcode, ShoppingCart } from 'lucide-react';
import { Producto } from '@/types/public';
import TopMedalBadge from '@/components/ui/TopMedalBadge';
import { useAddToCart } from '@/features/public/product/hooks/useAddToCart';
import { money } from '@/modules/cart/utils';

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500' },
  promo: { label: 'Promo', class: 'bg-orange-500' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
  liquidacion: { label: 'Liquidación', class: 'bg-red-600' },
  descuento: { label: 'Dto.', class: 'bg-red-500' },
  bestseller: { label: 'Best Seller', class: 'bg-amber-500' },
  envio_gratis: { label: 'Envío Gratis', class: 'bg-teal-500' },
  organic: { label: 'Orgánico', class: 'bg-emerald-600' },
  natural: { label: 'Natural', class: 'bg-green-600' },
  eco: { label: 'Eco', class: 'bg-lime-600' },
  premium: { label: 'Premium', class: 'bg-purple-500' },
  vegan: { label: 'Vegano', class: 'bg-green-700' },
};

interface ProductGridProps {
  productos: Producto[];
  loading?: boolean;
  className?: string;
}

function StarRating({ estrellas, total }: { estrellas: string; total?: number }) {
  const rating = parseFloat(estrellas) || 0;
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-gradient-to-r from-sky-500/10 to-lime-500/8 dark:from-sky-500/20 dark:to-lime-500/15 border border-sky-200/50 dark:border-sky-800/30">
      <span className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${rating >= i + 0.75 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        ))}
      </span>
      <span className="text-slate-500 dark:text-[var(--text-muted)]">{rating.toFixed(1)}{total ? ` · ${total}` : ''}</span>
    </span>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function ProductCard({ producto }: { producto: Producto }) {
  const { addToCart, loading, addedToCart } = useAddToCart();
  const outOfStock = producto.stock === 0;
  const finalPrice = producto.precioOferta ?? producto.precio;
  const basePrice = producto.precioAnterior ?? producto.precio;
  const hasOffer = producto.precioOferta && producto.precioAnterior && producto.precioOferta < producto.precioAnterior;
  const pct = producto.descuento || (hasOffer ? Math.round((((producto.precioAnterior ?? 0) - (producto.precioOferta ?? 0)) / (producto.precioAnterior ?? 1)) * 100) : 0);

  return (
    <article className="group flex flex-col rounded-3xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] transition-all duration-200 hover:border-sky-200 dark:hover:border-[var(--brand-sky)] hover:shadow-[0_18px_52px_rgba(2,132,199,.10)] dark:hover:shadow-[0_18px_52px_rgba(2,132,199,0.15)] hover:-translate-y-0.5">
      <div className="relative">
        <Link href={producto.slug ? `/producto/${producto.slug}` : '#'} className="block w-full">
          <div className="aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
            <img
              src={producto.imagen || '/img/no-image.png'}
              alt={producto.titulo}
              onError={(e) => { (e.target as HTMLImageElement).src = '/img/no-image.png'; }}
              className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-300"
            />
          </div>
        </Link>

        {producto.store_logo_marketplace && (
          <div className="absolute top-3 left-3 z-10 w-20 h-20 rounded-full bg-white shadow-md overflow-hidden flex items-center justify-center">
            <img
              src={producto.store_logo_marketplace}
              alt="Logo tienda"
              className="w-[90%] h-[90%] object-contain rounded-full"
            />
          </div>
        )}

        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/85 dark:bg-[var(--bg-card)]/85 border border-sky-100 dark:border-[var(--border-subtle)] backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] shadow-sm">
          <Leaf className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Lyrium
        </span>

        {producto.tag && (
          <div className="absolute top-4 right-0 z-10">
            <div className={`flex flex-col items-center justify-center text-center leading-tight text-white w-[100px] h-[50px] pl-2 pr-1 rounded-l-full shadow-lg ${stickerConfig[producto.tag.toLowerCase()]?.class ?? 'bg-gray-500'}`}>
              <span className="text-[14px] font-extrabold uppercase tracking-wide line-clamp-2">
                {pct > 0 && (
                  <span className="text-[17px] font-black mt-0.5">-{pct}% </span>
                )}
                {stickerConfig[producto.tag.toLowerCase()]?.label ?? producto.tag}
              </span>
            </div>
          </div>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Sin stock</span>
          </div>
        )}

        <TopMedalBadge entityType="product" entityId={producto.id} size="xxl" className="absolute bottom-2 right-2 z-10" />
      </div>

      <div className="p-3 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <Link href={producto.slug ? `/producto/${producto.slug}` : '#'} className="text-left flex-1">
            <p className="text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 min-h-[36px] sm:min-h-[42px] text-[13px] sm:text-sm font-medium">
              {producto.titulo}
            </p>
          </Link>
          {(producto as any).sku && (
            <span className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-gray-100 dark:bg-[var(--bg-muted)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-1">
              <Barcode className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> {(producto as any).sku}
            </span>
          )}
        </div>

        {producto.descripcionCorta && (
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-[var(--text-muted)] line-clamp-2">{producto.descripcionCorta}</p>
        )}

        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-auto pt-1 sm:pt-2 flex-wrap">
          {producto.categoria && (
            <span className="text-[9px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-1 truncate max-w-full">
              <FolderOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" /> <span className="truncate">{producto.categoria}</span>
            </span>
          )}
          {producto.estrellas
            ? <StarRating estrellas={producto.estrellas} total={producto.reviews} />
            : (
              <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-500 dark:text-[var(--text-muted)] inline-flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Verificado
              </span>
            )}
        </div>

        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="text-emerald-700 dark:text-emerald-400 text-base sm:text-xl font-bold">{money(finalPrice)}</p>
            {hasOffer ? (
              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-[var(--text-muted)] line-through">{money(basePrice)}</p>
            ) : (
              <p className="text-[10px] sm:text-xs text-transparent">-</p>
            )}
          </div>
          <span className={`text-[10px] sm:text-xs inline-flex items-center gap-1 ${outOfStock ? 'text-rose-500' : 'text-slate-400 dark:text-[var(--text-muted)]'}`}>
            <Package className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 dark:text-[var(--brand-sky)]" />
            {outOfStock ? 'Agotado' : producto.stock ? `Stock: ${producto.stock}` : 'Disponible'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-2">
          <button
            onClick={(e) => { e.preventDefault(); if (outOfStock || loading) return; addToCart(producto.id); }}
            disabled={outOfStock || loading}
            className="py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-sky-500 text-white text-[10px] sm:text-xs font-semibold inline-flex items-center justify-center gap-1 sm:gap-1.5 hover:bg-sky-600 dark:hover:bg-sky-400 transition shadow-md shadow-sky-100 dark:shadow-sky-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px whitespace-nowrap px-1"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin shrink-0" />
            ) : addedToCart ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            ) : (
              <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            )}
            <span className="truncate">{loading ? '…' : addedToCart ? '¡Listo!' : outOfStock ? 'No disp.' : 'Añadir'}</span>
          </button>
          <Link
            href={producto.slug ? `/producto/${producto.slug}` : '#'}
            className="py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-sky-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-[10px] sm:text-xs font-semibold text-slate-700 dark:text-[var(--text-primary)] inline-flex items-center justify-center gap-1 sm:gap-1.5 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition hover:-translate-y-px"
          >
            🔍 Ver
          </Link>
        </div>
      </div>
    </article>
  );
}

function ServiceCard({ producto }: { producto: Producto }) {
  const durationMinutes = producto.duration_minutes || 60;
  const discount = producto.descuento || (producto.precioAnterior && producto.precioAnterior > producto.precio
    ? Math.round(((producto.precioAnterior - producto.precio) / producto.precioAnterior) * 100)
    : 0);

  return (
    <div className="group bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-sky-200 dark:hover:border-[#4A7C59]/40 transition-all duration-200 flex flex-col">
      {/* Header with image or gradient */}
      <Link href={producto.enlace || '#'} className="block relative h-28 sm:h-32 md:h-36 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.titulo}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-1.5 sm:px-2 py-0.5 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
        {producto.tag && (
          <span className={`absolute top-2 right-2 sm:top-3 sm:right-3 text-white text-[9px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${stickerConfig[producto.tag.toLowerCase()]?.class ?? 'bg-gray-500'}`}>
            {stickerConfig[producto.tag.toLowerCase()]?.label ?? producto.tag}
          </span>
        )}
        <TopMedalBadge entityType="service" entityId={producto.id} size="md" className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-10" />
      </Link>

      {/* Info */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-1 sm:gap-1.5 flex-1">
        <Link href={producto.enlace || '#'}>
          <p className="text-[13px] sm:text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight">
            {producto.titulo}
          </p>
        </Link>

        {producto.descripcion && (
          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-[var(--text-secondary)] line-clamp-2">
            {producto.descripcion}
          </p>
        )}

        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-400 dark:text-[var(--text-secondary)] mt-auto flex-wrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            {formatDuration(durationMinutes)}
          </span>
          {producto.vendedor?.nombre && (
            <span className="flex items-center gap-1 truncate min-w-0">
              <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
              <span className="truncate">{producto.vendedor.nombre}</span>
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 sm:gap-2 mt-1">
          <span className="text-sky-600 dark:text-[var(--pd-accent2)] font-black text-sm sm:text-base">
            S/{(producto.precioOferta ?? producto.precio).toFixed(2)}
          </span>
          {(producto.precioAnterior && producto.precioAnterior > (producto.precioOferta ?? producto.precio)) && (
            <span className="text-[10px] sm:text-xs text-gray-400 line-through">
              S/{producto.precioAnterior.toFixed(2)}
            </span>
          )}
        </div>

        <Link
          href={producto.enlace || '#'}
          className="block w-full text-center py-1.5 sm:py-2 rounded-xl bg-sky-50 dark:bg-[var(--pd-accent2)]/20 text-sky-600 dark:text-[var(--pd-accent2)] text-[10px] sm:text-xs font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white dark:hover:bg-[var(--pd-accent2)] dark:hover:text-white transition-all mt-1"
        >
          <span className="flex items-center justify-center gap-1 sm:gap-1.5">
            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Agendar cita
          </span>
        </Link>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-2.5 sm:p-3 space-y-2 sm:space-y-3">
        <div className="h-2.5 sm:h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-3.5 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-7 sm:h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
      </div>
    </div>
  );
}

export default function ProductGrid({ productos, loading = false, className = '' }: ProductGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-10 sm:py-14 md:py-16 px-4">
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-3 sm:mb-4">
          <span className="text-3xl sm:text-4xl">📦</span>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-[var(--text-primary)] mb-1.5 sm:mb-2">
          Inventario vacío por ahora
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Estamos preparando los mejores productos para ti. 
          Pronto tendrás acceso a nuestra selección completa en esta categoría.
        </p>
        <Link 
          href="/" 
          className="inline-block mt-5 sm:mt-6 px-5 sm:px-6 py-2 text-sm bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
        >
          Explorar otras categorías
        </Link>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 ${className}`}>
      {productos.map((producto) =>
        producto.tipo === 'service' ? (
          <ServiceCard key={producto.id} producto={producto} />
        ) : (
          <ProductCard key={producto.id} producto={producto} />
        )
      )}
    </div>
  );
}