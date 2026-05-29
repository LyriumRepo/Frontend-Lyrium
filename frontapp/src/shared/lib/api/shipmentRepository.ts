import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

function getToken(): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, ...vals] = cookie.trim().split('=');
        if (key) acc[key] = decodeURIComponent(vals.join('='));
        return acc;
    }, {} as Record<string, string>);
    return cookies['laravel_token'] ?? null;
}

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...(options?.headers as Record<string, string> || {}) },
    });

    if (!response.ok) {
        const errBody = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errBody.error || `API Error: ${response.status}`);
    }

    return response.json();
}

export interface SellerShipment {
    id: number;
    order_id: number;
    order_item_id: number | null;
    store_id: number;
    tracking_number: string | null;
    tracking_url: string | null;
    carrier: string | null;
    status: string;
    notes: string | null;
    events: Record<string, unknown>[] | null;
    shipped_at: string | null;
    delivered_at: string | null;
    created_at: string | null;
    order?: {
        order_number: string;
    } | null;
}

export const shipmentApi = {
    list: async (): Promise<SellerShipment[]> => {
        const res = await authFetch<{ data: SellerShipment[] }>('/shipments?per_page=1000');
        return res.data || [];
    },
};
