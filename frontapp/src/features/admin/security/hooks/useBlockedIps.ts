'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import { ipRepository, BlockedIpItem, IpPaginationMeta, BlockedIpStatus } from '@/shared/lib/api/ipRepository';

interface UseBlockedIpsReturn {
  ips: BlockedIpItem[];
  pagination: IpPaginationMeta | null;
  loading: boolean;
  error: string | null;
  filters: IpFilters;
  setFilter: (key: keyof IpFilters, value: string | undefined) => void;
  search: string;
  setSearch: (value: string) => void;
  goToPage: (page: number) => void;
  refetch: () => void;
  createIp: (payload: { ip_address: string; reason: string; status: BlockedIpStatus; expires_at?: string | null }) => Promise<void>;
  updateIp: (id: number, payload: { reason?: string; status?: BlockedIpStatus; expires_at?: string | null }) => Promise<void>;
  deleteIp: (id: number) => Promise<void>;
  blockIp: (id: number, reason: string, expires_at?: string | null) => Promise<void>;
  unblockIp: (id: number) => Promise<void>;
  whitelistIp: (id: number, reason: string) => Promise<void>;
  isMutating: boolean;
}

interface IpFilters {
  status?: string;
  sort?: string;
}

export function useBlockedIps(): UseBlockedIpsReturn {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<IpFilters>({});

  const setFilter = useCallback((key: keyof IpFilters, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const queryParams = useMemo(() => ({
    page,
    per_page: 15,
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.sort ? { sort: filters.sort } : {}),
    ...(search ? { search } : {}),
  }), [page, filters, search]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['security', 'blocked-ips', queryParams],
    queryFn: async () => {
      const res = await ipRepository.list(queryParams);
      return res.data;
    },
    staleTime: 15_000,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['security', 'stats'] });
    },
  };

  const createMutation = useMutation({
    mutationFn: (payload: { ip_address: string; reason: string; status: BlockedIpStatus; expires_at?: string | null }) =>
      ipRepository.create(payload),
    ...mutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { reason?: string; status?: BlockedIpStatus; expires_at?: string | null } }) =>
      ipRepository.update(id, payload),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ipRepository.delete(id),
    ...mutationOptions,
  });

  const blockMutation = useMutation({
    mutationFn: ({ id, reason, expires_at }: { id: number; reason: string; expires_at?: string | null }) =>
      ipRepository.update(id, { status: 'blocked', reason, expires_at }),
    ...mutationOptions,
  });

  const unblockMutation = useMutation({
    mutationFn: (id: number) => ipRepository.update(id, { status: 'unblocked' }),
    ...mutationOptions,
  });

  const whitelistMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      ipRepository.update(id, { status: 'whitelisted', reason }),
    ...mutationOptions,
  });

  const createIp = useCallback(async (payload: { ip_address: string; reason: string; status: BlockedIpStatus; expires_at?: string | null }) => {
    await createMutation.mutateAsync(payload);
  }, [createMutation]);

  const updateIp = useCallback(async (id: number, payload: { reason?: string; status?: BlockedIpStatus; expires_at?: string | null }) => {
    await updateMutation.mutateAsync({ id, payload });
  }, [updateMutation]);

  const deleteIp = useCallback(async (id: number) => {
    await deleteMutation.mutateAsync(id);
  }, [deleteMutation]);

  const blockIp = useCallback(async (id: number, reason: string, expires_at?: string | null) => {
    await blockMutation.mutateAsync({ id, reason, expires_at });
  }, [blockMutation]);

  const unblockIp = useCallback(async (id: number) => {
    await unblockMutation.mutateAsync(id);
  }, [unblockMutation]);

  const whitelistIp = useCallback(async (id: number, reason: string) => {
    await whitelistMutation.mutateAsync({ id, reason });
  }, [whitelistMutation]);

  const isMutating = createMutation.isPending
    || updateMutation.isPending
    || deleteMutation.isPending
    || blockMutation.isPending
    || unblockMutation.isPending
    || whitelistMutation.isPending;

  return {
    ips: data?.items ?? [],
    pagination: data?.pagination ?? null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    filters,
    setFilter,
    search,
    setSearch: (value: string) => { setSearch(value); setPage(1); },
    goToPage: setPage,
    refetch,
    createIp,
    updateIp,
    deleteIp,
    blockIp,
    unblockIp,
    whitelistIp,
    isMutating,
  };
}
