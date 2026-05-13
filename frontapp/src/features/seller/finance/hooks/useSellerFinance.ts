'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FinanceData } from '../types';
import { MOCK_FINANCE_DATA } from '../mock';
import { orderRepository } from '@/shared/lib/api/factory';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export interface FinanceFilters {
    startDate: string;
    endDate: string;
}

export function useSellerFinance() {
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFiltersState] = useState<FinanceFilters>({
        startDate: '',
        endDate: ''
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['seller', 'finance', filters],
        queryFn: async () => {
            if (USE_MOCKS) {
                return MOCK_FINANCE_DATA as FinanceData;
            }

            try {
                const orders = await orderRepository.getOrders();
                return { orders } as unknown as FinanceData;
            } catch (e) {
                console.warn('FALLBACK: Finance data error', e);
                return MOCK_FINANCE_DATA as FinanceData;
            }
        },
        staleTime: 10 * 60 * 1000,
    });

    const setFilters = (startDate: string, endDate: string) => {
        setFiltersState({ startDate, endDate });
    };

    const isVisible = (tabId: string) => activeTab === 'all' || activeTab === tabId;

    return {
        data: data || null,
        isLoading,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        applyFilters: async () => {
            await refetch();
            return true;
        },
        isVisible
    };
}
