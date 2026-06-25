'use client';

/**
 * useControlVendedores.ts
 * Hook principal del panel de control de vendedores.
 * Conectado al backend Laravel via adminSellerRepository.
 */

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminSellerRepository,
  SellerListItem,
  SellerStatsResponse,
} from '@/shared/lib/api/adminSellerRepository';
import { sellerApi } from '@/shared/lib/api/sellerRepository'; // para profile requests (ya funciona)
import type {
  SellerStatus,
  ProductStatus,
  ServiceStatus,
  Stats,
} from '@/features/admin/sellers/types';

// ─── Tipos internos del hook ───────────────────────────────────────────────────

export type TabKey = 'vendedores' | 'aprobacion' | 'servicios' | 'auditoria' | 'validacion' | 'contratos';

export interface SellerFilters {
  sellerSearch: string;
  status: '' | 'active' | 'pending' | 'banned' | 'alert' | 'approved';
}

// ─── Helpers de mapeo ──────────────────────────────────────────────────────────

/** Mapea el status del backend al SellerStatus del frontend */
function mapStoreStatus(item: SellerListItem): SellerStatus {
  if (item.is_banned) return 'SUSPENDED';
  const s = item.store?.status;
  if (s === 'active' || s === 'approved') return 'ACTIVE';
  if (s === 'pending') return 'PENDING';
  if (s === 'suspended') return 'SUSPENDED';
  if (s === 'banned') return 'SUSPENDED';
  return 'REJECTED';
}

/** Mapea alertas del backend al contractStatus del frontend */
function mapContractStatus(
  item: SellerListItem,
): 'VIGENTE' | 'PENDIENTE' | 'VENCIDO' {
  if (!item.store) return 'PENDIENTE';
  if (item.store.has_active_contract) return 'VIGENTE';
  return 'PENDIENTE';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useControlVendedores = () => {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<TabKey>('vendedores');
  const [filters, setFilters] = useState<SellerFilters>({
    sellerSearch: '',
    status: '',
  });

  // ── Stats (4 cards del dashboard) ─────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'sellers', 'stats'],
    queryFn: () => adminSellerRepository.getStats(),
    staleTime: 60 * 1000, // 1 min
  });

  // ── Lista de vendedores ────────────────────────────────────────────────────
  const {
    data: sellersData,
    isLoading: sellersLoading,
    error: sellersError,
  } = useQuery({
    queryKey: ['admin', 'sellers', 'list', filters],
    queryFn: () =>
      adminSellerRepository.getSellers({
        search: filters.sellerSearch || undefined,
        status: filters.status || undefined,
        per_page: 50,
      }),
    staleTime: 30 * 1000,
  });

  // ── Productos pendientes ───────────────────────────────────────────────────
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useQuery({
    queryKey: ['admin', 'products', currentTab],
    queryFn: () =>
      adminSellerRepository.getProducts({
        status: currentTab === 'aprobacion' ? 'pending_review' : undefined,
        per_page: 50,
      }),
    enabled: currentTab === 'aprobacion',
    staleTime: 30 * 1000,
  });

  // ── Servicios pendientes ───────────────────────────────────────────────────
  const {
    data: servicesData,
    isLoading: servicesLoading,
  } = useQuery({
    queryKey: ['admin', 'services', currentTab],
    queryFn: () =>
      adminSellerRepository.getServices({
        status: currentTab === 'servicios' ? 'pending_review' : undefined,
        per_page: 50,
      }),
    enabled: currentTab === 'servicios',
    staleTime: 30 * 1000,
  });

  // ── Profile Requests (pestaña validación) ─────────────────────────────────
  const {
    data: profileRequests = [],
    isLoading: profileRequestsLoading,
    refetch: refetchProfileRequests,
    error: profileRequestsError,
  } = useQuery({
    queryKey: ['admin', 'profile-requests'],
    queryFn: () => sellerApi.getAllProfileRequests(),
    enabled: currentTab === 'validacion',
    staleTime: 30_000,
  });

  // ── Audit Logs (pestaña auditoría) ────────────────────────────────────────
  const { data: auditLogsData, isLoading: auditLogsLoading } = useQuery({
    queryKey: ['admin', 'audit-logs'],
    queryFn: () => adminSellerRepository.getAuditLogs(),
    enabled: currentTab === 'auditoria',
    staleTime: 60_000,
  });

  // ── Derived: Stats para las 4 cards ───────────────────────────────────────
  const stats = useMemo((): Stats & { pendingProducts: number; pending: number } => {
    const s = statsData;
    return {
      totalSellers: s?.total ?? 0,
      activeSellers: s?.active ?? 0,
      pendingProducts: productsData?.meta?.total ?? 0,
      pending: s?.pending ?? 0,
      alerts: s?.alerts ?? 0,
    };
  }, [statsData, productsData]);

  // ── Derived: Vendedores mapeados al formato que espera SellerList ──────────
  const mappedSellers = useMemo(() => {
    return (sellersData?.data ?? []).map((item) => ({
      id: item.id,
      name: item.display_name,
      company: item.store?.trade_name ?? item.store?.store_name ?? 'Sin tienda',
      email: item.email,
      status: mapStoreStatus(item),
      productsTotal: item.store?.total_sales ?? 0,
      productsPending: 0,
      regDate: new Date(item.created_at).toLocaleDateString('es-PE'),
      contractStatus: mapContractStatus(item),
      avatar: item.avatar,
      phone: item.phone,
      is_banned: item.is_banned,
      email_verified: item.email_verified,
      has_alerts: item.has_alerts,
      alerts: item.alerts,
      store: item.store,
    }));
  }, [sellersData]);

  // ── Derived: Servicios mapeados ────────────────────────────────────────────
  const mappedServices = useMemo(() => {
    const statusMap: Record<string, string> = {
      pending_review: 'PENDING',
      approved: 'APPROVED',
      rejected: 'REJECTED',
      active: 'APPROVED',
      inactive: 'REJECTED',
    };
    return (servicesData?.data ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      seller: s.store?.name ?? 'Sin tienda',
      sellerId: s.store?.id ?? 0,
      category: s.category?.name ?? 'Sin categoría',
      price: parseFloat(s.price ?? '0'),
      status: statusMap[s.status] ?? s.status,
      date: s.created_at
        ? new Date(s.created_at).toLocaleDateString('es-PE')
        : '',
      imageUrl: undefined,
      rejection_reason: s.rejection_reason,
    }));
  }, [servicesData]);

  // ── Derived: Productos mapeados ────────────────────────────────────────────
  const mappedProducts = useMemo(() => {
    const statusMap: Record<string, string> = {
      pending_review: 'PENDING',
      approved: 'APPROVED',
      rejected: 'REJECTED',
      draft: 'DRAFT',
    };
    return (productsData?.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      seller: p.store?.name ?? 'Sin tienda',
      sellerId: p.store?.id ?? 0,
      category: p.categories?.[0]?.name ?? 'Sin categoría',
      price: parseFloat(p.price ?? '0'),
      status: statusMap[p.status] ?? p.status,
      date: p.created_at
        ? new Date(p.created_at).toLocaleDateString('es-PE')
        : '',
      imageUrl: p.images?.[0]?.src ?? undefined,
      rejection_reason: p.rejection_reason,
    }));
  }, [productsData]);

  // ── Derived: Audit logs mapeados al formato AuditEntry ────────────────────
  const auditEntries = useMemo((): import('@/features/admin/sellers/types').AuditEntry[] => {
    return (auditLogsData?.data ?? []).map((log: any) => ({
      id: log.id,
      usuario: log.actor?.email ?? `ID ${log.actor?.id ?? '?'}`,
      accion: log.event ?? 'unknown',
      entidad: log.auditable
        ? `${log.auditable.type} #${log.auditable.id}`
        : (log.module ?? 'Sistema'),
      fecha: log.created_at
        ? new Date(log.created_at).toLocaleString('es-PE')
        : '—',
      metadata: { motivo: log.description ?? '' },
    }));
  }, [auditLogsData]);

  // ── Pending profile requests count (badge de pestaña) ─────────────────────
  const pendingProfileRequestsCount = useMemo(
    () => profileRequests.filter((r) => r.status === 'pending').length,
    [profileRequests],
  );

  // ─── Mutations ────────────────────────────────────────────────────────────

  /** Ban/unban de usuario */
  const banMutation = useMutation({
    mutationFn: (id: number) => adminSellerRepository.toggleBan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
    },
  });

  /** Cambio de estado de tienda (active / pending / suspended) */
  const storeStatusMutation = useMutation({
    mutationFn: ({
      storeId,
      status,
    }: {
      storeId: number;
      status: 'active' | 'pending' | 'suspended';
    }) => adminSellerRepository.updateStoreStatus(storeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sellers'] });
    },
  });

  /** Actualizar status de producto */
  const productStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: number;
      status: 'approved' | 'rejected' | 'pending_review';
      reason?: string;
    }) => adminSellerRepository.updateProductStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'sellers', 'stats'],
      });
    },
  });

  /** Actualizar status de servicio */
  const serviceStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
      reason,
    }: {
      id: number;
      status: 'approved' | 'rejected' | 'pending_review';
      reason?: string;
    }) => adminSellerRepository.updateServiceStatus(id, status, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
    },
  });

  /** Aprobar profile request */
  const approveProfileMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      sellerApi.approveProfileRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'profile-requests'],
      });
    },
  });

  /** Rechazar profile request */
  const rejectProfileMutation = useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      sellerApi.rejectProfileRequest(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'profile-requests'],
      });
    },
  });

  // ─── Acción combinada: updateSellerStatus ─────────────────────────────────
  // El frontend usa un modal unificado que emite SellerStatus ('ACTIVE', 'SUSPENDED', etc.)
  // lo convertimos al formato del backend.
  const updateSellerStatus = async (
    id: number,
    status: SellerStatus,
    _reason: string,
  ) => {
    const seller = mappedSellers.find((s) => s.id === id);
    if (!seller) return;

    if (
      status === 'SUSPENDED' ||
      status === 'suspendida' ||
      status === 'baja_logica'
    ) {
      // banear el usuario
      await banMutation.mutateAsync(id);
    } else if (status === 'ACTIVE' || status === 'activa') {
      // desbanear + activar tienda
      if (seller.is_banned) await banMutation.mutateAsync(id);
      if (seller.store?.id) {
        await storeStatusMutation.mutateAsync({
          storeId: seller.store.id,
          status: 'active',
        });
      }
    } else if (status === 'PENDING') {
      if (seller.store?.id) {
        await storeStatusMutation.mutateAsync({
          storeId: seller.store.id,
          status: 'pending',
        });
      }
    }
  };

  // ─── Return ───────────────────────────────────────────────────────────────
  const isLoading = statsLoading || sellersLoading;
  const error = sellersError ? (sellersError as Error).message : null;

  return {
    // Estado global
    loading: isLoading,
    error,
    currentTab,
    setCurrentTab,
    filters,
    setFilters,

    // Datos
    sellers: mappedSellers,
    filteredSellers: mappedSellers, // ya filtrado desde el servidor
    products: mappedProducts,
    productsLoading,
    services: mappedServices,
    servicesLoading,

    // Stats para las cards
    stats,
    statsData,

    // Profile Requests
    profileRequests,
    profileRequestsLoading,
    profileRequestsError: profileRequestsError
      ? (profileRequestsError as Error).message
      : null,
    pendingProfileRequestsCount,

    // Audit Logs
    auditEntries,
    auditLogsLoading,

    // Paginación
    pagination: sellersData?.pagination,

    // Acciones
    actions: {
      updateSellerStatus,
      updateProductStatus: (
        id: number,
        status: ProductStatus,
        reason: string,
      ) => {
        const backendStatus =
          status === 'APPROVED'
            ? 'approved'
            : status === 'REJECTED'
              ? 'rejected'
              : 'pending_review';
        return productStatusMutation.mutateAsync({
          id,
          status: backendStatus,
          reason,
        });
      },
      updateServiceStatus: (
        id: number,
        status: ServiceStatus,
        reason: string,
      ) => {
        const backendStatus =
          status === 'APPROVED'
            ? 'approved'
            : status === 'REJECTED'
              ? 'rejected'
              : 'pending_review';
        return serviceStatusMutation.mutateAsync({
          id,
          status: backendStatus,
          reason,
        });
      },
      approveProfileRequest: (id: number, notes?: string) =>
        approveProfileMutation.mutateAsync({ id, notes }),
      rejectProfileRequest: (id: number, notes: string) =>
        rejectProfileMutation.mutateAsync({ id, notes }),
      refetchProfileRequests,
    },
  };
};
