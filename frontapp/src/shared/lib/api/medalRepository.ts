import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

export interface TopMedalEntity {
    id: string;
    name: string | null;
    slug: string;
    logo?: string | null;
    image?: string | null;
}

export interface TopMedal {
    id: string;
    entity_type: 'store' | 'product' | 'service';
    entity: TopMedalEntity | null;
    rank_position: number | null;
    status: 'pending' | 'approved' | 'suspended';
    visible: boolean;
    medal_image_url: string | null;
    times_entered: number;
    times_exited: number;
    detected_at: string;
    approved_at: string | null;
    suspended_at: string | null;
    grace_ends_at: string | null;
    created_at: string;
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

export const medalApi = {
    getAdminMedals(params: {
        entity_type?: string;
        status?: string;
        page?: number;
        per_page?: number;
    }): Promise<{
        success: boolean;
        data: TopMedal[];
        meta: PaginationMeta;
    }> {
        const p = new URLSearchParams();
        if (params.entity_type) p.set('entity_type', params.entity_type);
        if (params.status) p.set('status', params.status);
        if (params.page) p.set('page', String(params.page));
        if (params.per_page) p.set('per_page', String(params.per_page));
        return requestRaw(`/admin/medals?${p.toString()}`);
    },

    approveMedal(medalId: string): Promise<{ success: boolean; message: string; data: TopMedal }> {
        return requestRaw(`/admin/medals/${medalId}/approve`, { method: 'PUT' });
    },

    suspendMedal(medalId: string): Promise<{ success: boolean; message: string; data: TopMedal }> {
        return requestRaw(`/admin/medals/${medalId}/suspend`, { method: 'PUT' });
    },

    getSellerMedals(): Promise<{ success: boolean; data: TopMedal[] }> {
        return requestRaw('/seller/medals');
    },

    toggleMedalVisibility(medalId: string): Promise<{ success: boolean; message: string; data: TopMedal }> {
        return requestRaw(`/seller/medals/${medalId}/visibility`, { method: 'PUT' });
    },
};
