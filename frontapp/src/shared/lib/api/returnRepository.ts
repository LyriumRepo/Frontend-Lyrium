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

export interface SellerReturn {
    id: number;
    return_number: string;
    status: string;
    reason: string;
    reason_details: string | null;
    resolution_notes: string | null;
    refund_amount: number | null;
    refund_method: string | null;
    shipping_carrier: string | null;
    tracking_number: string | null;
    requested_at: string | null;
    reviewed_at: string | null;
    resolved_at: string | null;
    created_at: string | null;
    order?: {
        id: number;
        order_number: string;
    } | null;
}

export const returnApi = {
    list: async (): Promise<SellerReturn[]> => {
        const res = await authFetch<{ data: SellerReturn[] }>('/returns?per_page=1000');
        return res.data || [];
    },
};
