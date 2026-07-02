'use client';

import { Star, ShieldCheck, Leaf, Barcode, FolderOpen, Package } from 'lucide-react';
import { money, resolveImg, NO_IMAGE, ApiProduct } from '@/modules/cart/utils';

interface StarRatingProps { rating: number; total: number; }

function StarRating({ rating, total }: StarRatingProps) {
    return (
        <span className="inline-flex items-center gap-0.5 min-[360px]:gap-1 text-[8px] min-[360px]:text-[11px] px-1 py-0.5 min-[360px]:px-2 min-[360px]:py-1 rounded-full bg-gradient-to-r from-sky-500/10 to-lime-500/8 dark:from-sky-500/20 dark:to-lime-500/15 border border-sky-200/50 dark:border-sky-800/30 max-w-full">
            <span className="hidden min-[360px]:inline-flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-3 h-3 ${rating >= i + 0.75 ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                    />
                ))}
            </span>
            <span className="inline-flex min-[360px]:hidden items-center gap-0.5">
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
            </span>
            <span className="text-slate-500 dark:text-[var(--text-muted)] truncate">
                {rating.toFixed(1)}
                <span className="inline min-[360px]:hidden"> ({total})</span>
                <span className="hidden min-[360px]:inline"> · {total}</span>
            </span>
        </span>
    );
}

const stickerConfig: Record<string, { label: string; class: string }> = {
    oferta: { label: 'Oferta', class: 'bg-red-500' },
    promo: { label: 'Promo', class: 'bg-orange-500' },
    nuevo: { label: 'Nuevo', class: 'bg-green-500' },
    limitado: { label: 'Limitado', class: 'bg-purple-500' },
    liquidacion: { label: 'Liquidación', class: 'bg-red-600' },
    descuento: { label: 'Descuento', class: 'bg-red-500' },
    bestseller: { label: 'Best Seller', class: 'bg-amber-500' },
    envio_gratis: { label: 'Envío Gratis', class: 'bg-teal-500' },
    organic: { label: 'Orgánico', class: 'bg-emerald-600' },
    natural: { label: 'Natural', class: 'bg-green-600' },
    eco: { label: 'Eco', class: 'bg-lime-600' },
    premium: { label: 'Premium', class: 'bg-purple-500' },
    vegan: { label: 'Vegano', class: 'bg-green-700' },
};

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

    const formatCompactMoney = (val: number) => {
        return money(val).replace(/[.,]00$/, '');
    };

    return (
        <article className="group flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] transition-all duration-200 hover:border-sky-200 dark:hover:border-[var(--brand-sky)] hover:shadow-[0_18px_52px_rgba(2,132,199,.10)] dark:hover:shadow-[0_18px_52px_rgba(2,132,199,0.15)] hover:-translate-y-0.5">

            <div className="relative">
                <button onClick={() => onView(p.id)} className="block w-full">
                    <div className="aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
                        <img
                            src={resolveImg(p.imagen_url)}
                            alt={p.nombre}
                            onError={(e) => { (e.target as HTMLImageElement).src = NO_IMAGE; }}
                            className="w-full h-full object-contain md:object-cover group-hover:scale-[1.05] transition duration-300"
                        />
                    </div>
                </button>

                <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-0.5 text-[8px] sm:text-[11px] px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/85 dark:bg-[var(--bg-card)]/85 border border-sky-100 dark:border-[var(--border-subtle)] backdrop-blur-sm text-slate-700 dark:text-[var(--text-primary)] shadow-sm">
                    <Leaf className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" />
                    <span className="hidden min-[360px]:inline">Lyrium</span>
                </span>

                <div className="absolute top-1.5 right-1.5 flex flex-col items-end gap-1 z-10">
                    {hasOffer && (
                        <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[11px] px-1.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-600 text-white shadow">
                            -{pct}%
                        </span>
                    )}

                    {p.tag && (
                        <span className={`text-white text-[8px] sm:text-xs font-bold px-1.5 py-0.5 sm:py-1 rounded-full ${stickerConfig[p.tag.toLowerCase()]?.class ?? 'bg-gray-500'}`}>
                            {stickerConfig[p.tag.toLowerCase()]?.label ?? p.tag}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => onAdd(p.id)}
                    disabled={outOfStock}
                    title="Añadir rápido"
                    className="absolute bottom-3 right-3 w-11 h-11 rounded-2xl bg-white/95 dark:bg-[var(--bg-card)]/95 border border-sky-100 dark:border-[var(--border-subtle)] text-slate-700 dark:text-[var(--text-primary)] shadow-sm grid place-items-center hover:shadow transition disabled:opacity-40 disabled:cursor-not-allowed hidden sm:grid"
                >
                    <span className="text-xl text-sky-500 dark:text-[var(--brand-sky)]">+</span>
                </button>
            </div>

            <div className="p-1.5 sm:p-4 flex flex-col gap-1.5 sm:gap-2 flex-1 min-w-0">
                <div className="flex flex-col gap-1">
                    <button onClick={() => onView(p.id)} className="text-left w-full">
                        <p className="text-slate-800 dark:text-[var(--text-primary)] leading-snug line-clamp-2 min-h-[24px] min-[360px]:min-h-[30px] sm:min-h-[40px] text-[9px] min-[360px]:text-[11px] sm:text-sm font-medium">{p.nombre}</p>
                    </button>
                    {p.sku && (
                        <span className="self-start text-[7.5px] min-[360px]:text-[8px] sm:text-[10px] px-1 py-0.5 min-[360px]:px-1.5 sm:px-2 sm:py-1 rounded-full bg-gray-100 dark:bg-[var(--bg-muted)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-0.5 min-[360px]:gap-1 max-w-full">
                            <Barcode className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" />
                            <span className="truncate">{p.sku}</span>
                        </span>
                    )}
                </div>

                {p.descripcion_corta && (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-[var(--text-muted)] line-clamp-2 hidden sm:block">{p.descripcion_corta}</p>
                )}

                {/* Desktop badges */}
                <div className="hidden sm:flex flex-col gap-1 mt-auto pt-2">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-1 self-start max-w-full">
                        <FolderOpen className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" />
                        <span className="truncate">{cat}</span>
                    </span>
                    {ratingTotal > 0 ? (
                        <div className="self-start">
                            <StarRating rating={rating} total={ratingTotal} />
                        </div>
                    ) : (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-500 dark:text-[var(--text-muted)] inline-flex items-center gap-1 self-start">
                            <ShieldCheck className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" /> Verificado
                        </span>
                    )}
                </div>

                {/* Mobile badges */}
                <div className="flex flex-wrap items-center gap-1 mt-auto pt-1 sm:hidden">
                    <span className="text-[7.5px] min-[360px]:text-[9px] px-1 py-0.5 min-[360px]:px-1.5 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-600 dark:text-[var(--text-secondary)] inline-flex items-center gap-0.5 min-[360px]:gap-1 max-w-full">
                        <FolderOpen className="w-2.5 h-2.5 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" />
                        <span className="truncate">{cat}</span>
                    </span>
                    {ratingTotal > 0 ? (
                        <StarRating rating={rating} total={ratingTotal} />
                    ) : (
                        <span className="text-[7.5px] min-[360px]:text-[8px] px-1 py-0.5 min-[360px]:px-1.5 rounded-full bg-slate-50 dark:bg-[var(--bg-muted)] border border-slate-100 dark:border-[var(--border-subtle)] text-slate-500 dark:text-[var(--text-muted)] inline-flex items-center gap-0.5 min-[360px]:gap-1">
                            <ShieldCheck className="w-2.5 h-2.5 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" /> Verificado
                        </span>
                    )}
                </div>

                {/* Desktop price & stock */}
                <div className="hidden sm:flex flex-col gap-1 mt-1">
                    <div className="flex items-baseline gap-1 flex-wrap">
                        <p className="text-emerald-700 dark:text-emerald-400 text-xl font-bold">{money(finalPrice)}</p>
                        {hasOffer ? (
                            <p className="text-xs text-gray-400 dark:text-[var(--text-muted)] line-through">{money(basePrice)}</p>
                        ) : (
                            <p className="text-xs text-transparent">-</p>
                        )}
                    </div>
                    <span className={`text-xs inline-flex items-center gap-1 self-start ${outOfStock ? 'text-rose-500' : 'text-slate-400 dark:text-[var(--text-muted)]'}`}>
                        <Package className="w-3 h-3 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" />
                        {outOfStock ? 'Agotado' : stock ? `Stk: ${stock}` : 'Disp.'}
                    </span>
                </div>

                {/* Mobile price & stock */}
                <div className="flex flex-col gap-0.5 mt-1 sm:hidden">
                    <p className="text-emerald-700 dark:text-emerald-400 text-[11px] min-[360px]:text-sm font-bold leading-none">{formatCompactMoney(finalPrice)}</p>
                    <div className="flex items-center justify-between gap-1 flex-wrap w-full text-[7.5px] min-[360px]:text-[9px]">
                        {hasOffer ? (
                            <p className="text-gray-400 dark:text-[var(--text-muted)] line-through">{formatCompactMoney(basePrice)}</p>
                        ) : (
                            <div className="w-0 h-0" />
                        )}
                        <span className={`inline-flex items-center gap-0.5 ${outOfStock ? 'text-rose-500' : 'text-slate-400 dark:text-[var(--text-muted)]'}`}>
                            <Package className="w-2.5 h-2.5 text-sky-500 dark:text-[var(--brand-sky)] shrink-0" />
                            <span>{outOfStock ? 'Agotado' : stock ? `Stk: ${stock}` : 'Disp.'}</span>
                        </span>
                    </div>
                </div>

                {/* Desktop action buttons */}
                <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 gap-1 mt-2">
                    <button
                        onClick={() => onAdd(p.id)}
                        disabled={outOfStock}
                        className="py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 hover:bg-sky-600 dark:hover:bg-sky-400 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px"
                    >
                        🛒 {outOfStock ? 'Agotado' : 'Añadir'}
                    </button>
                    <button
                        onClick={() => onView(p.id)}
                        className="py-2 rounded-xl border border-sky-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-xs font-semibold text-slate-700 dark:text-[var(--text-primary)] inline-flex items-center justify-center gap-1 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition hover:-translate-y-px"
                    >
                        🔍 Ver
                    </button>
                </div>

                {/* Mobile action buttons */}
                <div className="grid grid-cols-1 min-[360px]:grid-cols-2 gap-1 mt-1.5 sm:hidden">
                    <button
                        onClick={() => onAdd(p.id)}
                        disabled={outOfStock}
                        className="py-1.5 min-[360px]:py-2 rounded-xl bg-sky-500 text-white text-[8.5px] min-[360px]:text-[10px] font-semibold inline-flex items-center justify-center gap-0.5 hover:bg-sky-600 dark:hover:bg-sky-400 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-px"
                    >
                        🛒 {outOfStock ? 'Agotado' : 'Añadir'}
                    </button>
                    <button
                        onClick={() => onView(p.id)}
                        className="py-1.5 min-[360px]:py-2 rounded-xl border border-sky-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-card)] text-[8.5px] min-[360px]:text-[10px] font-semibold text-slate-700 dark:text-[var(--text-primary)] inline-flex items-center justify-center gap-0.5 hover:bg-sky-50 dark:hover:bg-sky-900/10 transition hover:-translate-y-px"
                    >
                        🔍 Ver
                    </button>
                </div>
            </div>
        </article>
    );
}
