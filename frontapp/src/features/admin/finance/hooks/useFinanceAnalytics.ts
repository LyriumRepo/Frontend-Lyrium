'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FinanceData } from '../types';
import { apiClient } from '@/lib/api/apiClient';

export interface FinanceFilters {
    startDate: string;
    endDate: string;
}

export function useFinanceAnalytics() {
    const [data, setData] = useState<FinanceData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFiltersState] = useState<FinanceFilters>({
        startDate: '',
        endDate: ''
    });
    const [error, setError] = useState<string | null>(null);
    const hasMounted = useRef(false);

    const setFilters = (startDate: string, endDate: string) => {
        setFiltersState({ startDate, endDate });
    };

    const isVisible = (tabId: string) => activeTab === 'all' || activeTab === tabId;

    const fetchData = useCallback(async (start?: string, end?: string) => {
        try {
            setError(null);
            const params = new URLSearchParams();
            if (start) params.set('start_date', start);
            if (end) params.set('end_date', end);
            const qs = params.toString();
            const endpoint = `/admin/finance${qs ? `?${qs}` : ''}`;
            const res = await apiClient<{ success: boolean; data: FinanceData }>(endpoint);
            setData(res.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar datos financieros');
        }
    }, []);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            fetchData().finally(() => setIsLoading(false));
        }
    }, [fetchData]);

    const applyFilters = async () => {
        setIsRefreshing(true);
        await fetchData(filters.startDate, filters.endDate);
        setIsRefreshing(false);
        return true;
    };

    return {
        data,
        isLoading,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        applyFilters,
        isVisible,
        isRefreshing,
        error,
    };
}
