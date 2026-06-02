import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from '@/shared/lib/api/token-store';

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const authHeaders = await getAuthHeaders();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(authHeaders as Record<string, string>),
    };

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
        createdAt: string;
    } | null;
}

export const shipmentApi = {
    list: async (): Promise<SellerShipment[]> => {
        const res = await authFetch<{ data: SellerShipment[] }>('/shipments?per_page=1000');
        return res.data || [];
    },
};
