'use client';


import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import TopMedalBadge from '@/components/ui/TopMedalBadge';
import {
    ArrowLeft, Flame, SlidersHorizontal, X,
    ChevronDown, Tag, ShoppingCart, Loader2, Check,
} from 'lucide-react';
import type { LaravelCategory } from '@/shared/lib/api/laravelCategoryRepository';
import type { LaravelProduct } from '@/features/public/product/types';
import { useAddToCart } from '@/features/public/product/hooks/useAddToCart';

interface LocalFilters {
    priceMin?: number;
    priceMax?: number;
    onSale?: boolean;
    inStock?: boolean;
    sortBy: 'default' | 'price_asc' | 'price_desc' | 'name';
}

function formatPrice(price: number) { return `S/ ${price.toFixed(2)}`; }
function discountPct(price: number, regular: number) {
    if (!regular || regular <= price) return 0;
    return Math.round(((regular - price) / regular) * 100);
}

// ProductCard — usa useAddToCart igual que ProductDetailPageClient
function ProductCard({ product }: { product: LaravelProduct }) {
    const router = useRouter();
    const { addToCart, loading, addedToCart } = useAddToCart();
    const discount = discountPct(product.price, product.regular_price);
    const imgSrc   = product.images[0]?.medium ?? product.images[0]?.src ?? '/no-image.png';
    const inStock  = product.stock > 0;

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!inStock || loading) return;
        addToCart(Number(product.id), 1);
    };

    // Nota: se usa un <div> con navegación programática (no <a>) porque el botón
    // "Agregar" de abajo es interactivo — anidar <button> dentro de <a> es HTML inválido.
    return (
        <div role="link" tabIndex={0}
            onClick={() => router.push(`/producto/${product.slug}`)}
            onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/producto/${product.slug}`); }}
            className="group cursor-pointer bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-sky-200 dark:hover:border-[#4A7C59]/40 transition-all duration-200 flex flex-col">
            <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)]">
                <Image src={imgSrc} alt={product.images[0]?.alt ?? product.name} fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300" />
                {discount > 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">-{discount}%</span>
                )}
                {product.sticker && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-sky-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Tag className="w-2.5 h-2.5" />{product.sticker}
                    </span>
                )}
                {!inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">Sin stock</span>
                    </div>
                )}
                <TopMedalBadge entityType="product" entityId={product.id} size="md" className="absolute bottom-2 right-2 z-10" />
            </div>
            <div className="p-3 flex flex-col gap-1.5 flex-1">
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{product.store.name}</p>
                <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight flex-1">{product.name}</p>
                <div className="flex items-baseline gap-2 mt-auto">
                    <span className="text-sky-600 dark:text-sky-400 font-black text-base">{formatPrice(product.price)}</span>
                    {discount > 0 && <span className="text-xs text-gray-400 line-through">{formatPrice(product.regular_price)}</span>}
                </div>
                {/* Botón igual al de ProductDetailPageClient */}
                <button onClick={handleAdd} disabled={!inStock || loading}
                    className={`mt-1 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        addedToCart
                            ? 'bg-emerald-500 text-white'
                            : inStock
                            ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-[#4A7C59] dark:hover:text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                    {loading    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : addedToCart ? <Check className="w-3.5 h-3.5" />
                    :              <ShoppingCart className="w-3.5 h-3.5" />}
                    {loading ? 'Agregando…' : addedToCart ? '¡Agregado!' : 'Agregar'}
                </button>
            </div>
        </div>
    );
}

function FiltersPanel({ filters, onChange, onClose, totalVisible, totalAll }: {
    filters: LocalFilters; onChange: (f: LocalFilters) => void;
    onClose: () => void; totalVisible: number; totalAll: number;
}) {
    const [localMin, setLocalMin] = useState(String(filters.priceMin ?? ''));
    const [localMax, setLocalMax] = useState(String(filters.priceMax ?? ''));
    const apply = () => { onChange({ ...filters, priceMin: localMin ? Number(localMin) : undefined, priceMax: localMax ? Number(localMax) : undefined }); onClose(); };
    const reset = () => { setLocalMin(''); setLocalMax(''); onChange({ sortBy: 'default' }); onClose(); };

    return (
        <div className="bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-5 space-y-5">
            <div className="flex items-center justify-between">
                <h3 className="font-black text-gray-800 dark:text-[var(--text-primary)]">Filtros</h3>
                <button onClick={onClose} aria-label="Cerrar filtros" className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <div>
                <p className="text-xs font-black uppercase text-gray-400 mb-2">Ordenar por</p>
                <div className="relative">
                    <select value={filters.sortBy} onChange={(e) => onChange({ ...filters, sortBy: e.target.value as LocalFilters['sortBy'] })}
                        className="w-full appearance-none border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm bg-white dark:bg-[var(--bg-primary)] text-gray-700 dark:text-[var(--text-primary)] outline-none focus:border-sky-400">
                        <option value="default">Relevancia</option>
                        <option value="price_asc">Precio: menor a mayor</option>
                        <option value="price_desc">Precio: mayor a menor</option>
                        <option value="name">Nombre A-Z</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
            </div>
            <div>
                <p className="text-xs font-black uppercase text-gray-400 mb-2">Rango de precio (S/)</p>
                <div className="flex gap-2">
                    <input type="number" placeholder="Mín" value={localMin} onChange={(e) => setLocalMin(e.target.value)}
                        className="w-full border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm bg-white dark:bg-[var(--bg-primary)] text-gray-700 dark:text-[var(--text-primary)] outline-none focus:border-sky-400" />
                    <input type="number" placeholder="Máx" value={localMax} onChange={(e) => setLocalMax(e.target.value)}
                        className="w-full border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm bg-white dark:bg-[var(--bg-primary)] text-gray-700 dark:text-[var(--text-primary)] outline-none focus:border-sky-400" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-[var(--text-primary)]">
                    <input type="checkbox" checked={!!filters.onSale} onChange={(e) => onChange({ ...filters, onSale: e.target.checked || undefined })} className="accent-sky-500 w-4 h-4" />
                    Solo en oferta
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 dark:text-[var(--text-primary)]">
                    <input type="checkbox" checked={!!filters.inStock} onChange={(e) => onChange({ ...filters, inStock: e.target.checked || undefined })} className="accent-sky-500 w-4 h-4" />
                    Solo en stock
                </label>
            </div>
            <div className="flex gap-2">
                <button onClick={reset} className="flex-1 py-2 text-sm font-bold border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">Limpiar</button>
                <button onClick={apply} className="flex-1 py-2 text-sm font-bold bg-sky-500 hover:bg-sky-600 dark:bg-[#4A7C59] dark:hover:bg-[#3D6B4A] text-white rounded-xl transition-colors">Ver {totalVisible} de {totalAll}</button>
            </div>
        </div>
    );
}

function CategoryNavigation({ categories, currentSlug }: { categories: LaravelCategory[]; currentSlug: string }) {
    if (!categories.length) return null;
    return (
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
            {categories.map((cat) => (
                <Link key={cat.slug} href={`/productos/${cat.slug}`}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${cat.slug === currentSlug ? 'bg-sky-500 dark:bg-[#4A7C59] text-white' : 'bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] text-gray-600 dark:text-[var(--text-secondary)] hover:border-sky-300'}`}>
                    {cat.name}
                    {cat.products_count > 0 && <span className="ml-1 opacity-60">({cat.products_count})</span>}
                </Link>
            ))}
        </div>
    );
}

interface CategoryPageClientProps {
    category: LaravelCategory;
    products: LaravelProduct[];
    siblingCategories: LaravelCategory[];
}

export default function CategoryPageClient({ category, products: initialProducts, siblingCategories }: CategoryPageClientProps) {
    const router = useRouter();
    const [filters, setFilters] = useState<LocalFilters>({ sortBy: 'default' });
    const [showFilters, setShowFilters] = useState(false);

    const filteredProducts = useMemo(() => {
        let result = [...initialProducts];
        if (filters.priceMin !== undefined) result = result.filter((p) => p.price >= filters.priceMin!);
        if (filters.priceMax !== undefined) result = result.filter((p) => p.price <= filters.priceMax!);
        if (filters.onSale)  result = result.filter((p) => p.price < p.regular_price);
        if (filters.inStock) result = result.filter((p) => p.stock > 0);
        switch (filters.sortBy) {
            case 'price_asc':  result.sort((a, b) => a.price - b.price); break;
            case 'price_desc': result.sort((a, b) => b.price - a.price); break;
            case 'name':       result.sort((a, b) => a.name.localeCompare(b.name)); break;
        }
        return result;
    }, [initialProducts, filters]);

    const offerProducts = useMemo(() => initialProducts.filter((p) => p.price < p.regular_price), [initialProducts]);
    const hasFilters = filters.priceMin !== undefined || filters.priceMax !== undefined || filters.onSale || filters.inStock || filters.sortBy !== 'default';

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)]">
                    <Link href="/" className="hover:text-sky-500 transition-colors">Inicio</Link>
                    <span>/</span>
                    <button type="button" onClick={() => router.back()} className="hover:text-sky-500 transition-colors">Productos</button>
                    <span>/</span>
                    <span className="text-gray-800 dark:text-[var(--text-primary)] font-medium">{category.name}</span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4" /> Volver al inicio
                </Link>
                <div className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-[var(--text-primary)]">{category.name}</h1>
                    {category.description && <p className="text-gray-500 dark:text-[var(--text-secondary)] mt-1">{category.description}</p>}
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                        {hasFilters ? `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? 's' : ''} (de ${initialProducts.length})` : `${initialProducts.length} producto${initialProducts.length !== 1 ? 's' : ''}`}
                    </p>
                </div>

                <CategoryNavigation categories={siblingCategories} currentSlug={category.slug} />

                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                    <button onClick={() => setShowFilters((v) => !v)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${showFilters || hasFilters ? 'border-sky-500 text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/20' : 'border-gray-200 dark:border-[var(--border-subtle)] text-gray-600 dark:text-[var(--text-secondary)] bg-white dark:bg-[var(--bg-secondary)]'}`}>
                        <SlidersHorizontal className="w-4 h-4" /> Filtros
                        {hasFilters && <span className="w-5 h-5 bg-sky-500 text-white text-xs rounded-full flex items-center justify-center">!</span>}
                    </button>
                    {hasFilters && (
                        <button onClick={() => setFilters({ sortBy: 'default' })} className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors">
                            <X className="w-3.5 h-3.5" /> Limpiar filtros
                        </button>
                    )}
                </div>

                {showFilters && (
                    <div className="mb-6">
                        <FiltersPanel filters={filters} onChange={setFilters} onClose={() => setShowFilters(false)} totalVisible={filteredProducts.length} totalAll={initialProducts.length} />
                    </div>
                )}

                {!hasFilters && offerProducts.length > 0 && (
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-white">Ofertas en {category.name}</h2>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {offerProducts.slice(0, 4).map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                        {hasFilters ? 'Resultados filtrados' : `Todos los productos en ${category.name}`}
                    </h2>
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="text-5xl mb-4">🔍</div>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-[var(--text-primary)] mb-2">No se encontraron productos</h3>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Intenta con otros filtros o explora otras categorías.</p>
                            <button onClick={() => setFilters({ sortBy: 'default' })} className="px-4 py-2 bg-sky-500 text-white text-sm font-bold rounded-xl hover:bg-sky-600 transition-colors">Limpiar filtros</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredProducts.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}