'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { protectionRuleRepository, ProtectionRuleItem, ProtectionRuleType, ProtectionRuleSeverity, ProtectionRuleStatus } from '@/shared/lib/api/protectionRuleRepository';

export function useProtectionRules() {
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['security', 'protection-rules'],
    queryFn: async () => {
      const res = await protectionRuleRepository.list();
      return res.data;
    },
    staleTime: 15_000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['security', 'protection-rules'] });

  const createMut = useMutation({
    mutationFn: (payload: { name: string; type: ProtectionRuleType; severity: ProtectionRuleSeverity; status: ProtectionRuleStatus; pattern?: string | null; priority?: number; description?: string | null; config?: Record<string, unknown> | null }) =>
      protectionRuleRepository.create(payload),
    onSuccess: invalidate,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<{ name: string; type: ProtectionRuleType; severity: ProtectionRuleSeverity; status: ProtectionRuleStatus; pattern?: string | null; priority?: number; description?: string | null; config?: Record<string, unknown> | null }> }) =>
      protectionRuleRepository.update(id, payload),
    onSuccess: invalidate,
  });

  const toggleMut = useMutation({
    mutationFn: (id: number) => protectionRuleRepository.toggleStatus(id),
    onSuccess: invalidate,
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => protectionRuleRepository.delete(id),
    onSuccess: invalidate,
  });

  const createRule = useCallback(async (payload: Parameters<typeof createMut.mutateAsync>[0]) => createMut.mutateAsync(payload), [createMut]);
  const updateRule = useCallback(async (id: number, payload: Partial<{ name: string; type: ProtectionRuleType; severity: ProtectionRuleSeverity; status: ProtectionRuleStatus; pattern?: string | null; priority?: number; description?: string | null; config?: Record<string, unknown> | null }>) => updateMut.mutateAsync({ id, payload }), [updateMut]);
  const toggleRule = useCallback(async (id: number) => toggleMut.mutateAsync(id), [toggleMut]);
  const deleteRule = useCallback(async (id: number) => deleteMut.mutateAsync(id), [deleteMut]);

  return {
    rules: data?.items ?? [] as ProtectionRuleItem[],
    activeCount: data?.active_count ?? 0,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    createRule,
    updateRule,
    toggleRule,
    deleteRule,
    isMutating: createMut.isPending || updateMut.isPending || toggleMut.isPending || deleteMut.isPending,
  };
}
