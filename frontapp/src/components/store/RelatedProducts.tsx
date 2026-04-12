'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Producto } from '@/types/public';

interface RelatedProductsProps {
  productos: Producto[];
  titulo?: string;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-red-500' },
  promo: { label: 'Promo', class: 'bg-orange-500' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
};

export default function RelatedProducts({ productos, titulo = 'Descubre más productos' }: RelatedProductsProps) {
  if (!productos || productos.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
          {titulo}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {productos.map((producto) => {
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
              className="bg-white dark:bg-[var(--bg-card)] rounded-2xl shadow-md dark:shadow-none border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-xl group"
            >
              {/* Imagen */}
              <div className="relative aspect-square bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
                <Image
                  src={producto.imagen || '/img/no-image.png'}
                  alt={producto.titulo}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
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
                <Link href={producto.slug ? `/producto/${producto.slug}` : '#'}>
                  <h4 className="font-semibold text-slate-700 dark:text-[var(--text-primary)] text-sm line-clamp-2 mb-2">
                    {producto.titulo}
                  </h4>
                </Link>
                
                <div className="flex items-center justify-between">
                  <div>
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
