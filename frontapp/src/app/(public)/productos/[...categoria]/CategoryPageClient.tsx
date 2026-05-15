'use client';

import { ProductCategory } from '@/shared/types/wp/wp-types';
import { Producto } from '@/types/public';
import OptimizedImage from '@/components/ui/OptimizedImage';
import Link from 'next/link';

interface CategoryPageClientProps {
  category: ProductCategory;
  products: Producto[];
  allCategories: ProductCategory[];
}

export default function CategoryPageClient({
  category,
  products,
  allCategories,
}: CategoryPageClientProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full lg:w-72">
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-white">Categorías</h3>
          <div className="space-y-1 bg-white dark:bg-gray-900 rounded-2xl p-3 border border-gray-100 dark:border-gray-800">
            {allCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos/${cat.slug}`}
                className={`block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm font-medium ${
                  cat.slug === category.slug 
                    ? 'bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-400 mt-2">{category.description}</p>
            )}
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/producto/${product.slug || product.id}`}
                  className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                    <OptimizedImage
                      src={product.imagen}
                      alt={product.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium line-clamp-2 text-sm mb-2 group-hover:text-sky-600 transition-colors">
                      {product.titulo}
                    </h3>
                    <p className="text-lg font-bold text-sky-600 dark:text-sky-400">
                      S/ {(product.precioOferta || product.precio)?.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No hay productos disponibles en esta categoría por el momento.
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Estamos trabajando para agregar más productos
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}