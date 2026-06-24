'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { searchProducts, searchCategories, searchServices, mapCatalogProductToLocal, mapServiceToLocal } from '@/shared/lib/api/catalogProducts';
import ProductGrid from '@/components/products/ProductGrid';
import { Producto, Categoria } from '@/types/public';
import SearchBar from '@/components/home/SearchBar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
  const [onSale, setOnSale] = useState(false);
  const [sticker, setSticker] = useState('');

  useEffect(() => {
    const q = searchParams.get('q') || initialQuery;
    const cat = searchParams.get('category') || initialCategory;
    const min = searchParams.get('min_price') || '';
    const max = searchParams.get('max_price') || '';
    const sale = searchParams.get('on_sale') === 'true';
    const stickerP = searchParams.get('sticker') || '';
    setQuery(q);
    setSelectedCategory(cat);
    setPriceMin(min);
    setPriceMax(max);
    setOnSale(sale);
    setSticker(stickerP);

    if (!q && !cat) return;

    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const isCategoryBrowse = !!cat && !q;
        const results = await Promise.allSettled([
          searchProducts({
            query: isCategoryBrowse ? '' : q,
            perPage: 50,
            minPrice: min || undefined,
            maxPrice: max || undefined,
            onSale: sale || undefined,
            sticker: stickerP || undefined,
            category: cat || undefined,
          }),
          searchCategories(isCategoryBrowse ? cat : q, 10),
          searchServices({ query: isCategoryBrowse ? '' : q, perPage: 50, category: cat || undefined }),
        ]);

        const productsResult = results[0].status === 'fulfilled' ? results[0].value : [];
        const categoriesResult = results[1].status === 'fulfilled' ? results[1].value : [];
        const servicesResult = results[2].status === 'fulfilled' ? results[2].value : [];

        const mappedProducts: Producto[] = (Array.isArray(productsResult) ? productsResult : [])
          .map(mapCatalogProductToLocal)
          .filter((p): p is Producto => p !== null);

        const mappedServices: Producto[] = (Array.isArray(servicesResult) ? servicesResult : [])
          .map(mapServiceToLocal)
          .filter((p): p is Producto => p !== null);

        const mappedCategories = (Array.isArray(categoriesResult) ? categoriesResult : [])
          .map((c) => ({
            id: c.id,
            nombre: c.name,
            imagen: c.image?.src || '/img/no-image.png',
            descripcion: c.description || '',
            slug: c.slug,
          }));

        const allProducts = [...mappedProducts, ...mappedServices];
        setProducts(allProducts);
        setCategories(mappedCategories);
        setTotalResults(allProducts.length);
      } catch (error) {
        console.error('Search render error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [searchParams, initialQuery, initialCategory]);


  const filteredProducts = products.filter((product) => {
    if (priceMin && product.precio < parseFloat(priceMin)) return false;
    if (priceMax && product.precio > parseFloat(priceMax)) return false;
    return true;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({ q: query });
      if (priceMin) params.set('min_price', priceMin);
      if (priceMax) params.set('max_price', priceMax);
      router.push(`/buscar?${params.toString()}`);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    router.push(`/buscar?category=${categorySlug}`);
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
  };

  if (!query && !selectedCategory) {
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
    <div className="space-y-8">
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
            : `${filteredProducts.length} resultado${filteredProducts.length !== 1 ? 's' : ''}${query ? ` para "${query}"` : selectedCategory ? ' en categoría seleccionada' : ''}`}
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
              {selectedCategory ? 'No se encontraron productos o servicios en esta categoría' : 'Prueba con otros términos de búsqueda o explora nuestras categorías'}
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
