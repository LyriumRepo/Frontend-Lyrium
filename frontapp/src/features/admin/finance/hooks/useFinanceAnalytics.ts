'use client';

import { useState } from 'react';
import { FinanceData } from '../types';
import { MOCK_FINANCE_DATA } from '../mock';

export interface FinanceFilters {
    startDate: string;
    endDate: string;
}

export function useFinanceAnalytics() {
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFiltersState] = useState<FinanceFilters>({
        startDate: '',
        endDate: ''
    });
    const [isRefreshing, setIsRefreshing] = useState(false);

    const setFilters = (startDate: string, endDate: string) => {
        setFiltersState({ startDate, endDate });
    };

    const isVisible = (tabId: string) => activeTab === 'all' || activeTab === tabId;

    const applyFilters = async () => {
        setIsRefreshing(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsRefreshing(false);
        return true;
    };

    return {
        data: MOCK_FINANCE_DATA,
        isLoading: false,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        applyFilters,
        isVisible,
        isRefreshing
    };
}
