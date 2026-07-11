import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

export interface Training {
    id: number;
    title: string;
    description: string;
    url: string;
    platform: string;
    thumbnail: string | null;
    category: string | null;
    sort_order: number;
    is_required: boolean;
    is_published: boolean;
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface TrainingStats {
    total: number;
    completed: number;
    required: number;
    required_completed: number;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
}

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
    const now = Date.now();
    if (_tokenCache && now - _tokenCache.ts < 30_000) return _tokenCache.value;
    if (typeof window !== 'undefined') {
        const local = localStorage.getItem('laravel_token');
        if (local) {
            _tokenCache = { value: local, ts: now };
            return local;
        }
    }
    try {
        const res = await fetch('/api/auth-token', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) return null;
        const { token } = await res.json();
        const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
        _tokenCache = { value: clean, ts: now };
        return clean;
    } catch { return null; }
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

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = await buildHeaders();
    const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options.headers ?? {}) },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
    return json as T;
}

export interface SellerTrainingProgress {
    store_id: number;
    trade_name: string;
    seller_name: string;
    seller_email: string;
    total_trainings: number;
    completed_trainings: number;
    required_trainings: number;
    required_completed: number;
    progress_percent: number;
    required_pending: Array<{ id: number; title: string }>;
}

export interface TrainingComplianceMeta {
    total_sellers: number;
    total_trainings: number;
    total_required: number;
    overall_completion: number;
    required_completion: number;
}

export const trainingApi = {
    // ── Admin ──
    getAdminTrainings(params?: { page?: number; per_page?: number }): Promise<{
        success: boolean;
        data: Training[];
        meta: PaginationMeta;
    }> {
        const p = new URLSearchParams();
        if (params?.page) p.set('page', String(params.page));
        if (params?.per_page) p.set('per_page', String(params.per_page));
        const qs = p.toString();
        return request(`/admin/trainings${qs ? `?${qs}` : ''}`);
    },

    getAdminTraining(id: number): Promise<{ success: boolean; data: Training }> {
        return request(`/admin/trainings/${id}`);
    },

    createTraining(data: Partial<Training>): Promise<{ success: boolean; data: Training }> {
        return request('/admin/trainings', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    updateTraining(id: number, data: Partial<Training>): Promise<{ success: boolean; data: Training }> {
        return request(`/admin/trainings/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    deleteTraining(id: number): Promise<{ success: boolean }> {
        return request(`/admin/trainings/${id}`, { method: 'DELETE' });
    },

    // No hay endpoint de media genérico utilizable por un administrador (los
    // existentes exigen ser dueño de una tienda/producto) — este sube la
    // portada dentro del propio módulo de capacitaciones.
    async uploadThumbnail(file: File): Promise<{ url: string }> {
        const token = await getAuthToken();
        const formData = new FormData();
        formData.append('file', file);

        const headers: Record<string, string> = { Accept: 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${LARAVEL_API_URL}/admin/trainings/thumbnail`, {
            method: 'POST',
            headers,
            body: formData,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? `Error ${res.status}`);
        return json.data;
    },

    // ── Seller ──
    getSellerTrainings(): Promise<{ success: boolean; data: Training[] }> {
        return request('/seller/trainings');
    },

    getSellerStats(): Promise<{ success: boolean; data: TrainingStats }> {
        return request('/seller/trainings/stats');
    },

    markCompleted(trainingId: number): Promise<{ success: boolean; message: string }> {
        return request(`/seller/trainings/${trainingId}/complete`, { method: 'PUT' });
    },

    markIncomplete(trainingId: number): Promise<{ success: boolean; message: string }> {
        return request(`/seller/trainings/${trainingId}/incomplete`, { method: 'PUT' });
    },

    // ── Admin compliance ──
    getTrainingCompliance(): Promise<{
        success: boolean;
        data: SellerTrainingProgress[];
        meta: TrainingComplianceMeta;
    }> {
        return request('/admin/trainings/progress');
    },
};
