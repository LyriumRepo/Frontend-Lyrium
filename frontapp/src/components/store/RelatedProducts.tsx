'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Eye } from 'lucide-react';
import { Producto } from '@/types/public';
import { useCarritoStore } from '@/store/carritoStore';
import { useState } from 'react';
import QuickViewModal from '@/components/products/QuickViewModal';

interface RelatedProductsProps {
  productos: Producto[];
  titulo?: string;
}

const stickerConfig: Record<string, { label: string; class: string }> = {
  oferta: { label: 'Oferta', class: 'bg-emerald-600 dark:bg-emerald-500' },
  promo: { label: 'Promo', class: 'bg-sky-500 dark:bg-sky-400' },
  nuevo: { label: 'Nuevo', class: 'bg-green-500' },
  limitado: { label: 'Limitado', class: 'bg-purple-500' },
};

export default function RelatedProducts({ productos, titulo = 'Descubre más productos' }: RelatedProductsProps) {
  const addToCart = useCarritoStore((s) => s.addToCart);
  const openCart = useCarritoStore((s) => s.openCart);
  const [quickViewProduct, setQuickViewProduct] = useState<Producto | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleAddToCart = (producto: Producto) => {
    addToCart(producto);
    openCart();
  };

  const handleQuickView = (producto: Producto) => {
    setQuickViewProduct(producto);
    setIsQuickViewOpen(true);
  };

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
                  <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                    -{descuento}%
                  </span>
                )}
                
                {/* Sticker */}
                {sticker && !descuento && (
                  <span className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded-md ${sticker.class}`}>
                    {sticker.label}
                  </span>
                )}

                <div className="hidden md:flex absolute inset-0 bg-black/0 group-hover:bg-black/10 items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleQuickView(producto)} aria-label="Vista rápida" className="bg-white p-2 rounded-full shadow-lg"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => handleAddToCart(producto)} aria-label="Agregar al carrito" className="bg-sky-500 p-2 rounded-full shadow-lg"><ShoppingCart className="w-4 h-4 text-white" /></button>
                </div>
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
                  <button onClick={() => handleAddToCart(producto)} className="w-8 h-8 bg-sky-500 hover:bg-sky-600 rounded-full flex items-center justify-center transition-colors md:hidden">
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <QuickViewModal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        producto={quickViewProduct}
        onAddToCart={(p) => {
          addToCart(p);
          openCart();
        }}
      />
    </section>
  );
}
