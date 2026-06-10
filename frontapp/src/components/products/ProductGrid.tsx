'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Eye, Clock, Tag, Calendar, Check, Loader2 } from 'lucide-react';
import { Producto } from '@/types/public';
import { useState, useCallback } from 'react';

interface ProductGridProps {
  productos: Producto[];
  loading?: boolean;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function useAddToCartLocal() {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  const addToCart = useCallback(async (productId: number) => {
    setLoadingId(productId);
    try {
      const token = localStorage.getItem('laravel_token');
      const res = await fetch('/backend/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error('Error al agregar');
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    } catch {
      //
    } finally {
      setLoadingId(null);
    }
  }, []);

  return { addToCart, loadingId, addedId };
}

function ProductCard({ producto }: { producto: Producto }) {
  const { addToCart, loadingId, addedId } = useAddToCartLocal();
  const isLoading = loadingId === producto.id;
  const isAdded = addedId === producto.id;
  const outOfStock = producto.stock === 0;
  const discount = producto.descuento || (producto.precioAnterior && producto.precioAnterior > producto.precio
    ? Math.round(((producto.precioAnterior - producto.precio) / producto.precioAnterior) * 100)
    : 0);

  return (
    <Link
      href={producto.enlace || (producto.slug ? `/producto/${producto.slug}` : '#')}
      className="group bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-sky-200 dark:hover:border-[#4A7C59]/40 transition-all duration-200 flex flex-col"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)]">
        <Image
          src={producto.imagen || '/img/no-image.png'}
          alt={producto.titulo}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
        {producto.tag && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-sky-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {producto.tag}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {producto.vendedor?.nombre && (
          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
            {producto.vendedor.nombre}
          </p>
        )}
        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight flex-1">
          {producto.titulo}
        </p>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sky-600 dark:text-sky-400 font-black text-base">
            S/{(producto.precioOferta ?? producto.precio).toFixed(2)}
          </span>
          {(producto.precioAnterior && producto.precioAnterior > (producto.precioOferta ?? producto.precio)) && (
            <span className="text-xs text-gray-400 line-through">
              S/{producto.precioAnterior.toFixed(2)}
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            if (outOfStock || isLoading) return;
            addToCart(producto.id);
          }}
          disabled={outOfStock || isLoading}
          className={`mt-1 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            isAdded
              ? 'bg-emerald-500 text-white'
              : 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-[#4A7C59] dark:hover:text-white'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isAdded ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
          {isLoading ? 'Agregando…' : isAdded ? '¡Listo!' : 'Agregar'}
        </button>
      </div>
    </Link>
  );
}

function ServiceCard({ producto }: { producto: Producto }) {
  const durationMinutes = producto.duration_minutes || 60;
  const discount = producto.descuento || (producto.precioAnterior && producto.precioAnterior > producto.precio
    ? Math.round(((producto.precioAnterior - producto.precio) / producto.precioAnterior) * 100)
    : 0);

  return (
    <div className="group bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-sky-200 dark:hover:border-[#4A7C59]/40 transition-all duration-200 flex flex-col">
      {/* Header with image or gradient */}
      <Link href={producto.enlace || '#'} className="block relative h-36 overflow-hidden bg-gradient-to-br from-sky-400 to-indigo-500 dark:from-[#1a3a3a] dark:to-[#2a5a4d]">
        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.titulo}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Calendar className="w-10 h-10 text-white/40" />
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
        {producto.tag && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-sky-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {producto.tag}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <Link href={producto.enlace || '#'}>
          <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight">
            {producto.titulo}
          </p>
        </Link>

        {producto.descripcion && (
          <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] line-clamp-2">
            {producto.descripcion}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-[var(--text-secondary)] mt-auto">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDuration(durationMinutes)}
          </span>
          {producto.vendedor?.nombre && (
            <span className="flex items-center gap-1 truncate">
              <Tag className="w-3 h-3 shrink-0" />
              <span className="truncate">{producto.vendedor.nombre}</span>
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">
            S/{(producto.precioOferta ?? producto.precio).toFixed(2)}
          </span>
          {(producto.precioAnterior && producto.precioAnterior > (producto.precioOferta ?? producto.precio)) && (
            <span className="text-xs text-gray-400 line-through">
              S/{producto.precioAnterior.toFixed(2)}
            </span>
          )}
        </div>

        <Link
          href={producto.enlace || '#'}
          className="block w-full text-center py-2 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white dark:hover:bg-[#4A7C59] dark:hover:text-white transition-all mt-1"
        >
          <span className="flex items-center justify-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            Agendar cita
          </span>
        </Link>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl shadow-sm border border-gray-100 dark:border-[var(--border-subtle)] overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200 dark:bg-gray-700" />
      <div className="p-3 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-full" />
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
      {productos.map((producto) =>
        producto.tipo === 'service' ? (
          <ServiceCard key={producto.id} producto={producto} />
        ) : (
          <ProductCard key={producto.id} producto={producto} />
        )
      )}
    </div>
  );
}
