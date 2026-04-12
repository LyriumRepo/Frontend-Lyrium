import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from './base-client';
import { ProductResource, PaginationMeta } from './productRepository';

export interface CategoryResource {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  image?: string;
  children?: CategoryResource[];
  products_count: number;
}

async function request<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const categoryApi = {
  list: async (): Promise<CategoryResource[]> => {
    const response = await request<ApiResponse<CategoryResource[]>>('/categories');
    return response.data || [];
  },

  getBySlug: async (slug: string): Promise<CategoryResource | null> => {
    try {
      const response = await request<ApiResponse<CategoryResource>>(`/categories/${slug}`);
      return response.data || null;
    } catch {
      return null;
    }
  },

  getProducts: async (
    slugOrId: string,
    page = 1
  ): Promise<{ data: ProductResource[]; pagination: PaginationMeta }> => {
    const response = await request<ApiResponse<ProductResource[]>>(
      `/categories/${slugOrId}/products?page=${page}`
    );
    return {
      data: response.data || [],
      pagination: (response as unknown as { meta?: PaginationMeta }).meta || {
        current_page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
      },
    };
  },
};
