'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Producto } from '@/types/public';

interface ProductCarouselProps {
  productos: Producto[];
  titulo: string;
  icono?: React.ReactNode;
  descuento?: number;
  minWidth?: string;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500' },
  promo: { label: 'Promo', class: 'bg-orange-500' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
};

export default function ProductCarousel({ 
  productos, 
  titulo, 
  icono,
  descuento,
  minWidth = '200px'
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderEstrellas = (rating?: string) => {
    if (!rating) return null;
    const stars = rating.split('');
    return stars.map((s, i) => (
      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
    ));
  };

  if (!productos || productos.length === 0) {
    return null;
  }

  return (
    <section className="py-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4 flex items-center gap-2">
        {icono && <span className="text-sky-500 dark:text-[var(--brand-sky)]">{icono}</span>}
        {titulo}
      </h3>
      
      <div className="relative group">
        {/* Botón Anterior */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 dark:bg-[var(--bg-card)]/95 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-[var(--bg-card)] hover:scale-110 -translate-x-2 group-hover:translate-x-0"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 text-sky-500 dark:text-[var(--brand-sky)]" />
        </button>

        {/* Contenedor de scroll */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {productos.map((producto) => {
            const precioAnterior = descuento 
              ? producto.precio 
              : (producto.precioAnterior ?? producto.precioOferta);
            const precioMostrar = descuento 
              ? producto.precio * (1 - descuento) 
              : producto.precio;
            const stickerTag = producto.tag?.toLowerCase();
            const sticker = stickerTag && stickerTag in stickerConfig ? stickerConfig[stickerTag] : null;
            const tieneDescuento = precioAnterior && precioAnterior > precioMostrar;

            return (
              <Link
                key={producto.id}
                href={producto.slug ? `/producto/${producto.slug}` : '#'}
                className="flex-shrink-0"
                style={{ minWidth }}
              >
                <div className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-md dark:shadow-none border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-xl group">
                  <div className="relative h-40 bg-gray-100 dark:bg-[var(--bg-muted)]">
                    <Image
                      src={producto.imagen || '/img/no-image.png'}
                      alt={producto.titulo}
                      fill
                      sizes="200px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {descuento && !sticker && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                        -{Math.round(descuento * 100)}%
                      </span>
                    )}
                    {sticker && !descuento && (
                      <span className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded-md ${sticker.class}`}>
                        {sticker.label}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-gray-500 dark:text-[var(--text-muted)] mb-1 line-clamp-1">
                      {producto.categoria}
                    </p>
                    <h4 className="font-semibold text-slate-700 dark:text-[var(--text-primary)] text-sm line-clamp-2 mb-2 min-h-[2.5rem]">
                      {producto.titulo}
                    </h4>
                    <div className="flex items-center gap-1 mb-2">
                      {renderEstrellas(producto.estrellas)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-sky-500 dark:text-[var(--brand-sky)]">
                          S/{precioMostrar.toFixed(2)}
                        </p>
                        {tieneDescuento && (
                          <p className="text-gray-400 dark:text-[var(--text-muted)] text-xs line-through">
                            S/{precioAnterior?.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <button 
                        className="w-8 h-8 bg-sky-500 hover:bg-sky-600 dark:hover:bg-sky-400 rounded-full flex items-center justify-center transition-colors"
                        onClick={(e) => e.preventDefault()}
                        aria-label="Añadir al carrito"
                      >
                        <ShoppingCart className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Botón Siguiente */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/95 dark:bg-[var(--bg-card)]/95 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.1)] dark:shadow-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-[var(--bg-card)] hover:scale-110 translate-x-2 group-hover:translate-x-0"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 text-sky-500 dark:text-[var(--brand-sky)]" />
        </button>
      </div>
    </section>
  );
}
