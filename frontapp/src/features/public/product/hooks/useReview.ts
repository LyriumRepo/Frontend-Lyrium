// features/public/product/hooks/useReviews.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  LaravelReview,
  ReviewStats,
  LaravelReviewsResponse,
} from '../types';

interface UseReviewsReturn {
  reviews: LaravelReview[];
  stats: ReviewStats | null;
  pagination: LaravelReviewsResponse['pagination'] | null;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useReviews(productId: string): UseReviewsReturn {
  const [reviews, setReviews] = useState<LaravelReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [pagination, setPagination] = useState<
    LaravelReviewsResponse['pagination'] | null
  >(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

  const fetchReviews = useCallback(
    async (pageNum: number, append: boolean) => {
      if (!productId) return;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${baseUrl}/reviews?product_id=${productId}&page=${pageNum}&per_page=10`,
          { headers: { Accept: 'application/json' } },
        );

        if (!res.ok) throw new Error(`Error ${res.status}`);

        const json: { data: LaravelReviewsResponse } = await res.json();
        const inner = json.data;

        setReviews((prev) => (append ? [...prev, ...inner.data] : inner.data));
        setStats(inner.stats);
        setPagination(inner.pagination);
      } catch (err) {
        setError('No se pudieron cargar las reseñas.');
        console.error('[useReviews]', err);
      } finally {
        setLoading(false);
      }
    },
    [productId, baseUrl],
  );

  // Carga inicial — resetea cuando cambia el productId
  useEffect(() => {
    setReviews([]);
    setStats(null);
    setPagination(null);
    setPage(1);
    fetchReviews(1, false);
  }, [productId]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = useCallback(() => {
    if (loading || !pagination?.hasMore) return;
    const next = page + 1;
    setPage(next);
    fetchReviews(next, true);
  }, [loading, pagination?.hasMore, page, fetchReviews]);

  const refresh = useCallback(() => {
    setPage(1);
    fetchReviews(1, false);
  }, [fetchReviews]);

  return { reviews, stats, pagination, loading, error, loadMore, refresh };
}
