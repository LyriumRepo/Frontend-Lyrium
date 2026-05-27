'use client';

/**
 * ProductCard.tsx — componente reutilizable para CategoryPageClient
 * Conecta el botón "Agregar" a cartApi (R17 fix para la vista de categoría).
 *
 * Reemplaza el bloque `function ProductCard` dentro de CategoryPageClient.tsx
 * Ubicación sugerida: src/features/public/productos/components/ProductCard.tsx
 */

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Tag, Check, Loader2 } from 'lucide-react';
import type { LaravelProduct } from '@/features/public/product/types';
import { useAddToCart } from '@/features/public/product/hooks/useAddToCart';

function formatPrice(price: number) {
  return `S/ ${price.toFixed(2)}`;
}

function discountPct(price: number, regular: number) {
  if (!regular || regular <= price) return 0;
  return Math.round(((regular - price) / regular) * 100);
}

interface ProductCardProps {
  product: LaravelProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount = discountPct(product.price, product.regular_price);
  const imgSrc =
    product.images[0]?.medium ?? product.images[0]?.src ?? '/no-image.png';

  // ── R17: conectado al hook de carrito ────────────────────────────────────
  const { addToCart, loading, addedToCart } = useAddToCart();

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group bg-white dark:bg-[var(--bg-secondary)] border border-gray-100 dark:border-[var(--border-subtle)] rounded-2xl overflow-hidden hover:shadow-xl hover:border-sky-200 dark:hover:border-[#4A7C59]/40 transition-all duration-200 flex flex-col"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 dark:bg-[var(--bg-primary)]">
        <Image
          src={imgSrc}
          alt={product.images[0]?.alt ?? product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
        {product.sticker && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-sky-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
            <Tag className="w-2.5 h-2.5" />
            {product.sticker}
          </span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold bg-black/60 px-3 py-1 rounded-full">
              Sin stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {product.store.name}
        </p>
        <p className="text-sm font-bold text-gray-800 dark:text-[var(--text-primary)] line-clamp-2 leading-tight flex-1">
          {product.name}
        </p>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sky-600 dark:text-sky-400 font-black text-base">
            {formatPrice(product.price)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.regular_price)}
            </span>
          )}
        </div>

        {/* ── Botón conectado ── */}
        <button
          onClick={(e) => {
            e.preventDefault(); // no navega al detalle
            if (product.stock === 0 || loading) return;
            addToCart(Number(product.id), 1);
          }}
          disabled={product.stock === 0 || loading}
          className={`mt-1 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            addedToCart
              ? 'bg-emerald-500 text-white'
              : 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white dark:hover:bg-[#4A7C59] dark:hover:text-white'
          }`}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : addedToCart ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
          {loading ? 'Agregando…' : addedToCart ? '¡Listo!' : 'Agregar'}
        </button>
      </div>
    </Link>
  );
}