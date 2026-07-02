'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FinanceData } from '../types';
import { MOCK_FINANCE_DATA } from '../mock';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export interface FinanceFilters {
  startDate: string;
  endDate: string;
}

function getDefaultDates() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: now.toISOString().slice(0, 10),
  };
}

async function fetchFinance(filters: FinanceFilters): Promise<FinanceData> {
  const baseUrl =
    process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
  const token = localStorage.getItem('laravel_token');

  const params = new URLSearchParams();
  if (filters.startDate) params.set('start_date', filters.startDate);
  if (filters.endDate) params.set('end_date', filters.endDate);

  const res = await fetch(`${baseUrl}/admin/finance?${params}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Finance API error: ${res.status}`);
  }

  const json = await res.json();
  return json.data as FinanceData;
}

export function useFinanceAnalytics() {
  const [activeTab, setActiveTab] = useState('all');
  const defaults = getDefaultDates();
  const [filters, setFiltersState] = useState<FinanceFilters>({
    startDate: defaults.startDate,
    endDate: defaults.endDate,
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'finance-data-panel', filters],
    queryFn: async () => {
      if (USE_MOCKS) {
        return MOCK_FINANCE_DATA as FinanceData;
      }
      try {
        return await fetchFinance(filters);
      } catch (err) {
        console.warn('Finance API failed, falling back to mock:', err);
        return MOCK_FINANCE_DATA as FinanceData;
      }
    },
    staleTime: 10 * 60 * 1000,
  });

  const setFilters = (startDate: string, endDate: string) => {
    setFiltersState({ startDate, endDate });
  };

  const isVisible = (tabId: string) =>
    activeTab === 'all' || activeTab === tabId;

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
    isVisible,
  };
}
