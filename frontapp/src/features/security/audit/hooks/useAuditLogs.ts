'use client';

/**
 * useAuditLogs.ts
 * Hook principal del módulo de auditoría de seguridad.
 * Conectado al backend Laravel via auditRepository.
 */

import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auditRepository } from '@/shared/lib/api/auditRepository';
import type { AuditLog, AuditLogFilters } from '@/features/security/audit/types';

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuditLogs = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    per_page: 25,
    sort: 'created_at',
    order: 'desc',
  });

  // ── Stats ────────────────────────────────────────────────────────────────
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['security', 'audit', 'stats'],
    queryFn: () => auditRepository.stats(),
    staleTime: 60 * 1000,
  });

  // ── Lista de logs ─────────────────────────────────────────────────────────
  const {
    data: listData,
    isLoading: listLoading,
    error: listError,
  } = useQuery({
    queryKey: ['security', 'audit', 'list', filters],
    queryFn: () => auditRepository.list(filters),
    staleTime: 30 * 1000,
  });

  // ── Módulos disponibles ───────────────────────────────────────────────────
  const { data: modules = [] } = useQuery({
    queryKey: ['security', 'audit', 'modules'],
    queryFn: () => auditRepository.modules(),
    staleTime: 5 * 60 * 1000,
  });

  // ── Derived: logs mapeados (si se requiere transformación futura) ─────────
  const logs = useMemo(() => {
    return listData?.data ?? [];
  }, [listData]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  /** Actualiza un filtro específico y resetea a página 1 */
  const updateFilter = (
    key: keyof AuditLogFilters,
    value: string | number | boolean | undefined,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value as never, page: 1 }));
  };

  /** Resetea todos los filtros al estado inicial */
  const resetFilters = () => {
    setFilters({
      page: 1,
      per_page: 25,
      sort: 'created_at',
      order: 'desc',
    });
  };

  /** Navega a una página específica */
  const goToPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  /** Refresca la lista de logs */
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['security', 'audit', 'list'] });
  };

  /** Exporta los logs a CSV */
  const handleExport = () => {
    const url = auditRepository.getExportUrl(filters);
    window.open(url, '_blank');
  };

  // ─── Return ───────────────────────────────────────────────────────────────
  const isLoading = listLoading || statsLoading;
  const error = listError ? (listError as Error).message : null;

  return {
    // Estado
    loading: isLoading,
    error,
    filters,

    // Datos
    logs,
    stats: stats ?? null,
    modules,

    // Paginación
    pagination: listData?.pagination ?? null,

    // Acciones
    actions: {
      updateFilter,
      resetFilters,
      goToPage,
      refetch,
      handleExport,
    },
  };
};
