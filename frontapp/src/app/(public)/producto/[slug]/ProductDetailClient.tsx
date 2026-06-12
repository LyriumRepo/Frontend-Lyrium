'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, Heart, Share2, ShoppingCart, Store,
  ChevronLeft, ChevronRight, Minus, Plus,
  Truck, Clock, ShieldCheck, Package
} from 'lucide-react';
import { WooProduct } from '@/shared/lib/api/wooCommerce';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import { useCarritoStore } from '@/store/carritoStore';
import { useAuthGuard } from '@/shared/hooks/useAuthGuard';
import { Producto } from '@/types/public';
import RelatedProducts from '@/components/store/RelatedProducts';

interface ProductDetailClientProps {
  product: WooProduct;
  relatedProducts: Producto[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addToCartProtected } = useAuthGuard();
  const [cantidad, setCantidad] = useState(1);
  const [imagenActual, setImagenActual] = useState(0);

  const imagenes = product.images?.length ? product.images : [];
  const precioActual = parseFloat(product.price || product.regular_price || '0');
  const precioRegular = parseFloat(product.regular_price || '0');
  const tieneDescuento = precioRegular > precioActual && precioRegular > 0;
  const descuento = tieneDescuento ? Math.round(((precioRegular - precioActual) / precioRegular) * 100) : 0;

  const productLocal: Producto = useMemo(() => ({
    id: product.id,
    titulo: product.name,
    precio: precioActual,
    imagen: imagenes[0]?.src || '/img/no-image.png',
    categoria: product.categories?.[0]?.name || '',
    slug: product.slug,
    descripcion: product.short_description || product.description,
    enlace: `/producto/${product.slug}`,
  }), [product, precioActual, imagenes]);

  const handleAddToCart = () => {
    const p = {
      ...productLocal,
      precio: precioActual,
    };
    for (let i = 0; i < cantidad; i++) {
      addToCartProtected(p);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <div className="bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/productos" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Todos los productos
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Image + Basic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagen */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-[var(--bg-secondary)] shadow-lg">
              {imagenes.length > 0 ? (
                <Image
                  src={imagenes[imagenActual]?.src || '/img/no-image.png'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Sin imagen
                </div>
              )}
              {tieneDescuento && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
                  -{descuento}%
                </span>
              )}
            </div>
            {imagenes.length > 1 && (
              <div className="flex gap-2 mt-4 justify-center">
                {imagenes.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setImagenActual(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === imagenActual
                        ? 'border-sky-500 dark:border-[var(--brand-sky)]'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-[var(--border-subtle)]'
                    }`}
                  >
                    <Image src={img.src} alt="" width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {product.categories && product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/productos?category=${cat.slug}`}
                    className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-xs font-bold rounded-full"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-[var(--text-primary)]">
              {product.name}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                  S/ {product.price}
                </span>
                {tieneDescuento && (
                  <span className="text-lg text-gray-400 line-through">
                    S/ {product.regular_price}
                  </span>
                )}
              </div>
            </div>

            {product.short_description && (
              <div
                className="text-gray-600 dark:text-[var(--text-secondary)] prose dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
              />
            )}

            <div className="flex gap-3 items-center">
              <div className="inline-flex items-center border border-gray-200 dark:border-[var(--border-subtle)] rounded-lg h-11 bg-white dark:bg-[var(--bg-card)]">
                <button
                  onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors rounded-l-lg"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Math.min(99, parseInt(e.target.value) || 1)))}
                  className="w-12 h-full border-x border-gray-200 dark:border-[var(--border-subtle)] text-center text-sm font-medium text-gray-800 dark:text-[var(--text-primary)] bg-white dark:bg-[var(--bg-card)] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={1}
                  max={99}
                />
                <button
                  onClick={() => setCantidad(Math.min(99, cantidad + 1))}
                  className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors rounded-r-lg"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-600 dark:bg-[#4A7C59] dark:hover:bg-[#3D6B4A] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-lg shadow-sky-500/30"
              >
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
              <button className="p-3 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] hover:border-rose-400 hover:text-rose-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-500 hover:text-sky-500 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <section className="mt-12 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">
              Descripción
            </h2>
            <div
              className="prose dark:prose-invert max-w-none text-gray-600 dark:text-[var(--text-secondary)]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          </section>
        )}

        {/* Characteristics / Nutritional Info */}
        <section className="mt-8 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">
            Características
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800/40 flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-semibold text-green-800 dark:text-green-300">100% Natural</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400/80">Producto elaborado con ingredientes naturales seleccionados.</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-800/40 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="font-semibold text-amber-800 dark:text-amber-300">Sin aditivos</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400/80">Libre de conservantes y colorantes artificiales.</p>
            </div>
            <div className="bg-sky-50 dark:bg-sky-900/10 border border-sky-200 dark:border-sky-800/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-sky-200 dark:bg-sky-800/40 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="font-semibold text-sky-800 dark:text-sky-300">Envío rápido</span>
              </div>
              <p className="text-sm text-sky-700 dark:text-sky-400/80">Entrega garantizada en 3-5 días laborables.</p>
            </div>
          </div>
        </section>

        {/* Store Info */}
        {product.store && (
          <section className="mt-8 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">
              Tienda
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Store className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Vendido por</p>
                <p className="text-lg font-bold text-gray-900 dark:text-[var(--text-primary)]">{product.store.name}</p>
              </div>
            </div>
          </section>
        )}

        {/* Customer Reviews */}
        <section className="mt-8 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">
            Comentarios de los clientes
          </h2>
          <div className="text-center py-8 text-gray-400 dark:text-[var(--text-muted)]">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No hay comentarios aún. Sé el primero en opinar.</p>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-8">
            <RelatedProducts
              productos={relatedProducts}
              titulo="Productos relacionados"
            />
          </section>
        )}
      </div>
    </main>
  );
}
