'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Funnel, Star, Eye, Filter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/public';
import QuickViewModal from '@/components/products/QuickViewModal';

type Ordenamiento = 'recientes' | 'precio-asc' | 'precio-desc' | 'nombre' | 'popular';
type FiltroRapido = 'todos' | 'oferta' | 'destacado' | 'bio';

interface MainProductGridProps {
  productos: Producto[];
  onFilterChange?: (filters: ProductFilters) => void;
}

export interface ProductFilters {
  busqueda: string;
  ordenamiento: Ordenamiento;
  filtroRapido: FiltroRapido;
  precioMin?: number;
  precioMax?: number;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500' },
  promo: { label: 'Promo', class: 'bg-orange-500' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
};

const ordenOptions = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', label: 'Nombre A-Z' },
  { value: 'popular', label: 'Más vendidos' },
];

export default function MainProductGrid({ productos }: MainProductGridProps) {
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState<Ordenamiento>('recientes');
  const [filtroRapido, setFiltroRapido] = useState<FiltroRapido>('todos');
  const [precioMin, setPrecioMin] = useState(0);
  const [precioMax, setPrecioMax] = useState(1000);
  const [showFiltrosAvanzados, setShowFiltrosAvanzados] = useState(false);
  
  const [quickViewProduct, setQuickViewProduct] = useState<Producto | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const productosFiltrados = useMemo(() => {
    let result = [...productos];

    if (busqueda) {
      const busquedaLower = busqueda.toLowerCase();
      result = result.filter(p => 
        p.titulo?.toLowerCase().includes(busquedaLower) ||
        p.categoria?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filtroRapido === 'oferta') {
      result = result.filter(p => p.descuento || p.precioOferta || p.tag === 'oferta');
    }

    result = result.filter(p => p.precio >= precioMin && p.precio <= precioMax);

    switch (ordenamiento) {
      case 'precio-asc':
        result.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio-desc':
        result.sort((a, b) => b.precio - a.precio);
        break;
      case 'nombre':
        result.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || ''));
        break;
      case 'popular':
        result.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        break;
    }

    return result;
  }, [productos, busqueda, ordenamiento, filtroRapido, precioMin, precioMax]);

  const handleQuickView = (producto: Producto) => {
    setQuickViewProduct(producto);
    setIsQuickViewOpen(true);
  };

  const handleAddToCart = (producto: Producto) => {
    console.log('Añadir al carrito:', producto);
  };

  const renderEstrellas = (estrellas?: string) => {
    if (!estrellas) return null;
    return estrellas.split('').map((_, i) => (
      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <div className="mt-6">
      {/* FILTROS BARRA SUPERIOR - Legacy Style */}
      <div className="flex flex-wrap items-start gap-4 p-5 bg-gradient-to-r from-green-50 via-cyan-50 to-sky-50 border border-sky-100 rounded-2xl mb-6 shadow-[0_4px_20px_rgba(14,165,233,0.08)]">
        {/* Búsqueda */}
        <div className="flex-1 min-w-[200px] max-w-[320px] flex items-center gap-3 px-4 py-3 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl transition-all duration-200 focus-within:border-sky-500 focus-within:shadow-[0_0_0_3px_rgba(14,165,233,0.15)]">
          <Search className="w-5 h-5 text-sky-500" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, categoría..."
            className="flex-1 border-none outline-none text-sm text-slate-700 bg-transparent"
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="text-gray-400 hover:text-gray-600">
              ×
            </button>
          )}
        </div>

        {/* Tags de filtro rápido */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'todos', label: 'Todos' },
            { value: 'oferta', label: 'Ofertas' },
            { value: 'destacado', label: 'Destacados' },
            { value: 'bio', label: 'Bio' },
          ].map((filtro) => (
            <button
              key={filtro.value}
              onClick={() => setFiltroRapido(filtro.value as FiltroRapido)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 ${
                filtroRapido === filtro.value
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white dark:bg-[var(--bg-card)] text-slate-600 dark:text-[var(--text-secondary)] border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-500 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-[var(--bg-muted)]'
              }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {/* Ordenar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl">
            <Funnel className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">Ordenar:</span>
          <select
            value={ordenamiento}
            onChange={(e) => setOrdenamiento(e.target.value as Ordenamiento)}
            className="border-none outline-none text-sm font-medium text-slate-700 bg-transparent cursor-pointer"
          >
            {ordenOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Toggle filtros avanzados */}
        <button
          onClick={() => setShowFiltrosAvanzados(!showFiltrosAvanzados)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
            showFiltrosAvanzados
              ? 'bg-sky-500 text-white border-sky-500'
              : 'bg-white dark:bg-[var(--bg-card)] text-slate-600 dark:text-[var(--text-secondary)] border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-500 hover:text-sky-500'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Filtros avanzados (desplegable) */}
      {showFiltrosAvanzados && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-white/50 dark:bg-[var(--bg-card)]/50 border-t border-sky-100 dark:border-[var(--border-subtle)] animate-[slideDown_0.3s_ease-out] mb-6">
          <div className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl">
            <Filter className="w-4 h-4 text-sky-500" />
              <span className="text-lg font-bold text-sky-500">{productosFiltrados.length}</span>
            <span className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">productos</span>
            <button
              onClick={() => { setPrecioMin(0); setPrecioMax(1000); }}
              className="ml-2 px-2 py-1 text-xs font-medium text-gray-500 dark:text-[var(--text-secondary)] bg-gray-100 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-md hover:bg-gray-200 dark:hover:bg-[var(--bg-hover)]"
            >
              Reset
            </button>
          </div>
          
          {/* Rango de precio */}
          <div className="flex flex-col gap-2 px-4 py-3 bg-white dark:bg-[var(--bg-card)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl min-w-[200px]">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1 text-sm font-medium text-gray-500 dark:text-[var(--text-secondary)]">
                <Funnel className="w-4 h-4" />
                Precio
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 dark:bg-[var(--bg-muted)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg">
                <span className="text-sm text-gray-400">S/</span>
                <input
                  type="number"
                  value={precioMin}
                  onChange={(e) => setPrecioMin(Number(e.target.value))}
                  min={0}
                  className="w-14 border-none outline-none text-sm font-semibold text-sky-500 bg-transparent text-right"
                  placeholder="Min"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="flex items-center gap-1 px-2 py-1.5 bg-slate-50 border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-400">S/</span>
                <input
                  type="number"
                  value={precioMax}
                  onChange={(e) => setPrecioMax(Number(e.target.value))}
                  min={0}
                  className="w-14 border-none outline-none text-sm font-semibold text-sky-500 bg-transparent text-right"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GRID DE PRODUCTOS - Legacy Style */}
      {productosFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-8 text-center bg-slate-50 border-2 border-dashed border-gray-200 rounded-2xl">
          <span className="text-5xl mb-4">📦</span>
          <h4 className="text-lg font-semibold text-slate-600 mb-2">No se encontraron productos</h4>
          <p className="text-sm text-gray-400">Intenta con otros filtros o términos de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productosFiltrados.map((producto) => {
            const precioAnterior = producto.precioAnterior ?? producto.precioOferta;
            const tieneDescuento = precioAnterior && precioAnterior > producto.precio;
            const descuento = tieneDescuento 
              ? Math.round((1 - producto.precio / precioAnterior) * 100)
              : 0;
            const stickerTag = producto.tag?.toLowerCase();
            const sticker = stickerTag && stickerTag in stickerConfig ? stickerConfig[stickerTag] : null;

            return (
              <div
                key={producto.id}
                className="relative rounded-2xl overflow-hidden bg-white dark:bg-[var(--bg-card)] shadow-md border border-gray-100 dark:border-[var(--border-subtle)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg"
              >
                {/* Imagen */}
                <div className="relative aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
                  <Link href={producto.slug ? `/producto/${producto.slug}` : '#'}>
                    <Image
                      src={producto.imagen || '/img/no-image.png'}
                      alt={producto.titulo}
                      fill
                      className="object-cover transition-transform duration-400 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </Link>
                  
                  {/* Descuento */}
                  {descuento > 0 && (
                    <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                      -{descuento}%
                    </span>
                  )}
                  
                  {/* Sticker */}
                  {sticker && !descuento && (
                    <span className={`absolute top-2.5 left-2.5 text-white text-xs font-bold px-2 py-1 rounded-md ${sticker.class}`}>
                      {sticker.label}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <Link href={producto.slug ? `/producto/${producto.slug}` : '#'}>
                    <h4 className="text-sm font-semibold text-slate-700 line-clamp-2 mb-2 leading-snug">
                      {producto.titulo}
                    </h4>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2">
                    {renderEstrellas(producto.estrellas)}
                    {producto.reviews && (
                      <span className="text-xs text-gray-400">({producto.reviews})</span>
                    )}
                  </div>

                  <div className="text-xl font-bold text-sky-500">
                    S/{producto.precio.toFixed(2)}
                    {tieneDescuento && (
                      <span className="text-sm font-normal text-gray-400 line-through ml-2">
                        S/{precioAnterior?.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        producto={quickViewProduct}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
