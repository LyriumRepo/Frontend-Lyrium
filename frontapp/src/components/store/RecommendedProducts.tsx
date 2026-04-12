'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import { Producto } from '@/types/public';

interface RecommendedProductsProps {
  productos: Producto[];
  titulo?: string;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500' },
  promo: { label: 'Promo', class: 'bg-orange-500' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
};

export default function RecommendedProducts({ productos, titulo = 'Más productos para ti' }: RecommendedProductsProps) {
  if (!productos || productos.length === 0) {
    return null;
  }

  // Mostrar solo 5 productos como en el original
  const productosAMostrar = productos.slice(0, 5);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          {titulo}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {productosAMostrar.map((producto) => {
          const precioAnterior = producto.precioAnterior ?? producto.precioOferta;
          const tieneDescuento = precioAnterior && precioAnterior > producto.precio;
          const descuento = tieneDescuento 
            ? Math.round((1 - producto.precio / precioAnterior) * 100)
            : 0;
          const stickerTag = producto.tag?.toLowerCase();
          const sticker = stickerTag && stickerTag in stickerConfig ? stickerConfig[stickerTag] : null;

          return (
            <Link
              key={producto.id}
              href={producto.slug ? `/producto/${producto.slug}` : '#'}
              className="block bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-md dark:shadow-none border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-xl group"
            >
              {/* Imagen */}
              <div className="relative aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
                <Image
                  src={producto.imagen || '/img/no-image.png'}
                  alt={producto.titulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="200px"
                />
                
                {/* Descuento */}
                {descuento > 0 && (
                  <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                    -{descuento}%
                  </span>
                )}
                
                {/* Sticker */}
                {sticker && !descuento && (
                  <span className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-md ${sticker.class}`}>
                    {sticker.label}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h4 className="font-semibold text-slate-700 dark:text-[var(--text-primary)] text-sm line-clamp-2 mb-1">
                  {producto.titulo}
                </h4>
                
                <div className="flex items-baseline gap-2">
                  <p className="text-lg font-bold text-sky-500 dark:text-[var(--brand-sky)]">
                    S/{producto.precio.toFixed(2)}
                  </p>
                  {tieneDescuento && (
                    <p className="text-gray-400 dark:text-[var(--text-muted)] text-xs line-through">
                      S/{precioAnterior?.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
