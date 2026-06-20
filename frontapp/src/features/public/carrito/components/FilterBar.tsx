'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCarritoStore } from '@/store/carritoStore';

export default function FilterBar() {
    const {
        searchQuery,
        priceMin,
        priceMax,
        priceBoundMin,
        priceBoundMax,
        setSearchQuery,
        setPriceRange,
        resetPriceFilter,
        applyFilters,
    } = useCarritoStore();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const clearFilters = () => {
        setSearchQuery('');
        resetPriceFilter();
    };

    const hasFilters = searchQuery.trim().length > 0
        || priceMin > priceBoundMin
        || priceMax < priceBoundMax;

    return (
        <div className="space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            🌿 Catálogo Lyrium
            </h1>
            <p className="text-sm text-gray-700 dark:text-[var(--text-secondary)]">
                Encuentra productos biológicos con precios justos y verifica el stock al instante.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-[var(--text-muted)]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Buscar producto..."
                        className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] text-gray-700 dark:text-[var(--text-primary)] placeholder-gray-400 dark:placeholder-[var(--text-placeholder)] text-sm focus:outline-none focus:ring-2 focus:ring-sky-400/30 dark:focus:ring-[var(--brand-sky)]/30 focus:border-sky-400 dark:focus:border-[var(--brand-sky)] transition"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-[var(--text-muted)] hover:text-gray-600 dark:hover:text-[var(--text-secondary)]"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-gray-500 dark:text-[var(--text-muted)]">S/</span>
                    <input
                        type="number"
                        min={0}
                        value={priceMin}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setPriceRange(val, priceMax);
                        }}
                        placeholder="Mín"
                        className="w-20 px-2.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] text-gray-700 dark:text-[var(--text-primary)] text-xs text-center focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition placeholder-gray-400 dark:placeholder-[var(--text-placeholder)]"
                    />
                    <span className="text-xs text-gray-400 dark:text-[var(--text-muted)]">—</span>
                    <input
                        type="number"
                        min={0}
                        value={priceMax}
                        onChange={(e) => {
                            const val = Number(e.target.value) || 0;
                            setPriceRange(priceMin, val);
                        }}
                        placeholder="Máx"
                        className="w-20 px-2.5 py-2.5 rounded-2xl bg-gray-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] text-gray-700 dark:text-[var(--text-primary)] text-xs text-center focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-400 transition placeholder-gray-400 dark:placeholder-[var(--text-placeholder)]"
                    />
                </div>
            </div>

            {hasFilters && (
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-[var(--text-muted)]" />
                    <span className="text-xs text-gray-500 dark:text-[var(--text-muted)]">Filtros activos:</span>
                    {searchQuery && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/30 text-xs text-sky-700 dark:text-sky-300">
                            &quot;{searchQuery}&quot;
                            <button onClick={() => setSearchQuery('')}>
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    {(priceMin > priceBoundMin || priceMax < priceBoundMax) && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800/30 text-xs text-sky-700 dark:text-sky-300">
                            S/ {priceMin} – S/ {priceMax}
                            <button onClick={resetPriceFilter}>
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    )}
                    <button
                        onClick={clearFilters}
                        className="text-xs text-gray-500 dark:text-[var(--text-muted)] hover:text-gray-700 dark:hover:text-[var(--text-primary)] underline ml-1"
                    >
                        Limpiar todo
                    </button>
                </div>
            )}
        </div>
    );
}
