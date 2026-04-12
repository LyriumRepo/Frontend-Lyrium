import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from './base-client';

export interface ProductImage {
  id: number;
  url: string;
  alt?: string;
  position: number;
  is_featured: boolean;
}

export interface CategoryBasic {
  id: number;
  name: string;
  slug: string;
}

export interface SellerBasic {
  id: number;
  storeName: string;
  slug: string;
  logo?: string;
  rating?: number;
}

export type ProductType = 'physical' | 'digital' | 'service';
export type ProductStatus = 'draft' | 'published' | 'archived';
export type SortOption = 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating';

export interface ProductResource {
  id: number;
  name: string;
  slug: string;
  type: ProductType;
  description: string;
  short_description: string;
  price: number;
  regular_price?: number;
  sale_price?: number;
  stock_quantity?: number;
  sku?: string;
  images: ProductImage[];
  categories: CategoryBasic[];
  seller: SellerBasic;
  status: ProductStatus;
  rating_promedio?: number;
  rating_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateProductPayload {
  name: string;
  type?: ProductType;
  description?: string;
  short_description?: string;
  price: number;
  regular_price?: number;
  sale_price?: number;
  stock_quantity?: number;
  sku?: string;
  categories?: number[];
  images?: File[];
}

export interface UpdateProductPayload {
  name?: string;
  type?: ProductType;
  description?: string;
  short_description?: string;
  price?: number;
  regular_price?: number;
  sale_price?: number;
  stock_quantity?: number;
  sku?: string;
  categories?: number[];
  images?: File[];
  status?: ProductStatus;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  type?: ProductType;
  min_price?: number;
  max_price?: number;
  sort?: SortOption;
  seller_id?: number;
  page?: number;
  per_page?: number;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === 'undefined') return {};
  const match = document.cookie.match(/laravel_token=([^;]+)/);
  return match ? { Authorization: `Bearer ${match[1]}` } : {};
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw { message: error.message || `API Error: ${response.status}`, status: response.status };
  }

  return response.json();
}

export const productApi = {
  list: async (filters: ProductFilters = {}): Promise<{ data: ProductResource[]; pagination: PaginationMeta }> => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category) params.set('category', filters.category);
    if (filters.type) params.set('type', filters.type);
    if (filters.min_price) params.set('min_price', String(filters.min_price));
    if (filters.max_price) params.set('max_price', String(filters.max_price));
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.seller_id) params.set('seller_id', String(filters.seller_id));
    if (filters.page) params.set('page', String(filters.page));
    if (filters.per_page) params.set('per_page', String(filters.per_page));

    const query = params.toString() ? `?${params.toString()}` : '';
    const response = await request<ApiResponse<ProductResource[]>>(`/products${query}`);
    return {
      data: response.data || [],
      pagination: (response as unknown as { meta?: PaginationMeta }).meta || { current_page: 1, per_page: 20, total: 0, total_pages: 0 }
    };
  },

  get: async (id: number): Promise<ProductResource | null> => {
    try {
      const response = await request<ApiResponse<ProductResource>>(`/products/${id}`);
      return response.data || null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateProductPayload): Promise<ProductResource> => {
    const formData = new FormData();
    formData.append('name', payload.name);
    formData.append('type', payload.type || 'physical');
    if (payload.description) formData.append('description', payload.description);
    if (payload.short_description) formData.append('short_description', payload.short_description);
    formData.append('price', String(payload.price));
    if (payload.stock_quantity !== undefined) formData.append('stock_quantity', String(payload.stock_quantity));
    if (payload.sku) formData.append('sku', payload.sku);
    if (payload.categories) {
      payload.categories.forEach((catId) => formData.append('categories[]', String(catId)));
    }
    if (payload.images) {
      payload.images.forEach((img) => formData.append('images[]', img));
    }

    const response = await request<ApiResponse<ProductResource>>('/products', {
      method: 'POST',
      body: formData,
      headers: {},
    });
    return response.data!;
  },

  update: async (id: number, payload: UpdateProductPayload): Promise<ProductResource> => {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => formData.append(`${key}[]`, String(v)));
        } else if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await request<ApiResponse<ProductResource>>(`/products/${id}`, {
      method: 'POST',
      body: formData,
      headers: {},
    });
    return response.data!;
  },

  delete: async (id: number): Promise<void> => {
    await request(`/products/${id}`, { method: 'DELETE' });
  },

  getMyProducts: async (page = 1): Promise<{ data: ProductResource[]; pagination: PaginationMeta }> => {
    const response = await request<ApiResponse<ProductResource[]>>(`/seller/products?page=${page}`);
    return {
      data: response.data || [],
      pagination: (response as unknown as { meta?: PaginationMeta }).meta || { current_page: 1, per_page: 20, total: 0, total_pages: 0 }
    };
  },
};
