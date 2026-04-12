import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from './base-client';
import { ProductResource } from './productRepository';
import { CategoryResource } from './categoryRepository';
import type { StoreData } from './sellerRepository';

export interface SearchResponse {
  products: ProductResource[];
  categories: CategoryResource[];
  sellers: StoreData[];
  total_hits: number;
  processing_time_ms: number;
}

export type SearchType = 'products' | 'sellers' | 'all';

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const searchApi = {
  search: async (
    query: string,
    type: SearchType = 'all'
  ): Promise<SearchResponse> => {
    const params = new URLSearchParams({ q: query, type });
    const response = await request<ApiResponse<SearchResponse>>(`/search?${params}`);
    return response.data || {
      products: [],
      categories: [],
      sellers: [],
      total_hits: 0,
      processing_time_ms: 0,
    };
  },
};
