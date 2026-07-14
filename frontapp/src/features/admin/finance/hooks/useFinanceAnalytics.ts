'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import type { FinanceData } from '../types';

export interface FinanceFilters {
    startDate: string;
    endDate: string;
}

function defaultFilters(): FinanceFilters {
    const now = new Date();
    const startOfYear = `${now.getFullYear()}-01-01`;
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];
    return { startDate: startOfYear, endDate: endOfMonth };
}

export function useFinanceAnalytics() {
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFiltersState] = useState<FinanceFilters>(defaultFilters);
    const [appliedFilters, setAppliedFilters] = useState<FinanceFilters>(defaultFilters);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, isLoading, refetch } = useQuery<FinanceData>({
        queryKey: ['admin', 'finance', appliedFilters.startDate, appliedFilters.endDate],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (appliedFilters.startDate) params.set('start_date', appliedFilters.startDate);
            if (appliedFilters.endDate) params.set('end_date', appliedFilters.endDate);
            const res = await apiClient<{ success: boolean; data: FinanceData }>(
                `/admin/finance?${params.toString()}`
            );
            if (!res.success) throw new Error('Error al cargar datos financieros');
            return res.data;
        },
        staleTime: 5 * 60 * 1000,
    });

    const setFilters = useCallback((startDate: string, endDate: string) => {
        setFiltersState({ startDate, endDate });
    }, []);

    const applyFilters = useCallback(async () => {
        setIsRefreshing(true);
        setAppliedFilters({ ...filters });
        const result = await refetch();
        setIsRefreshing(false);
        return !result.error;
    }, [filters, refetch]);

    const isVisible = useCallback(
        (tabId: string) => activeTab === 'all' || activeTab === tabId,
        [activeTab]
    );

    return {
        data: data ?? null,
        isLoading,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        applyFilters,
        isVisible,
        isRefreshing,
    };
}
