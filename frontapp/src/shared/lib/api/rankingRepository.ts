import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ProductRanking {
  id: string;
  name: string;
  slug: string;
  rating_average: number;
  rating_count: number;
  price: number;
  in_stock: boolean;
  image: string | null;
  categories: { name: string; slug: string }[];
  store: { id: string; name: string | null; slug: string; logo: string | null };
}

export interface StoreRanking {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating_average: number;
  review_count: number;
}

export interface ServiceRanking {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  duration_minutes: number;
  is_home_service: boolean;
  rating_average: number;
  rating_count: number;
  store: { id: string; name: string | null; slug: string; logo: string | null };
}

export interface ReviewReport {
  id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'accepted' | 'dismissed';
  review: {
    id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    user: { id: string; name: string } | null;
    product: { id: string; name: string; slug: string } | null;
  };
  reporter: { id: string; name: string } | null;
  moderator: { id: string; name: string } | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  reports_count: number;
  createdAt: string;
  user: { id: string; name: string } | null;
  product: { id: string; name: string; slug: string } | null;
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ─── Auth token ───────────────────────────────────────────────────────────────

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) return _tokenCache.value;
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

async function buildHeaders(): Promise<HeadersInit> {
  const token = await getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/**
 * Siempre devuelve el JSON completo tal como lo manda el backend:
 * { success, data: [...], meta: {...} }
 * El componente es responsable de leer .data y .meta.
 */
async function requestRaw<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await buildHeaders();
  const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
  return json as T;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export const rankingApi = {
  // ── Rankings públicos ────────────────────────────────────────────────────

  getTopProducts(
    limit = 100,
    minReviews = 1,
    minSales = 3,
  ): Promise<{
    success: boolean;
    data: ProductRanking[];
    meta: { total: number };
  }> {
    return requestRaw(
      `/rankings/products?limit=${limit}&min_reviews=${minReviews}&min_sales=${minSales}`,
    );
  },

  getTopStores(
    limit = 20,
  ): Promise<{ success: boolean; data: StoreRanking[] }> {
    return requestRaw(`/rankings/stores?limit=${limit}`);
  },

  getTopServices(
    limit = 20,
  ): Promise<{ success: boolean; data: ServiceRanking[] }> {
    return requestRaw(`/rankings/services?limit=${limit}`);
  },

  // ── Admin — reseñas ──────────────────────────────────────────────────────

  getAdminReviews(params: {
    page?: number;
    per_page?: number;
    search?: string;
    rating?: number;
    reported?: boolean;
  }): Promise<{ success: boolean; data: AdminReview[]; meta: PaginationMeta }> {
    const p = new URLSearchParams();
    if (params.page) p.set('page', String(params.page));
    if (params.per_page) p.set('per_page', String(params.per_page));
    if (params.search) p.set('search', params.search);
    if (params.rating) p.set('rating', String(params.rating));
    if (params.reported) p.set('reported', 'true');
    return requestRaw(`/admin/reviews?${p.toString()}`);
  },

  getReportedReviews(params: {
    status?: 'pending' | 'accepted' | 'dismissed';
    page?: number;
    per_page?: number;
  }): Promise<{
    success: boolean;
    data: ReviewReport[];
    meta: PaginationMeta;
  }> {
    const p = new URLSearchParams();
    if (params.status) p.set('status', params.status);
    if (params.page) p.set('page', String(params.page));
    if (params.per_page) p.set('per_page', String(params.per_page));
    return requestRaw(`/admin/reviews/reported?${p.toString()}`);
  },

  // ── Admin — acciones ─────────────────────────────────────────────────────

  moderateReview(
    reviewId: string,
    action: 'accept' | 'dismiss',
    reportId?: string,
  ): Promise<{ success: boolean; message: string }> {
    return requestRaw(`/admin/reviews/${reviewId}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({
        action,
        ...(reportId ? { report_id: reportId } : {}),
      }),
    });
  },

  deleteReview(
    reviewId: string,
  ): Promise<{ success: boolean; message: string }> {
    return requestRaw(`/admin/reviews/${reviewId}`, { method: 'DELETE' });
  },
};
