import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from './base-client';

export type MediaCollection = 'product_images' | 'seller_logo' | 'seller_banner' | 'documents';

export interface MediaFile {
  id: number;
  file_name: string;
  url: string;
  mime_type: string;
  size: number;
  collection: MediaCollection;
  created_at: string;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === 'undefined') return {};
  const match = document.cookie.match(/laravel_token=([^;]+)/);
  return match ? { Authorization: `Bearer ${match[1]}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
      ...headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const mediaApi = {
  upload: async (
    file: File,
    collection: MediaCollection = 'product_images'
  ): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('collection', collection);

    const response = await request<ApiResponse<MediaFile>>('/media', {
      method: 'POST',
      body: formData,
      headers: {},
    });
    return response.data!;
  },

  uploadMultiple: async (
    files: File[],
    collection: MediaCollection = 'product_images'
  ): Promise<MediaFile[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files[]', file));
    formData.append('collection', collection);

    const response = await request<ApiResponse<MediaFile[]>>('/media', {
      method: 'POST',
      body: formData,
      headers: {},
    });
    return response.data || [];
  },

  list: async (collection?: MediaCollection): Promise<MediaFile[]> => {
    const params = collection ? `?collection=${collection}` : '';
    const response = await request<ApiResponse<MediaFile[]>>(`/media${params}`);
    return response.data || [];
  },

  delete: async (id: number): Promise<void> => {
    await request(`/media/${id}`, { method: 'DELETE' });
  },
};
