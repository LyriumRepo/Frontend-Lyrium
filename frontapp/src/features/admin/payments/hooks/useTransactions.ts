'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/apiClient';
import type {
  Transaction,
  TransactionListResponse,
  TransactionStatsResponse,
  TransactionFilters,
} from '../types/transactions';

const BASE = '/admin/transactions';

async function fetchTransactions(filters: TransactionFilters): Promise<TransactionListResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '' && value !== null) {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return apiClient<TransactionListResponse>(`${BASE}${qs ? `?${qs}` : ''}`);
}

async function fetchTransactionDetail(id: string): Promise<{ data: Transaction }> {
  return apiClient<{ data: Transaction }>(`${BASE}/${id}`);
}

async function fetchTransactionStats(): Promise<TransactionStatsResponse> {
  return apiClient<TransactionStatsResponse>(`${BASE}/stats`);
}

export function useTransactions(filters: TransactionFilters = {}) {
  const listQuery = useQuery({
    queryKey: ['admin', 'transactions', 'list', filters],
    queryFn: () => fetchTransactions(filters),
    staleTime: 30_000,
  });

  const statsQuery = useQuery({
    queryKey: ['admin', 'transactions', 'stats'],
    queryFn: fetchTransactionStats,
    staleTime: 60_000,
  });

  return {
    data: listQuery.data?.data ?? [],
    pagination: listQuery.data?.pagination ?? null,
    loading: listQuery.isLoading,
    error: listQuery.error ? (listQuery.error as Error).message : null,
    refetch: listQuery.refetch,
    stats: {
      data: statsQuery.data ?? null,
      loading: statsQuery.isLoading,
      error: statsQuery.error ? (statsQuery.error as Error).message : null,
    },
  };
}

export function useTransactionDetail(id: string | null) {
  return useQuery({
    queryKey: ['admin', 'transactions', 'detail', id],
    queryFn: () => fetchTransactionDetail(id!),
    enabled: !!id,
    staleTime: 30_000,
  });
}
