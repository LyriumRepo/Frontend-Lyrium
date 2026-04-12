import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
export type TransactionType = 'earn' | 'redeem' | 'expire' | 'adjust';
export type RewardStatus = 'available' | 'redeemed' | 'expired';

export interface LoyaltyProgram {
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    points_per_sol: number;
    min_points_to_redeem: number;
    created_at: string;
}

export interface LoyaltyTierConfig {
    tier: LoyaltyTier;
    name: string;
    min_points: number;
    discount_percentage: number;
    free_shipping: boolean;
    exclusive_access: boolean;
    icon?: string;
    color?: string;
}

export interface UserLoyaltyAccount {
    id: number;
    user_id: number;
    points_balance: number;
    lifetime_points: number;
    current_tier: LoyaltyTier;
    tier_progress: number;
    next_tier?: LoyaltyTier;
    points_to_next_tier: number;
    member_since: string;
    created_at: string;
    updated_at: string;
}

export interface LoyaltyTransaction {
    id: number;
    account_id: number;
    type: TransactionType;
    points: number;
    balance_after: number;
    description: string;
    order_id?: number;
    expires_at?: string;
    created_at: string;
}

export interface LoyaltyReward {
    id: number;
    name: string;
    description: string;
    points_required: number;
    discount_percentage?: number;
    discount_amount?: number;
    free_product_id?: number;
    free_shipping: boolean;
    tier_required?: LoyaltyTier;
    is_active: boolean;
    expires_at?: string;
    created_at: string;
}

export interface RedeemedReward {
    id: number;
    reward_id: number;
    reward_name: string;
    points_spent: number;
    code?: string;
    status: RewardStatus;
    redeemed_at: string;
    expires_at?: string;
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

export const loyaltyApi = {
    getProgram: async (): Promise<LoyaltyProgram | null> => {
        try {
            const response = await request<ApiResponse<LoyaltyProgram>>('/loyalty/program');
            return response.data || null;
        } catch {
            return null;
        }
    },

    getTiers: async (): Promise<LoyaltyTierConfig[]> => {
        const response = await request<ApiResponse<LoyaltyTierConfig[]>>('/loyalty/tiers');
        return response.data || [];
    },

    getMyAccount: async (): Promise<UserLoyaltyAccount | null> => {
        try {
            const response = await request<ApiResponse<UserLoyaltyAccount>>('/loyalty/account');
            return response.data || null;
        } catch {
            return null;
        }
    },

    getMyTransactions: async (type?: TransactionType): Promise<LoyaltyTransaction[]> => {
        const params = type ? `?type=${type}` : '';
        const response = await request<ApiResponse<LoyaltyTransaction[]>>(`/loyalty/transactions${params}`);
        return response.data || [];
    },

    getAvailableRewards: async (): Promise<LoyaltyReward[]> => {
        const response = await request<ApiResponse<LoyaltyReward[]>>('/loyalty/rewards');
        return response.data || [];
    },

    getMyRewards: async (): Promise<RedeemedReward[]> => {
        const response = await request<ApiResponse<RedeemedReward[]>>('/loyalty/my-rewards');
        return response.data || [];
    },

    redeemReward: async (rewardId: number): Promise<RedeemedReward> => {
        const response = await request<ApiResponse<RedeemedReward>>(`/loyalty/rewards/${rewardId}/redeem`, {
            method: 'POST',
        });
        return response.data as RedeemedReward;
    },

    calculatePoints: async (orderAmount: number): Promise<{ points: number; tier_bonus: number; total: number }> => {
        const response = await request<ApiResponse<{ points: number; tier_bonus: number; total: number }>>(`/loyalty/calculate?amount=${orderAmount}`);
        return response.data as { points: number; tier_bonus: number; total: number };
    },
};
