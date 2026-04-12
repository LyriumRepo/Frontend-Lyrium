import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
export type ReturnReason = 'defective_product' | 'wrong_item' | 'not_as_described' | 'changed_mind' | 'other';
export type RefundMethod = 'original_payment' | 'store_credit' | 'bank_transfer';

export interface ReturnItem {
    id: number;
    product_id: number;
    product_name: string;
    product_image?: string;
    quantity: number;
    price: number;
    reason: ReturnReason;
    reason_text?: string;
}

export interface Return {
    id: number;
    order_id: number;
    store_id: number;
    store_name: string;
    customer_id: number;
    customer_name: string;
    customer_email: string;
    status: ReturnStatus;
    reason: ReturnReason;
    reason_text?: string;
    items: ReturnItem[];
    total_amount: number;
    currency: string;
    refund_method: RefundMethod;
    refund_amount?: number;
    refund_notes?: string;
    approved_by?: number;
    approved_at?: string;
    rejected_by?: number;
    rejected_at?: string;
    rejection_reason?: string;
    completed_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateReturnInput {
    order_id: number;
    reason: ReturnReason;
    reason_text?: string;
    items: Array<{
        product_id: number;
        quantity: number;
        price: number;
        reason: ReturnReason;
        reason_text?: string;
    }>;
}

export interface ProcessReturnInput {
    status: 'approved' | 'rejected' | 'completed';
    refund_method?: RefundMethod;
    refund_amount?: number;
    refund_notes?: string;
    rejection_reason?: string;
    notes?: string;
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
}

export const returnApi = {
    list: async (status?: ReturnStatus): Promise<Return[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<Return[]>>(`/returns${params}`);
        return response.data || [];
    },

    myReturns: async (): Promise<Return[]> => {
        const response = await request<ApiResponse<Return[]>>('/returns/my');
        return response.data || [];
    },

    sellerReturns: async (status?: ReturnStatus): Promise<Return[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<Return[]>>(`/returns/seller${params}`);
        return response.data || [];
    },

    getById: async (id: number): Promise<Return | null> => {
        try {
            const response = await request<ApiResponse<Return>>(`/returns/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    create: async (input: CreateReturnInput): Promise<Return> => {
        const response = await request<ApiResponse<Return>>('/returns', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Return;
    },

    process: async (id: number, input: ProcessReturnInput): Promise<Return> => {
        const response = await request<ApiResponse<Return>>(`/returns/${id}/process`, {
            method: 'PUT',
            body: JSON.stringify(input),
        });
        return response.data as Return;
    },

    approve: async (id: number, notes?: string): Promise<Return> => {
        const response = await request<ApiResponse<Return>>(`/returns/${id}/approve`, {
            method: 'PUT',
            body: JSON.stringify({ notes }),
        });
        return response.data as Return;
    },

    reject: async (id: number, reason: string): Promise<Return> => {
        const response = await request<ApiResponse<Return>>(`/returns/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
        return response.data as Return;
    },

    complete: async (id: number, refund_method: RefundMethod, refund_amount: number, notes?: string): Promise<Return> => {
        const response = await request<ApiResponse<Return>>(`/returns/${id}/complete`, {
            method: 'PUT',
            body: JSON.stringify({ refund_method, refund_amount, notes }),
        });
        return response.data as Return;
    },

    addNote: async (id: number, notes: string): Promise<Return> => {
        const response = await request<ApiResponse<Return>>(`/returns/${id}/notes`, {
            method: 'PUT',
            body: JSON.stringify({ notes }),
        });
        return response.data as Return;
    },

    cancel: async (id: number, reason?: string): Promise<Return> => {
        const response = await request<ApiResponse<Return>>(`/returns/${id}/cancel`, {
            method: 'PUT',
            body: JSON.stringify({ reason }),
        });
        return response.data as Return;
    },
};
