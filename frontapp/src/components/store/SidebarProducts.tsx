'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
import { Producto } from '@/types/public';

interface SidebarProductsProps {
  productos: Producto[];
  titulo?: string;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500 text-white' },
  promo: { label: 'Promo', class: 'bg-amber-500 text-white' },
  nuevo: { label: 'Nuevo', class: 'bg-sky-500 text-white' },
  limitado: { label: 'Limitado', class: 'bg-purple-500 text-white' },
};

const categoriaColors: Record<string, string> = {
  Vitaminas: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Suplementos: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Proteínas: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Belleza: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  Energía: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Superfoods: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Orgánicos: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Granos: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Especias: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Digestivo: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

export default function SidebarProducts({ productos, titulo = 'Artículos de tendencia' }: SidebarProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const productosVisibles = productos.slice(0, 4);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.offsetHeight * 0.5;
      scrollRef.current.scrollBy({
        top: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!productos || productos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-[var(--text-primary)]">
          <Star className="w-5 h-5 text-sky-500" />
          {titulo}
        </h3>
        <div className="flex gap-1">
          <button 
            onClick={() => scroll('left')}
            className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-sky-500 hover:text-white rounded-md text-gray-500 dark:text-gray-400 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-7 h-7 flex items-center justify-center bg-gray-100 dark:bg-[var(--bg-muted)] hover:bg-sky-500 hover:text-white rounded-md text-gray-500 dark:text-gray-400 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards apiladas */}
      <div 
        ref={scrollRef}
        className="flex flex-col gap-3 overflow-y-auto max-h-[500px] custom-scrollbar"
      >
        {productosVisibles.map((producto) => {
          const stickerTag = producto.tag?.toLowerCase();
          const sticker = stickerTag && stickerTag in stickerConfig ? stickerConfig[stickerTag] : null;
          const categoriaColor = categoriaColors[producto.categoria || ''] || 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';

          return (
            <Link
              key={producto.id}
              href={producto.slug ? `/producto/${producto.slug}` : '#'}
              className="sidebar-product-card bg-white dark:bg-[var(--bg-secondary)] rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] overflow-hidden shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-500 transition-all group"
            >
              {/* Imagen panorámica */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-[var(--bg-muted)]">
                <Image
                  src={producto.imagen || '/img/no-image.png'}
                  alt={producto.titulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="300px"
                />
                
                {/* Sticker */}
                {sticker && (
                  <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${sticker.class}`}>
                    {sticker.label}
                  </span>
                )}
                
                {/* Botón favorito */}
                <button 
                  className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-white/80 dark:bg-[var(--bg-card)]/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white dark:hover:bg-[var(--bg-card)] transition-all opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {/* Info */}
              <div className="p-3">
                <h4 className="font-semibold text-gray-800 dark:text-[var(--text-primary)] text-sm mb-1.5 line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-[var(--brand-sky)] transition-colors">
                  {producto.titulo}
                </h4>
                
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${categoriaColor}`}>
                    {producto.categoria || 'Productos'}
                  </span>
                  <span className="font-bold text-sky-600 dark:text-[var(--brand-sky)] text-sm">
                    S/{producto.precio.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
