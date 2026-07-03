'use client';

import { Star, ShieldCheck, Leaf, FolderOpen, Package } from 'lucide-react';

const NO_IMAGE = '/img/no-image.png';

function resolveImg(url?: string | null): string {
  if (!url) return NO_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/')) return url;
  return NO_IMAGE;
}

function formatPrice(n?: number | string | null): string {
  return 'S/ ' + Number(n ?? 0).toFixed(2);
}

export interface ProductCardData {
  id: number | string;
  name: string;
  slug: string;
  imageUrl: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  categoryName?: string;
  rating?: number;
  ratingCount?: number;
  stock: number;
  description?: string;
}

export function fromApiProduct(p: any): ProductCardData {
  const finalPrice = Number(p.precio_final ?? p.precio_oferta ?? p.precio ?? 0);
  const basePrice = Number(p.precio ?? 0);
  const hasOffer = finalPrice > 0 && basePrice > 0 && finalPrice < basePrice;
  const pct = hasOffer
    ? (Number(p.descuento_pct ?? 0) || Math.round(((basePrice - finalPrice) / basePrice) * 100))
    : 0;
  return {
    id: p.id,
    name: p.nombre,
    slug: p.slug ?? String(p.id),
    imageUrl: p.imagen_url,
    price: finalPrice,
    originalPrice: hasOffer ? basePrice : undefined,
    discountPercent: pct,
    categoryName: p.categoria_nombre,
    rating: Number(p.rating_promedio ?? 0),
    ratingCount: Number(p.rating_total ?? 0),
    stock: Number(p.stock ?? 0),
    description: p.descripcion_corta,
  };
}

export function fromLaravelProduct(p: any): ProductCardData {
  const imgSrc = p.images?.[0]?.medium ?? p.images?.[0]?.src ?? NO_IMAGE;
  const basePrice = Number(p.regular_price ?? 0);
  const salePrice = Number(p.price ?? 0);
  const hasOffer = basePrice > 0 && salePrice > 0 && salePrice < basePrice;
  const pct = hasOffer ? Math.round(((basePrice - salePrice) / basePrice) * 100) : 0;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: imgSrc,
    price: salePrice,
    originalPrice: hasOffer ? basePrice : undefined,
    discountPercent: pct,
    categoryName: p.categories?.[0]?.name,
    rating: Number(p.rating?.average ?? 0),
    ratingCount: Number(p.rating?.count ?? 0),
    stock: Number(p.stock ?? 0),
    description: p.short_description,
  };
}

interface ProductCardProps {
  product: ProductCardData;
  onAdd?: (id: number | string) => void;
  onView?: (id: number | string) => void;
  adding?: boolean;
  added?: boolean;
}

export default function ProductCard({ product: p, onAdd, onView, adding, added }: ProductCardProps) {
  const outOfStock = p.stock <= 0;
  const hasOffer = !!p.originalPrice && p.originalPrice > p.price;

  return (
    <article className="group flex flex-col rounded-3xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] transition-all duration-200 hover:border-sky-200 dark:hover:border-[var(--brand-sky)] hover:shadow-[0_18px_52px_rgba(2,132,199,.10)] dark:hover:shadow-[0_18px_52px_rgba(2,132,199,0.15)] hover:-translate-y-0.5">

      <div className="relative">
        {onView ? (
          <button onClick={() => onView(p.id)} className="block w-full">
            <div className="aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
              <img
                src={resolveImg(p.imageUrl)}
                alt={p.name}
                onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE; }}
                className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-300"
              />
            </div>
          </button>
        ) : (
          <div className="aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
            <img
              src={resolveImg(p.imageUrl)}
              alt={p.name}
              onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE; }}
              className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-300"
            />
          </div>
        )}

        <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/85 dark:bg-[var(--bg-card)]/85 border border-sky-100 dark:border-[var(--border-subtle)] backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] shadow-sm">
          <Leaf className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Lyrium
        </span>

        {hasOffer && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-emerald-600 text-white shadow">
            -{p.discountPercent}%
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Sin stock</span>
          </div>
        )}

        {!outOfStock && (
          <button
            onClick={() => onAdd?.(p.id)}
            disabled={outOfStock || adding}
            title="Añadir rápido"
            className="absolute bottom-3 right-3 w-11 h-11 rounded-2xl bg-white/95 dark:bg-[var(--bg-card)]/95 border border-sky-100 dark:border-[var(--border-subtle)] text-slate-700 dark:text-[var(--text-primary)] shadow-sm grid place-items-center hover:shadow transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {adding ? <span className="text-sm text-sky-500 dark:text-[var(--brand-sky)] animate-spin">⟳</span> : <span className="text-xl text-sky-500 dark:text-[var(--brand-sky)]">+</span>}
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        {onView ? (
          <button onClick={() => onView(p.id)} className="text-left">
            <p className="text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 text-sm font-medium">{p.name}</p>
          </button>
        ) : (
          <p className="text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 text-sm font-medium">{p.name}</p>
        )}

        {p.description && (
          <p className="text-[11px] text-slate-400 dark:text-[var(--text-muted)] line-clamp-2">{p.description}</p>
        )}

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-1">
            <FolderOpen className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> {p.categoryName ?? 'General'}
          </span>
          {p.ratingCount && p.ratingCount > 0
            ? (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full bg-gradient-to-r from-sky-500/10 to-lime-500/8 dark:from-sky-500/20 dark:to-lime-500/15 border border-sky-200/50 dark:border-sky-800/30">
                <span className="inline-flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${(p.rating ?? 0) >= i + 0.75 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                  ))}
                </span>
                <span className="text-slate-500 dark:text-[var(--text-muted)]">{(p.rating ?? 0).toFixed(1)} · {p.ratingCount}</span>
              </span>
            )
            : (
              <span className="text-[10px] px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-500 dark:text-[var(--text-muted)] inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Verificado
              </span>
            )}
        </div>

        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="text-emerald-700 dark:text-emerald-400 text-xl font-bold">{formatPrice(p.price)}</p>
            {hasOffer
              ? <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] line-through">{formatPrice(p.originalPrice)}</p>
              : <p className="text-xs text-transparent">-</p>
            }
          </div>
          <span className={`text-xs inline-flex items-center gap-1 ${outOfStock ? 'text-rose-500' : 'text-slate-400 dark:text-[var(--text-muted)]'}`}>
            <Package className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" />
            {outOfStock ? 'Agotado' : p.stock ? `Stock: ${p.stock}` : 'Disponible'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2">
          <button
            onClick={() => onAdd?.(p.id)}
            disabled={outOfStock || adding}
            className={`py-2.5 rounded-2xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition shadow-md shadow-sky-100 dark:shadow-sky-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px ${
              added
                ? 'bg-emerald-500 text-white'
                : 'bg-sky-500 text-white hover:bg-sky-600 dark:hover:bg-sky-400'
            }`}
          >
            {adding ? '⟳' : added ? '✓' : '🛒'} {outOfStock ? 'No disponible' : adding ? 'Agregando...' : added ? '¡Listo!' : 'Añadir'}
          </button>
          {onView && (
            <button
              onClick={() => onView?.(p.id)}
              className="py-2.5 rounded-2xl border border-sky-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-xs font-semibold text-slate-700 dark:text-[var(--text-primary)] inline-flex items-center justify-center gap-1.5 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition hover:-translate-y-px"
            >
              🔍 Ver
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
