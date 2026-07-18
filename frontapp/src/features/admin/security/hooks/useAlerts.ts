'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { alertRepository, SecurityAlertItem, AlertPaginationMeta } from '@/shared/lib/api/alertRepository';

interface UseAlertsReturn {
  alerts: SecurityAlertItem[];
  pagination: AlertPaginationMeta | null;
  activeCount: number;
  loading: boolean;
  error: string | null;
  filters: AlertFilters;
  setFilter: (key: keyof AlertFilters, value: string | undefined) => void;
  goToPage: (page: number) => void;
  refetch: () => void;
  dismissAlert: (id: number, comment?: string) => Promise<void>;
  resolveAlert: (id: number, comment?: string) => Promise<void>;
  isMutating: boolean;
}

interface AlertFilters {
  status?: string;
  severity?: string;
  type?: string;
  sort?: string;
}

export function useAlerts(): UseAlertsReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AlertFilters>({});

  const setFilter = useCallback((key: keyof AlertFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const queryParams = useMemo(() => ({
    page,
    per_page: 15,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.severity ? { severity: filters.severity } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
  }), [page, filters]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['security', 'alerts', queryParams],
    queryFn: async () => {
      const res = await alertRepository.list(queryParams);
      return res.data;
    },
    staleTime: 15_000,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'alerts'] });
    },
  };

  const dismissMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      alertRepository.dismiss(id, comment),
    ...mutationOptions,
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      alertRepository.resolve(id, comment),
    ...mutationOptions,
  });

  const dismissAlert = useCallback(async (id: number, comment?: string) => {
    await dismissMutation.mutateAsync({ id, comment });
  }, [dismissMutation]);

  const resolveAlert = useCallback(async (id: number, comment?: string) => {
    await resolveMutation.mutateAsync({ id, comment });
  }, [resolveMutation]);

  return {
    alerts: data?.items ?? [],
    pagination: data?.pagination ?? null,
    activeCount: data?.active_count ?? 0,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    filters,
    setFilter,
    goToPage: setPage,
    refetch,
    dismissAlert,
    resolveAlert,
    isMutating: dismissMutation.isPending || resolveMutation.isPending,
  };
}
