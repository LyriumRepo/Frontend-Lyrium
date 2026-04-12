import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export interface SellerProfile {
  id: number;
  email: string;
  username: string;
  displayName: string;
  role: 'customer' | 'seller' | 'admin';
  avatar?: string;
  emailVerifiedAt: string | null;
  store?: StoreData | null;
  createdAt: string;
}

export interface StoreData {
  id: number;
  user_id: number;
  store_name: string;
  trade_name?: string;
  slug: string;
  logo?: string;
  banner?: string;
  banner2?: string;
  gallery?: string[];
  description?: string;
  email: string;
  phone?: string;
  show_email?: boolean;
  status: 'pending' | 'active' | 'approved' | 'suspended' | 'banned' | 'rejected' | string;
  profile_status: 'approved' | 'pending_review' | 'rejected';
  profile_updated_at?: string;
  commission_rate: number;
  rating?: number;
  total_sales: number;
  verified_at?: string;
  ruc?: string;
  razon_social?: string;
  nombre_comercial?: string;
  rep_legal_nombre?: string;
  rep_legal_dni?: string;
  rep_legal_foto?: string;
  experience_years?: number;
  tax_condition?: string;
  direccion_fiscal?: string;
  cuenta_bcp?: string;
  cci?: string;
  bank_secondary?: string | { bank?: string; account?: string; cci?: string };
  category_id?: number;
  activity?: string;
  corporate_email?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  subscription?: {
    plan: 'emprende' | 'crece' | 'especial';
    status: string;
    ends_at?: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    fb?: string;
    tiktok?: string;
    threads?: string;
    youtube?: string;
    web?: string;
  };
  policies?: string;
  policyFiles?: {
    shipping?: string;
    return?: string;
    privacy?: string;
  };
  branches?: StoreBranch[];
}

export interface StoreBranch {
  id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  hours?: string;
  is_principal: boolean;
  maps_url?: string;
  is_active?: boolean;
}

export interface UpdateSellerProfilePayload {
  displayName?: string;
  phone?: string;
  avatar?: string;
}

export interface CreateStorePayload {
  store_name: string;
  email?: string;
  phone?: string;
  description?: string;
}

export interface UpdateStorePayload {
  store_name?: string;
  trade_name?: string;
  description?: string;
  phone?: string;
  email?: string;
  corporate_email?: string;
  address?: string;
  activity?: string;
  ruc?: string;
  razon_social?: string;
  nombre_comercial?: string;
  rep_legal_nombre?: string;
  rep_legal_dni?: string;
  rep_legal_foto?: string;
  experience_years?: number;
  tax_condition?: string;
  direccion_fiscal?: string;
  cuenta_bcp?: string;
  cci?: string;
  bank_secondary?: string | { bank?: string; account?: string; cci?: string };
  category_id?: number;
  policies?: string;
  gallery?: string[];
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  youtube?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
  social?: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    whatsapp?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

async function getAuthToken(): Promise<string | null> {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/laravel_token=([^;]+)/);
    if (match && match[1]) {
      const rawToken = match[1];
      const token = rawToken.includes('%') ? decodeURIComponent(rawToken) : rawToken;
      console.log('[sellerApi] Token (client):', token.substring(0, 20) + '...');
      return token;
    }
    console.log('[sellerApi] No laravel_token cookie found in client');
    return null;
  }
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const value = cookieStore.get('laravel_token')?.value ?? null;
    console.log('[sellerApi] Token from server cookies:', value ? 'found' : 'not found');
    return value;
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = LARAVEL_API_URL;
  const token = await getAuthToken();

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const sellerApi = {
  createStore: async (payload: CreateStorePayload): Promise<StoreData> => {
    const response = await request<ApiResponse<StoreData>>('/stores', {
      method: 'POST',
      body: JSON.stringify({
        store_name: payload.store_name,
        email: payload.email,
        phone: payload.phone,
        description: payload.description,
      }),
    });
    return response.data as StoreData;
  },

  getStore: async (): Promise<StoreData | null> => {
    try {
      const response = await request<ApiResponse<StoreData> | null>('/stores/me');
      if (!response || !response.data) return null;
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('401') || errorMsg.includes('Unauthenticated') || errorMsg.includes('401')) {
        console.log('[sellerApi] Not authenticated, skipping store fetch');
        return null;
      }
      console.log('[sellerApi] getStore error:', errorMsg);
      return null;
    }
  },

  getSellerStore: async (): Promise<StoreData | null> => {
    try {
      const response = await request<ApiResponse<StoreData> | null>('/stores/me');
      if (!response || !response.data) return null;
      return response.data;
    } catch (error: any) {
      const errorMsg = error?.message || '';
      if (errorMsg.includes('401') || errorMsg.includes('Unauthenticated')) {
        console.log('[sellerApi] Not authenticated, skipping store fetch');
        return null;
      }
      console.log('[sellerApi] getSellerStore error:', errorMsg);
      return null;
    }
  },

  getStoreById: async (id: number): Promise<StoreData | null> => {
    try {
      const response = await request<ApiResponse<StoreData>>(`/stores/${id}`);
      return response.data ?? null;
    } catch (error) {
      console.error('[sellerApi] getStoreById error:', error);
      return null;
    }
  },

  updateStore: async (id: number, payload: UpdateStorePayload): Promise<StoreData> => {
    const response = await request<ApiResponse<StoreData>>(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data as StoreData;
  },

  updateStoreStatus: async (id: number, status: string, reason?: string): Promise<StoreData> => {
    const response = await request<ApiResponse<StoreData>>(`/stores/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
    return response.data as StoreData;
  },

  getAllStores: async (): Promise<StoreData[]> => {
    try {
      const response = await request<ApiResponse<StoreData[]>>('/stores', {
        method: 'GET',
      });
      return response.data || [];
    } catch (error: any) {
      console.error('[sellerApi] getAllStores error:', error);
      return [];
    }
  },

  getBranches: async (storeId: number): Promise<StoreBranch[]> => {
    try {
      const response = await request<ApiResponse<StoreBranch[]>>(`/stores/${storeId}/branches`);
      return response.data || [];
    } catch (error: any) {
      console.error('[sellerApi] getBranches error:', error);
      return [];
    }
  },

  updateBranches: async (storeId: number, branches: Partial<StoreBranch>[]): Promise<StoreData> => {
    const response = await request<ApiResponse<StoreData>>(`/stores/${storeId}/branches`, {
      method: 'PUT',
      body: JSON.stringify({ branches }),
    });
    return response.data as StoreData;
  },

  uploadPolicy: async (
    storeId: number,
    file: File,
    type: 'shipping' | 'return' | 'privacy'
  ): Promise<{ url: string }> => {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await fetch(`${LARAVEL_API_URL}/stores/${storeId}/media/policy`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return { url: data.data?.url || '' };
  },

  deletePolicy: async (
    storeId: number,
    type: 'shipping' | 'return' | 'privacy'
  ): Promise<void> => {
    const token = await getAuthToken();

    const response = await fetch(`${LARAVEL_API_URL}/stores/${storeId}/media/policy/${type}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }
  },

  uploadLogo: async (storeId: number, file: File): Promise<{ url: string }> => {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${LARAVEL_API_URL}/stores/${storeId}/media/logo`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const logoUrl = data.data?.url || data.data?.logo || '';
    return { url: logoUrl };
  },

  uploadBanner: async (storeId: number, file: File, bannerNumber: 1 | 2 = 1): Promise<{ url: string }> => {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const endpoint = bannerNumber === 2 ? 'banner2' : 'banner';
    const response = await fetch(`${LARAVEL_API_URL}/stores/${storeId}/media/${endpoint}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    const bannerKey = bannerNumber === 2 ? 'banner2' : 'banner';
    const bannerUrl = data.data?.url || data.data?.[bannerKey] || data.banner || data.banner1 || '';
    return { url: bannerUrl };
  },

  uploadGallery: async (storeId: number, file: File): Promise<{ url: string }> => {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${LARAVEL_API_URL}/stores/${storeId}/media/gallery`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return { url: data.data?.url || '' };
  },

  deleteGalleryItem: async (storeId: number, mediaId: number): Promise<void> => {
    const token = await getAuthToken();

    const response = await fetch(`${LARAVEL_API_URL}/stores/${storeId}/media/gallery/${mediaId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `API Error: ${response.status}`);
    }
  },

  updateVisual: async (storeId: number, payload: {
    layout?: string;
    logo?: string;
    banner?: string;
    banner_secondary?: string;
    gallery?: string[];
  }): Promise<StoreData> => {
    const response = await request<ApiResponse<StoreData>>(`/stores/me/visual`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data as StoreData;
  },

  // Profile Request - Approval Flow
  getProfileRequest: async (): Promise<{
    id: number;
    store_id: number;
    data: Record<string, unknown>;
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    attempts: number;
    created_at: string;
    updated_at: string;
  } | null> => {
    try {
      const response = await request<ApiResponse<any>>(`/stores/me/profile-request`);
      return response.data || null;
    } catch {
      return null;
    }
  },

  createProfileRequest: async (payload: {
    razon_social?: string;
    ruc?: string;
    rep_legal_nombre?: string;
    rep_legal_dni?: string;
    cuenta_bcp?: string;
    cci?: string;
  }): Promise<any> => {
    const response = await request<ApiResponse<any>>(`/stores/me/profile-request`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return response.data;
  },

  // Admin - Profile Requests
  getAllProfileRequests: async (): Promise<Array<any>> => {
    const response = await request<ApiResponse<any[]>>(`/admin/profile-requests`);
    return response.data || [];
  },

  approveProfileRequest: async (id: number, notes?: string): Promise<any> => {
    const response = await request<ApiResponse<any>>(`/admin/profile-requests/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ admin_notes: notes || '' }),
    });
    return response.data;
  },

  rejectProfileRequest: async (id: number, notes: string): Promise<any> => {
    const response = await request<ApiResponse<any>>(`/admin/profile-requests/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ admin_notes: notes }),
    });
    return response.data;
  },
};
