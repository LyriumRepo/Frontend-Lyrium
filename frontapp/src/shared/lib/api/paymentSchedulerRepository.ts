import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type PaymentScheduleStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'yape' | 'plin' | 'cash';

export interface PaymentSchedule {
    id: number;
    day_of_week: number;
    day_name: string;
    is_active: boolean;
    cutoff_time: string;
    created_at: string;
}

export interface SellerPayment {
    id: number;
    seller_id: number;
    seller_name: string;
    store_name: string;
    schedule_date: string;
    status: PaymentScheduleStatus;
    gross_amount: number;
    commission_percentage: number;
    commission_amount: number;
    net_amount: number;
    payment_method: PaymentMethod;
    payment_reference?: string;
    paid_at?: string;
    created_at: string;
    updated_at: string;
}

export interface PaymentSummary {
    pending_amount: number;
    processing_amount: number;
    next_payment_date: string;
    total_earned: number;
    total_paid: number;
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

export const paymentSchedulerApi = {
    listSchedules: async (): Promise<PaymentSchedule[]> => {
        const response = await request<ApiResponse<PaymentSchedule[]>>('/payments/schedules');
        return response.data || [];
    },

    getSellerPayments: async (status?: PaymentScheduleStatus): Promise<SellerPayment[]> => {
        const params = status ? `?status=${status}` : '';
        const response = await request<ApiResponse<SellerPayment[]>>(`/payments/seller${params}`);
        return response.data || [];
    },

    getPaymentSummary: async (): Promise<PaymentSummary> => {
        const response = await request<ApiResponse<PaymentSummary>>('/payments/summary');
        return response.data as PaymentSummary;
    },

    getNextPaymentDate: async (): Promise<{ date: string; day_name: string }> => {
        const response = await request<ApiResponse<{ date: string; day_name: string }>>('/payments/next');
        return response.data as { date: string; day_name: string };
    },

    requestPayment: async (paymentMethod: PaymentMethod): Promise<SellerPayment> => {
        const response = await request<ApiResponse<SellerPayment>>('/payments/request', {
            method: 'POST',
            body: JSON.stringify({ payment_method: paymentMethod }),
        });
        return response.data as SellerPayment;
    },

    getPaymentHistory: async (): Promise<SellerPayment[]> => {
        const response = await request<ApiResponse<SellerPayment[]>>('/payments/history');
        return response.data || [];
    },
};
