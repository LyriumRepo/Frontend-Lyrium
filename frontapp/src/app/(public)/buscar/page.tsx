import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SearchResults from '@/components/search/SearchResults';
import SearchBar from '@/components/home/SearchBar';
import { LaravelHomeRepository } from '@/shared/lib/api/laravel';
import type {Categoria} from '@/types/public';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string, min_price?: string; max_price?: string;  on_sale?: string; sticker?: string;}>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', category = '', min_price = '', max_price = '', on_sale, sticker } = await searchParams;

  const repo = new LaravelHomeRepository();
  let categoriasServicios: Categoria[] = [];
  let categoriasProductos: Categoria[] = [];
  let categoryName = '';

  try {
    const [serviceCats, productCats] = await Promise.all([
      repo.getServiceCategories(),
      repo.getCategories(),
    ]);
    categoriasServicios = serviceCats;
    categoriasProductos = productCats;

    if (category && !q) {
      const allCats = [...serviceCats, ...productCats];
      const found = allCats.find(c => c.slug === category || c.slug === category.split('/').pop());
      if (found) {
        categoryName = found.nombre;
      } else {
        // Fallback: fetch category by slug (cubre categorías de 3er nivel)
        const apiUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
        const res = await fetch(`${apiUrl}/categories/slug/${category}`, {
          headers: { Accept: 'application/json' },
          next: { revalidate: 60 },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data?.name) categoryName = json.data.name;
        }
      }
    }
  } catch {
    // fallback: arrays vacíos, la barra igual se renderiza
  }
  
  const initialOffer = on_sale === 'true' 
    ? (sticker === 'promotion' ? 'promotion' : sticker === 'offer' ? 'offer' : 'on_sale')
    : '';

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <div className="bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)]">
        <div>
          <SearchBar
            categoriasServicios={categoriasServicios}
            categoriasProductos={categoriasProductos}
            initialQuery={q}
            initialCategory={category}
            initialMinPrice={min_price}
            initialMaxPrice={max_price}
            initialOffer={initialOffer}
            autoSearch={true}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            {categoryName || q || (category ? `Categoría: ${category}` : '')}
          </h1>
          {category && q && (
            <p className="text-gray-500 dark:text-[var(--text-secondary)] mt-2">
              Filtrando por categoría: {category}
            </p>
          )}
        </div>

        <Suspense fallback={<div>Cargando resultados...</div>}>
          <SearchResults initialQuery={q} initialCategory={category} />
        </Suspense>
      </div>
    </main>
  );
}
