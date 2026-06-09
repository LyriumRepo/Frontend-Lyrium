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

export interface SellerPayment {
    id: number;
    payment_number: string;
    store_id: number;
    order_id: number | null;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    amount: number;
    total_con_igv: number;
    igv: number;
    commission_rate: number;
    commission_amount: number;
    net_amount: number;
    payment_method: string | null;
    reference: string | null;
    scheduled_for: string | null;
    processed_at: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    order?: {
        id: number;
        order_number: string;
        total: number;
        status: string;
        userId?: string;
    } | null;
}

export interface PendingTotalResponse {
    success: boolean;
    data?: {
        total_pending: number;
        next_payment_date: string;
        next_payment_date_formatted: string;
        is_payment_day: boolean;
    };
}

export interface PaymentDayResponse {
    is_payment_day: boolean;
    active_days: string[];
}

export interface NextPaymentResponse {
    next_payment_date: string;
    next_payment_date_formatted: string;
}

function buildUrl(base: string, params?: { startDate?: string; endDate?: string }): string {
    if (!params?.startDate || !params?.endDate) return base;
    const qs = `?start_date=${encodeURIComponent(params.startDate)}&end_date=${encodeURIComponent(params.endDate)}`;
    return base + qs;
}

export interface IzipayInitResponse {
    mode: 'mock' | 'izipay';
    order_id: string;
    public_key?: string;
    form_token?: string;
    amount?: number;
}

export interface IzipayConfirmResponse {
    message: string;
    order_id: string;
    transaction_id: string;
    invoices_creadas: number;
}

export const izipayPaymentApi = {
    init: async (orderId: string): Promise<IzipayInitResponse> => {
        const res = await authFetch<{ success: boolean; data: IzipayInitResponse }>(`/payments/izipay/init/${orderId}`, {
            method: 'POST',
        });
        return res.data;
    },

    confirm: async (orderId: string): Promise<IzipayConfirmResponse> => {
        const res = await authFetch<{ success: boolean; data: IzipayConfirmResponse }>(`/payments/izipay/confirm/${orderId}`, {
            method: 'POST',
        });
        return res.data;
    },
};

export const paymentApi = {
    list: async (dateParams?: { startDate?: string; endDate?: string }): Promise<SellerPayment[]> => {
        const res = await authFetch<{ success: boolean; data: SellerPayment[] }>(buildUrl('/payments', dateParams));
        return res.data || [];
    },

    pendingPayments: async (dateParams?: { startDate?: string; endDate?: string }): Promise<SellerPayment[]> => {
        const res = await authFetch<{ success: boolean; data: SellerPayment[] }>(buildUrl('/payments/pending', dateParams));
        return res.data || [];
    },

    completedPayments: async (dateParams?: { startDate?: string; endDate?: string }): Promise<SellerPayment[]> => {
        const res = await authFetch<{ success: boolean; data: SellerPayment[] }>(buildUrl('/payments/completed', dateParams));
        return res.data || [];
    },

    pendingTotal: async (dateParams?: { startDate?: string; endDate?: string }): Promise<PendingTotalResponse> => {
        const res = await authFetch<PendingTotalResponse>(buildUrl('/payments/pending-total', dateParams));
        return res;
    },

    isPaymentDay: async (): Promise<PaymentDayResponse> => {
        const res = await authFetch<{ success: boolean } & PaymentDayResponse>('/payments/is-payment-day');
        return { is_payment_day: (res as any).is_payment_day ?? false, active_days: (res as any).active_days ?? [] };
    },

    nextPaymentDate: async (): Promise<NextPaymentResponse> => {
        const res = await authFetch<NextPaymentResponse>('/payments/next-payment-date');
        return res;
    },
};
