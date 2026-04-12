'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tag, Flame } from 'lucide-react';
import { ProductCategory } from '@/shared/types/wp/wp-types';
import { Producto } from '@/types/public';
import ProductGrid from '@/components/products/ProductGrid';
import CategoryNavigation from '@/components/products/CategoryNavigation';
import ProductFilters, { ProductFilters as ProductFiltersType } from '@/components/products/ProductFilters';

interface CategoryPageClientProps {
  category: ProductCategory;
  products: Producto[];
  allCategories: ProductCategory[];
}

export default function CategoryPageClient({ 
  category, 
  products: initialProducts,
  allCategories 
}: CategoryPageClientProps) {
  const [filters, setFilters] = useState<ProductFiltersType>({});

  // Aplicar filtros a los productos
  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => {
      // Filtro por precio mínimo
      if (filters.priceMin && product.precio < filters.priceMin) {
        return false;
      }
      // Filtro por precio máximo
      if (filters.priceMax && product.precio > filters.priceMax) {
        return false;
      }
      // Filtro por stock
      if (filters.stockStatus && filters.stockStatus !== 'all') {
        if (filters.stockStatus === 'out_of_stock') {
          // Mostrar solo agotados (lógica simplificada)
        } else if (filters.stockStatus === 'on_sale') {
          // Mostrar solo ofertas
          if (!product.descuento) return false;
        }
      }
      return true;
    });
  }, [initialProducts, filters]);

  // Productos en oferta
  const offerProducts = useMemo(() => {
    return initialProducts.filter(p => p.descuento && p.descuento > 0);
  }, [initialProducts]);

  const hasFilters = filters.priceMin || filters.priceMax || (filters.stockStatus && filters.stockStatus !== 'all');

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <div className="bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-[var(--text-secondary)] hover:text-sky-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header de categoría */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            {category.name}
          </h1>
          <p className="text-gray-500 dark:text-[var(--text-secondary)] mt-2">
            {category.description || `Explora nuestra selección de productos en ${category.name}`}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            {hasFilters 
              ? `${filteredProducts.length} productos encontrados (de ${initialProducts.length})`
              : `${initialProducts.length} producto${initialProducts.length !== 1 ? 's' : ''} encontrado${initialProducts.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Navegación entre categorías */}
        <CategoryNavigation 
          categories={allCategories} 
          currentCategorySlug={category.slug}
        />

        {/* Filtros */}
        <div className="mb-6">
          <ProductFilters 
            onFilterChange={setFilters}
            initialFilters={filters}
          />
        </div>

        {/* Sección de ofertas */}
        {!hasFilters && offerProducts.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Las mejores ofertas!
              </h2>
            </div>
            <ProductGrid productos={offerProducts.slice(0, 4)} />
          </section>
        )}

        {/* Grid de productos */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {hasFilters ? 'Resultados filtrados' : 'Todos los productos'}
          </h2>
          <ProductGrid productos={filteredProducts} />
        </section>
      </div>
    </main>
  );
}
