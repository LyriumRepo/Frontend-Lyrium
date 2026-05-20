import { Suspense } from 'react';
import SearchResults from '@/components/search/SearchResults';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = '', category = '' } = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[var(--bg-primary)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div>Cargando resultados...</div>}>
          <SearchResults initialQuery={q} initialCategory={category} />
        </Suspense>
      </div>
    </main>
  );
}
