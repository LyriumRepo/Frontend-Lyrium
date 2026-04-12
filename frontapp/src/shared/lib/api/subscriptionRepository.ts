import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type PlanType = 'emprende' | 'crece' | 'especial';

export interface Plan {
    id: number;
    name: string;
    slug: PlanType;
    description: string;
    monthly_fee: number;
    annual_fee: number;
    commission_rate: number;
    has_membership_fee: boolean;
    membership_fee?: number;
    features: string[];
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Subscription {
    id: number;
    user_id: number;
    store_id: number;
    plan_id: number;
    plan: Plan;
    status: 'active' | 'pending' | 'cancelled' | 'expired';
    started_at: string;
    expires_at: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSubscriptionInput {
    plan_id: number;
    duration_months: number;
    payment_method?: string;
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

export const subscriptionApi = {
    listPlans: async (): Promise<Plan[]> => {
        const response = await request<ApiResponse<Plan[]>>('/plans');
        return response.data || [];
    },

    getPlan: async (id: number): Promise<Plan | null> => {
        try {
            const response = await request<ApiResponse<Plan>>(`/plans/${id}`);
            return response.data || null;
        } catch {
            return null;
        }
    },

    getCurrentSubscription: async (): Promise<Subscription | null> => {
        try {
            const response = await request<ApiResponse<Subscription>>('/subscriptions');
            return response.data || null;
        } catch {
            return null;
        }
    },

    create: async (input: CreateSubscriptionInput): Promise<Subscription> => {
        const response = await request<ApiResponse<Subscription>>('/subscriptions', {
            method: 'POST',
            body: JSON.stringify(input),
        });
        return response.data as Subscription;
    },

    cancel: async (id: number): Promise<Subscription> => {
        const response = await request<ApiResponse<Subscription>>(`/subscriptions/${id}/cancel`, {
            method: 'PUT',
        });
        return response.data as Subscription;
    },

    renew: async (id: number, durationMonths: number): Promise<Subscription> => {
        const response = await request<ApiResponse<Subscription>>(`/subscriptions/${id}/renew`, {
            method: 'PUT',
            body: JSON.stringify({ duration_months: durationMonths }),
        });
        return response.data as Subscription;
    },
};
