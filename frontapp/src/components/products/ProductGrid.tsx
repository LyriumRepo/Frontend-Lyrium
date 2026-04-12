'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye } from 'lucide-react';
import { Producto } from '@/types/public';

interface ProductGridProps {
  productos: Producto[];
  loading?: boolean;
}

function ProductCard({ producto }: { producto: Producto }) {
  return (
    <Link 
      href={producto.slug ? `/producto/${producto.slug}` : '#'}
      className="block"
    >
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
        <div className="relative h-48 bg-gray-100 dark:bg-[var(--bg-muted)] overflow-hidden">
          <Image
            src={producto.imagen || '/img/no-image.png'}
            alt={producto.titulo}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {producto.descuento && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{producto.descuento}%
            </span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <button 
              className="bg-white dark:bg-[var(--brand-green)] p-2 rounded-full hover:scale-110 transition-transform"
              title="Ver detalles"
              onClick={(e) => e.preventDefault()}
            >
              <Eye className="w-4 h-4 text-gray-700 dark:text-white" />
            </button>
            <button 
              className="bg-sky-500 p-2 rounded-full hover:scale-110 transition-transform"
              title="Agregar al carrito"
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingCart className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2 line-clamp-2 text-sm min-h-[2.5rem]">
            {producto.titulo}
          </h3>
          <p className="text-sky-600 dark:text-[var(--color-success)] font-bold text-lg">
            S/{producto.precio.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden animate-pulse">
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function ProductGrid({ productos, loading = false }: ProductGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <span className="text-4xl">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2">
          Inventario vacío por ahora
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Estamos preparando los mejores productos para ti. 
          Pronto tendrás acceso a nuestra selección completa en esta categoría.
        </p>
        <Link 
          href="/" 
          className="inline-block mt-6 px-6 py-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
        >
          Explorar otras categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {productos.map((producto) => (
        <ProductCard key={producto.id} producto={producto} />
      ))}
    </div>
  );
}
