'use client';

import { useQuery } from '@tanstack/react-query';
import { auditRepository } from '@/shared/lib/api/auditRepository';
import type { AuditLog } from '@/features/security/audit/types';

interface RealtimeState {
  events: AuditLog[];
  total: number;
}

export const useRealtimeEvents = () => {
  const { data, isLoading, error, refetch } = useQuery<RealtimeState>({
    queryKey: ['security', 'audit', 'realtime'],
    queryFn: async () => {
      const res = await auditRepository.realtime();

      return {
        events: res.events ?? [],
        total: res.total ?? 0,
      };
    },
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  return {
    realtimeEvents: data?.events ?? [],
    realtimeTotal: data?.total ?? 0,
    realtimeLoading: isLoading,
    realtimeError: error ? (error as Error).message : null,
    refreshRealtime: refetch,
  };
};
