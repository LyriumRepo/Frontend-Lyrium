'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { securitySettingsRepository, SecuritySettings } from '@/shared/lib/api/securitySettingsRepository';

export function useSecuritySettings() {
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['security', 'settings'],
    queryFn: async () => {
      const res = await securitySettingsRepository.get();
      return res.data;
    },
    staleTime: 30_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['security', 'settings'] });

  const updateMut = useMutation({
    mutationFn: (payload: Partial<SecuritySettings>) => securitySettingsRepository.update(payload),
    onSuccess: invalidate,
  });

  const resetMut = useMutation({
    mutationFn: () => securitySettingsRepository.reset(),
    onSuccess: invalidate,
  });

  const updateSettings = useCallback(async (payload: Partial<SecuritySettings>) => updateMut.mutateAsync(payload), [updateMut]);
  const resetSettings = useCallback(async () => resetMut.mutateAsync(), [resetMut]);

  return {
    settings: data ?? null,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    updateSettings,
    resetSettings,
    isMutating: updateMut.isPending || resetMut.isPending,
  };
}
