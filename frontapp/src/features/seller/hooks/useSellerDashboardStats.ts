'use client';

import { useQuery } from '@tanstack/react-query';
import { orderRepository } from '@/shared/lib/api/factory';

export interface SellerDashboardStats {
    monthlySales: number;
    todayOrders: number;
}

export function useSellerDashboardStats() {
    return useQuery<SellerDashboardStats>({
        queryKey: ['seller', 'dashboard-stats'],
        queryFn: () => orderRepository.getDashboardStats(),
        staleTime: 60_000,
        refetchOnWindowFocus: false,
    });
}
