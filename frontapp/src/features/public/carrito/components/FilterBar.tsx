'use client';

import { Search, X, Filter, DollarSign, ArrowUpDown, Hash } from 'lucide-react';
import { useCarritoStore } from '@/store/carritoStore';
import type { SortOption } from '@/store/carritoStore';

export default function FilterBar() {
    const searchQuery = useCarritoStore((s) => s.searchQuery);
    const sortBy = useCarritoStore((s) => s.sortBy);
    const priceMin = useCarritoStore((s) => s.priceMin);
    const priceMax = useCarritoStore((s) => s.priceMax);
    const priceBoundMin = useCarritoStore((s) => s.priceBoundMin);
    const priceBoundMax = useCarritoStore((s) => s.priceBoundMax);
    const filteredProducts = useCarritoStore((s) => s.filteredProducts);
    const setSearchQuery = useCarritoStore((s) => s.setSearchQuery);
    const setSortBy = useCarritoStore((s) => s.setSortBy);
    const setPriceRange = useCarritoStore((s) => s.setPriceRange);
    const resetPriceFilter = useCarritoStore((s) => s.resetPriceFilter);

    const rangeLeft = priceBoundMax > priceBoundMin
        ? ((priceMin - priceBoundMin) / (priceBoundMax - priceBoundMin)) * 100
        : 0;
    const rangeRight = priceBoundMax > priceBoundMin
        ? ((priceMax - priceBoundMin) / (priceBoundMax - priceBoundMin)) * 100
        : 100;

    const handleMinChange = (v: number) => {
        const newMin = Math.min(v, priceMax - 1);
        setPriceRange(newMin, priceMax);
    };
    const handleMaxChange = (v: number) => {
        const newMax = Math.max(v, priceMin + 1);
        setPriceRange(priceMin, newMax);
    };

    const CHIPS = [
        { label: 'Ofertas', q: 'oferta', color: 'bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-100' },
        { label: 'Destacados', q: 'destacado', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100' },
        { label: 'Bio', q: 'bio', color: 'bg-lime-50 text-lime-700 hover:bg-lime-100 border-lime-100' },
    ];

    return (
        <div className="border border-sky-200/50 bg-white/88 backdrop-blur-sm rounded-3xl p-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                {/* ── Búsqueda ──────────────────────────────────────────── */}
                <div className="rounded-[18px] border border-slate-100 bg-white/92 p-3">
                    <p className="text-xs text-slate-400 flex items-center gap-2 mb-2">
                        <Search className="w-3.5 h-3.5 text-sky-500" /> Buscar
                    </p>
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nombre, SKU, categoría…"
                            className="w-full outline-none text-sm bg-transparent text-slate-800 placeholder:text-slate-300"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-xs px-2 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {CHIPS.map((c) => (
                            <button
                                key={c.q}
                                onClick={() => setSearchQuery(c.q)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition ${c.color}`}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Ordenar ───────────────────────────────────────────── */}
                <div className="rounded-[18px] border border-slate-100 bg-white/92 p-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 flex items-center gap-2 mb-2">
                                <ArrowUpDown className="w-3.5 h-3.5 text-sky-500" /> Ordenar
                            </p>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="w-full bg-white/90 border border-sky-100 rounded-xl px-3 py-2 text-sm outline-none text-slate-700"
                            >
                                <option value="recent">Más recientes</option>
                                <option value="priceAsc">Precio: menor a mayor</option>
                                <option value="priceDesc">Precio: mayor a menor</option>
                                <option value="nameAsc">Nombre: A-Z</option>
                                <option value="ratingDesc">Mejor valorados</option>
                            </select>
                        </div>
                        <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 shrink-0">
                            <span className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 grid place-items-center">
                                <Hash className="w-4 h-4 text-sky-500" />
                            </span>
                            <span><span className="text-sky-500 font-bold">{filteredProducts.length}</span> productos</span>
                        </div>
                    </div>
                    <div className="mt-3 md:hidden flex items-center gap-2 text-sm text-slate-600">
                        <Hash className="w-4 h-4 text-sky-500" />
                        <span><span className="text-sky-500 font-bold">{filteredProducts.length}</span> productos</span>
                    </div>
                </div>

                {/* ── Precio ────────────────────────────────────────────── */}
                <div className="rounded-[18px] border border-slate-100 bg-white/92 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-400 flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5 text-sky-500" /> Precio
                        </p>
                        <button
                            onClick={resetPriceFilter}
                            className="text-xs px-2.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-slate-600 inline-flex items-center gap-1"
                        >
                            <Filter className="w-3 h-3" /> Reset
                        </button>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500 mb-3">
                        <span className="border border-slate-100 bg-slate-50 rounded-full px-2.5 py-1">Min: S/ {Math.round(priceMin)}</span>
                        <span className="border border-slate-100 bg-slate-50 rounded-full px-2.5 py-1">Max: S/ {Math.round(priceMax)}</span>
                    </div>

                    {/* Dual range slider */}
                    <div className="relative h-8 flex items-center">
                        {/* Track fill */}
                        <div
                            className="absolute h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-lime-400 pointer-events-none"
                            style={{ left: `${rangeLeft}%`, right: `${100 - rangeRight}%` }}
                        />
                        {/* Track bg */}
                        <div className="absolute inset-y-[13px] left-0 right-0 rounded-full bg-sky-100 pointer-events-none h-1.5" />
                        {/* Min slider */}
                        <input
                            type="range"
                            min={priceBoundMin}
                            max={priceBoundMax}
                            step={1}
                            value={priceMin}
                            onChange={(e) => handleMinChange(Number(e.target.value))}
                            className="absolute left-0 w-full h-1.5 bg-transparent appearance-none pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
                        />
                        {/* Max slider */}
                        <input
                            type="range"
                            min={priceBoundMin}
                            max={priceBoundMax}
                            step={1}
                            value={priceMax}
                            onChange={(e) => handleMaxChange(Number(e.target.value))}
                            className="absolute left-0 w-full h-1.5 bg-transparent appearance-none pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
                        />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">↔ Arrastra para filtrar en tiempo real</p>
                </div>
            </div>
        </div>
    );
}
