import { getProductBySlug, WooProduct } from '@/shared/lib/api/wooCommerce';
import { sanitizeHtml } from '@/shared/lib/sanitize';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Star, Heart, Share2, ShoppingCart, Store } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug) as WooProduct | null;

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagen del producto */}
          <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white dark:bg-[var(--bg-secondary)] shadow-lg">
              {product.images?.[0] ? (
                <Image
                  src={product.images[0].src}
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
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categorías */}
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

            {/* Título */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-[var(--text-primary)]">
              {product.name}
            </h1>

            {/* Precio */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-sky-600 dark:text-sky-400">
                S/ {product.price}
              </span>
              {product.regular_price && product.regular_price !== product.price && (
                <span className="text-lg text-gray-400 line-through">
                  S/ {product.regular_price}
                </span>
              )}
            </div>

            {/* Descripción corta */}
            {product.short_description && (
              <div 
                className="text-gray-600 dark:text-[var(--text-secondary)] prose dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.short_description) }}
              />
            )}

            {/* Botón de compra */}
            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-3 bg-sky-500 hover:bg-sky-600 dark:bg-[#4A7C59] dark:hover:bg-[#3D6B4A] text-white font-bold py-4 px-8 rounded-full transition-colors shadow-lg shadow-sky-500/30">
                <ShoppingCart className="w-5 h-5" />
                Agregar al carrito
              </button>
              <button className="p-4 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-500 hover:text-sky-500 transition-colors">
                <Heart className="w-6 h-6" />
              </button>
              <button className="p-4 rounded-full border-2 border-gray-200 dark:border-[var(--border-subtle)] hover:border-sky-500 hover:text-sky-500 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>

            {/* Información del vendedor/tienda */}
            {product.store && (
              <div className="bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Store className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-[var(--text-secondary)]">Vendido por</p>
                    <p className="font-bold text-gray-900 dark:text-[var(--text-primary)]">{product.store.name}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Descripción completa */}
        {product.description && (
          <div className="mt-12 bg-white dark:bg-[var(--bg-secondary)] border border-gray-200 dark:border-[var(--border-subtle)] rounded-2xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-[var(--text-primary)] mb-4">
              Descripción del producto
            </h2>
            <div 
              className="prose dark:prose-invert max-w-none text-gray-600 dark:text-[var(--text-secondary)]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
