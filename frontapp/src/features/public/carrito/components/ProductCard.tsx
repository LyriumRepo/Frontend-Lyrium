'use client';

import { Star, ShieldCheck, Leaf, Barcode, FolderOpen, Package } from 'lucide-react';
import { money, resolveImg, NO_IMAGE, ApiProduct } from '@/modules/cart/utils';

interface StarRatingProps { rating: number; total: number; }

function StarRating({ rating, total }: StarRatingProps) {
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
            <span className="text-slate-500 dark:text-[var(--text-muted)]">{rating.toFixed(1)} · {total}</span>
        </span>
    );
}

interface Props {
    product: ApiProduct;
    onAdd: (id: number | string) => void;
    onView: (id: number | string) => void;
}

export default function ProductCard({ product: p, onAdd, onView }: Props) {
    const finalPrice = Number(p.precio_final ?? p.precio_oferta ?? p.precio ?? 0);
    const basePrice = Number(p.precio ?? 0);
    const hasOffer = finalPrice > 0 && basePrice > 0 && finalPrice < basePrice;
    const pct = hasOffer
        ? (Number(p.descuento_pct ?? 0) || Math.round(((basePrice - finalPrice) / basePrice) * 100))
        : 0;

    const stock = Number(p.stock ?? 0);
    const outOfStock = p.estado_stock === 'out_of_stock' || stock <= 0;

    const rating = Number(p.rating_promedio ?? 0);
    const ratingTotal = Number(p.rating_total ?? 0);
    const cat = p.categoria_nombre ?? 'General';

    return (
        <article className="group flex flex-col rounded-3xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] transition-all duration-200 hover:border-sky-200 dark:hover:border-[var(--brand-sky)] hover:shadow-[0_18px_52px_rgba(2,132,199,.10)] dark:hover:shadow-[0_18px_52px_rgba(2,132,199,0.15)] hover:-translate-y-0.5">

            {/* Image */}
            <div className="relative">
                <button onClick={() => onView(p.id)} className="block w-full">
                    <div className="aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
                        <img
                            src={resolveImg(p.imagen_url)}
                            alt={p.nombre}
                            onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE; }}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition duration-300"
                        />
                    </div>
                </button>

                {/* Lyrium badge */}
                <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-white/85 dark:bg-[var(--bg-card)]/85 border border-sky-100 dark:border-[var(--border-subtle)] backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] shadow-sm">
                    <Leaf className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Lyrium
                </span>

                {/* Offer badge */}
                {hasOffer && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-emerald-600 text-white shadow">
                        -{pct}%
                    </span>
                )}

                {/* Quick add */}
                <button
                    onClick={() => onAdd(p.id)}
                    disabled={outOfStock}
                    title="Añadir rápido"
                    className="absolute bottom-3 right-3 w-11 h-11 rounded-2xl bg-white/95 dark:bg-[var(--bg-card)]/95 border border-sky-100 dark:border-[var(--border-subtle)] text-slate-700 dark:text-[var(--text-primary)] shadow-sm grid place-items-center hover:shadow transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <span className="text-xl text-sky-500 dark:text-[var(--brand-sky)]">+</span>
                </button>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <button onClick={() => onView(p.id)} className="text-left flex-1">
                        <p className="text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 min-h-[42px] text-sm font-medium">{p.nombre}</p>
                    </button>
                    {p.sku && (
                        <span className="shrink-0 text-[10px] px-2 py-1 rounded-full bg-gray-100 dark:bg-[var(--bg-muted)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-1">
                            <Barcode className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> {p.sku}
                        </span>
                    )}
                </div>

                {p.descripcion_corta && (
                    <p className="text-[11px] text-slate-400 dark:text-[var(--text-muted)] line-clamp-2">{p.descripcion_corta}</p>
                )}

                <div className="flex items-center justify-between gap-2 mt-auto pt-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-1">
                        <FolderOpen className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> {cat}
                    </span>
                    {ratingTotal > 0
                        ? <StarRating rating={rating} total={ratingTotal} />
                        : (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-500 dark:text-[var(--text-muted)] inline-flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" /> Verificado
                            </span>
                        )}
                </div>

                <div className="flex items-end justify-between mt-1">
                    <div>
                        <p className="text-emerald-700 dark:text-emerald-400 text-xl font-bold">{money(finalPrice)}</p>
                        {hasOffer
                            ? <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] line-through">{money(basePrice)}</p>
                            : <p className="text-xs text-transparent">-</p>
                        }
                    </div>
                    <span className={`text-xs inline-flex items-center gap-1 ${outOfStock ? 'text-rose-500' : 'text-slate-400 dark:text-[var(--text-muted)]'}`}>
                        <Package className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)]" />
                        {outOfStock ? 'Agotado' : stock ? `Stock: ${stock}` : 'Disponible'}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                        onClick={() => onAdd(p.id)}
                        disabled={outOfStock}
                        className="py-2.5 rounded-2xl bg-sky-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-sky-600 dark:hover:bg-sky-400 transition shadow-md shadow-sky-100 dark:shadow-sky-900/20 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px"
                    >
                        🛒 {outOfStock ? 'No disponible' : 'Añadir'}
                    </button>
                    <button
                        onClick={() => onView(p.id)}
                        className="py-2.5 rounded-2xl border border-sky-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-xs font-semibold text-slate-700 dark:text-[var(--text-primary)] inline-flex items-center justify-center gap-1.5 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition hover:-translate-y-px"
                    >
                        🔍 Ver
                    </button>
                </div>
            </div>
        </article>
    );
}
