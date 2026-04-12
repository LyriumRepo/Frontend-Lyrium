'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SearchResult, SearchFilters } from '@/types/public';
import { home } from '@/shared/lib/api';

const LARAVEL_BASE_URL = (process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api').replace('/api', '');

const transformUrl = (url: string | undefined | null): string => {
  if (!url) return '/img/no-image.png';
  if (url.startsWith('http')) return url;
  return `${LARAVEL_BASE_URL}${url}`;
};

interface UseSearchOptions {
  debounceMs?: number;
  minChars?: number;
  maxResults?: number;
}

interface UseSearchReturn {
  results: SearchResult[];
  categoryResults: SearchResult[];
  productResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string, category?: string) => void;
  clearResults: () => void;
  filters: SearchFilters;
  setFilters: (filters: Partial<SearchFilters>) => void;
  getCategoryProducts: (categorySlug: string) => Promise<SearchResult[]>;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const {
    debounceMs = 300,
    minChars = 2,
    maxResults = 5,
  } = options;

  const [results, setResults] = useState<SearchResult[]>([]);
  const [categoryResults, setCategoryResults] = useState<SearchResult[]>([]);
  const [productResults, setProductResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: undefined,
    priceMin: undefined,
    priceMax: undefined,
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearResults = useCallback(() => {
    setResults([]);
    setCategoryResults([]);
    setProductResults([]);
    setError(null);
  }, []);

  const getCategoryProducts = useCallback(async (categorySlug: string): Promise<SearchResult[]> => {
    try {
      const products = await home.getProductsByCategorySlug(categorySlug, 4);
      return (Array.isArray(products) ? products : []).map((p) => ({
        id: p.id,
        type: 'product' as const,
        titulo: p.name,
        precio: parseFloat(p.price || p.regular_price || '0'),
        imagen: transformUrl(p.images?.[0]?.src),
        slug: p.slug,
        categoria: p.categories?.[0]?.name,
      }));
    } catch (err) {
      console.error('Error fetching category products:', err);
      return [];
    }
  }, []);

  const performSearch = useCallback(async (query: string, category?: string) => {
    if (query.length < minChars) {
      setResults([]);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const [products, categories] = await Promise.all([
        home.searchProducts(query, maxResults),
        home.searchCategories(query, maxResults),
      ]);

      const productResults: SearchResult[] = (Array.isArray(products) ? products : []).map((p) => ({
        id: p.id,
        type: 'product' as const,
        titulo: p.name,
        precio: parseFloat(p.price || p.regular_price || '0'),
        imagen: transformUrl(p.images?.[0]?.src),
        slug: p.slug,
        categoria: p.categories?.[0]?.name,
      }));

      const categoryResults: SearchResult[] = (Array.isArray(categories) ? categories : []).map((c) => ({
        id: c.id,
        type: 'category' as const,
        titulo: c.name,
        imagen: transformUrl(c.image?.src),
        slug: c.slug,
      }));

      setProductResults(productResults);
      setCategoryResults(categoryResults);
      const combinedResults = [...productResults, ...categoryResults];
      setResults(combinedResults.slice(0, maxResults));
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError('Error al buscar. Intenta de nuevo.');
        console.error('Search error:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [minChars, maxResults]);

  const search = useCallback((query: string, category?: string) => {
    setFilters((prev) => ({ ...prev, query, category }));

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < minChars) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query, category);
    }, debounceMs);
  }, [debounceMs, minChars, performSearch]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    if (newFilters.query !== undefined && newFilters.query.length >= minChars) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        performSearch(newFilters.query as string, newFilters.category);
      }, debounceMs);
    }
  }, [debounceMs, minChars, performSearch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    results,
    categoryResults,
    productResults,
    isLoading,
    error,
    search,
    clearResults,
    filters,
    setFilters: updateFilters,
    getCategoryProducts,
  };
}
