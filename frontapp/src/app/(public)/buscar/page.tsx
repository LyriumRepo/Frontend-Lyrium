import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import SearchResults from '@/components/search/SearchResults';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', category = '' } = await searchParams;

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
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[var(--text-primary)]">
            Búsqueda{q && `: "${q}"`}
          </h1>
          {category && (
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
