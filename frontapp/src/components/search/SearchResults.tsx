'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { searchProducts, searchCategories, mapWooProductToLocal } from '@/shared/lib/api/wooCommerce';
import ProductGrid from '@/components/products/ProductGrid';
import { Producto, Categoria } from '@/types/public';

interface SearchResultsProps {
  initialQuery?: string;
  initialCategory?: string;
}

function SearchResultsContent({ initialQuery = '', initialCategory = '' }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [products, setProducts] = useState<Producto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    const q = searchParams.get('q') || initialQuery;
    const cat = searchParams.get('category') || initialCategory;
    setQuery(q);
    setSelectedCategory(cat);
  }, [searchParams, initialQuery, initialCategory]);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const [productsResult, categoriesResult] = await Promise.all([
          searchProducts(query, 50),
          searchCategories(query, 10),
        ]);

        const mappedProducts: Producto[] = (Array.isArray(productsResult) ? productsResult : [])
          .map(mapWooProductToLocal)
          .filter((p): p is Producto => p !== null);

        const mappedCategories = (Array.isArray(categoriesResult) ? categoriesResult : [])
          .map((c) => ({
            id: c.id,
            nombre: c.name,
            imagen: c.image?.src || '/img/no-image.png',
            descripcion: c.description || '',
            slug: c.slug,
          }));

        setProducts(mappedProducts);
        setCategories(mappedCategories);
        setTotalResults(mappedProducts.length);
      } catch (error) {
        console.error('Search error:', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const filteredProducts = products.filter((product) => {
    if (priceMin && product.precio < parseFloat(priceMin)) return false;
    if (priceMax && product.precio > parseFloat(priceMax)) return false;
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query)}`);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/productos/${categorySlug}`);
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
  };

  if (!query) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <Search className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2">
          Ingresa un término de búsqueda
        </h3>
        <p className="text-gray-500 dark:text-[var(--text-secondary)]">
          Busca productos por nombre, categoría o descripción
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full h-12 pl-4 pr-12 rounded-full border border-gray-200 dark:border-[var(--border-subtle)] text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all bg-white dark:bg-[var(--bg-secondary)] text-gray-800 dark:text-[var(--text-primary)]"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-4 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-4 rounded-full border border-gray-200 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)] text-gray-600 dark:text-[var(--text-primary)] hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors flex items-center gap-2"
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filtros</span>
        </button>
      </form>

      {showFilters && (
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900 dark:text-[var(--text-primary)]">Filtros</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-sky-500 hover:text-sky-600"
            >
              Limpiar
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price-min" className="block text-sm text-gray-500 dark:text-[var(--text-placeholder)] mb-1">
                Precio mínimo (S/)
              </label>
              <input
                id="price-min"
                type="number"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="0"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-900 dark:text-[var(--text-primary)] text-sm"
              />
            </div>
            <div>
              <label htmlFor="price-max" className="block text-sm text-gray-500 dark:text-[var(--text-placeholder)] mb-1">
                Precio máximo (S/)
              </label>
              <input
                id="price-max"
                type="number"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="1000"
                className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)] text-gray-900 dark:text-[var(--text-primary)] text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-[var(--text-placeholder)] mb-3">
            Categorías relacionadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug || '')}
                className="px-4 py-2 rounded-full bg-gray-100 dark:bg-[var(--bg-muted)] text-sm text-gray-700 dark:text-[var(--text-primary)] hover:bg-sky-100 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm text-gray-500 dark:text-[var(--text-placeholder)] mb-4">
          {isLoading
            ? 'Buscando...'
            : `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? 's' : ''} para &quot;${query}&quot;`}
        </p>

        {isLoading ? (
          <ProductGrid productos={[]} loading />
        ) : filteredProducts.length > 0 ? (
          <ProductGrid productos={filteredProducts} />
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--text-primary)] mb-2">
              No se encontraron productos
            </h3>
            <p className="text-gray-500 dark:text-[var(--text-secondary)] max-w-md mx-auto">
              Prueba con otros términos de búsqueda o explora nuestras categorías
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-100 dark:bg-[var(--bg-muted)] rounded-2xl h-80 animate-pulse" />
      ))}
    </div>
  );
}

export default function SearchResults(props: SearchResultsProps) {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchResultsContent {...props} />
    </Suspense>
  );
}
