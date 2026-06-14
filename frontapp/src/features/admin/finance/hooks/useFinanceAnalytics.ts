'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { useToast } from '@/shared/lib/context/ToastContext';
import type { FinanceData } from '../types';

export interface FinanceFilters {
    startDate: string;
    endDate: string;
}

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
    const now = Date.now();
    if (_tokenCache && now - _tokenCache.ts < 30_000) {
        return _tokenCache.value;
    }
    try {
        const res = await fetch('/api/auth-token', {
            credentials: 'include',
            cache: 'no-store',
        });
        if (!res.ok) return null;
        const { token } = await res.json();
        const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
        _tokenCache = { value: clean, ts: now };
        return clean;
    } catch {
        return null;
    }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function fetchFinanceData(startDate: string, endDate: string): Promise<FinanceData> {
    const headers = await getAuthHeaders();
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);

    const url = `${LARAVEL_API_URL}/admin/finance${params.toString() ? '?' + params.toString() : ''}`;
    const res = await fetch(url, { headers, credentials: 'include' });

    if (!res.ok) {
        throw new Error('Error al cargar datos financieros');
    }

    const json = await res.json();
    return json.data as FinanceData;
}

export function useFinanceAnalytics() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFiltersState] = useState<FinanceFilters>({
        startDate: '',
        endDate: ''
    });

    const setFilters = (startDate: string, endDate: string) => {
        setFiltersState({ startDate, endDate });
    };

    const queryKey = useMemo(
        () => ['finance', filters.startDate, filters.endDate],
        [filters.startDate, filters.endDate]
    );

    const { data, isLoading, isRefetching, refetch } = useQuery<FinanceData>({
        queryKey,
        queryFn: () => fetchFinanceData(filters.startDate, filters.endDate),
        staleTime: 60_000,
    });

    const isVisible = (tabId: string) => activeTab === 'all' || activeTab === tabId;

    const applyFilters = async () => {
        if (!filters.startDate || !filters.endDate) {
            showToast('Selecciona un rango de fechas completo', 'info');
            return false;
        }
        await refetch();
        showToast('Datos sincronizados según el periodo seleccionado', 'success');
        return true;
    };

    return {
        data: data ?? null,
        isLoading,
        isRefreshing: isRefetching,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        applyFilters,
        isVisible,
    };
}
