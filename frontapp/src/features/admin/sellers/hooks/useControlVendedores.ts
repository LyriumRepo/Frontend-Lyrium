'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ControlVendedoresData, SellerStatus, ProductStatus, Stats, AuditEntry, Seller, Product as AdminProduct
} from '@/features/admin/sellers/types';
import { MOCK_CONTROL_DATA } from '@/features/admin/sellers/mock';
import { getStores, getProducts, updateStoreStatus } from '@/shared/lib/api';
import { sellerApi } from '@/shared/lib/api/sellerRepository';
import { Product as WCProduct } from '@/lib/types/wp/wp-types';
import { Store as DokanStore } from '@/lib/types/stores/store';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export const useControlVendedores = () => {
    const queryClient = useQueryClient();
    const [currentTab, setCurrentTab] = useState<'vendedores' | 'aprobacion' | 'auditoria' | 'validacion'>('vendedores');
    const [filters, setFilters] = useState({
        sellerSearch: '',
        auditStore: '',
        auditType: 'ALL'
    });

    // --- Query: Fetch and Map Data ---
    const { data: rawData, isLoading, error } = useQuery({
        queryKey: ['admin', 'control-vendedores'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return MOCK_CONTROL_DATA as ControlVendedoresData;
            }

            // Usar API de Laravel en lugar de WooCommerce/Dokan
            const laravelStores = await sellerApi.getAllStores();

            // 1. Mapeo de Tiendas (Laravel -> Admin Seller)
            const mappedSellers: Seller[] = laravelStores.map((s) => {
                let mappedStatus = 'REJECTED';
                if (s.status === 'approved' || s.status === 'active' || s.status === 'ACTIVE') mappedStatus = 'ACTIVE';
                else if (s.status === 'pending') mappedStatus = 'PENDING';
                else if (s.status === 'banned') mappedStatus = 'SUSPENDED';

                return {
                    id: s.id,
                    name: s.store_name || 'Sin Nombre',
                    company: s.nombre_comercial || s.store_name || 'Sin Nombre de Tienda',
                    email: s.email || 'n/a',
                    status: mappedStatus as SellerStatus,
                    productsTotal: 0, // TODO: Obtener de endpoint de productos
                    productsPending: 0,
                    regDate: s.verified_at ? new Date(s.verified_at).toLocaleDateString() : new Date().toLocaleDateString(),
                    contractStatus: 'VIGENTE'
                };
            });

            // 2. Productos - Fetch from new admin endpoint
            const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
            const token = typeof document !== 'undefined' ? document.cookie.match(/(?:^|;\s*)laravel_token=([^;]+)/)?.[1] : null;
            
            const productsResponse = await fetch(`${LARAVEL_API_URL}/admin/products`, {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${decodeURIComponent(token)}` } : {}),
                },
            });
            
            const productsData = await productsResponse.json();
            const allProducts = productsData.data?.data || productsData.data || [];
            
            const statusMap: Record<string, string> = {
                'pending_review': 'PENDING',
                'approved': 'APPROVED',
                'rejected': 'REJECTED',
            };
            
            const mappedProducts: AdminProduct[] = allProducts.map((p: any) => ({
                id: p.id,
                name: p.name,
                seller: p.store?.name || 'Sin tienda',
                sellerId: p.store?.id || 0,
                category: p.categories?.[0]?.name || 'Sin categoría',
                price: parseFloat(p.price || '0'),
                status: statusMap[p.status] || p.status || 'PENDING',
                date: p.created_at ? new Date(p.created_at).toLocaleDateString() : new Date().toLocaleDateString(),
                imageUrl: p.images?.[0]?.src || undefined,
            }));

            return {
                sellers: mappedSellers,
                products: mappedProducts,
                notifications: MOCK_CONTROL_DATA.notifications,
                auditoria: MOCK_CONTROL_DATA.auditoria
            } as ControlVendedoresData;
        },
        staleTime: 5 * 60 * 1000, // 5 minutos de validez
    });

    // --- Mutation: Update Seller Status ---
    const sellerStatusMutation = useMutation({
        mutationFn: async ({ id, status, reason }: { id: number, status: SellerStatus, reason: string }) => {
            const statusMap: Record<string, string> = {
                'ACTIVE': 'approved',
                'activa': 'approved',
                'SUSPENDED': 'banned',
                'REJECTED': 'rejected',
                'PENDING': 'pending'
            };
            return sellerApi.updateStoreStatus(id, statusMap[status] || 'pending', reason);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'control-vendedores'] });
        }
    });

    // --- Mutation: Update Product Status ---
    const productStatusMutation = useMutation({
        mutationFn: async ({ id, status, reason }: { id: number, status: ProductStatus, reason: string }) => {
            const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';
            const token = typeof document !== 'undefined' ? document.cookie.match(/(?:^|;\s*)laravel_token=([^;]+)/)?.[1] : null;
            
            const response = await fetch(`${LARAVEL_API_URL}/products/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${decodeURIComponent(token)}` } : {}),
                },
                body: JSON.stringify({ status, reason }),
            });
            
            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Error al actualizar estado del producto' }));
                throw new Error(error.message || 'Error al actualizar estado del producto');
            }
            
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'control-vendedores'] });
        }
    });

    // --- Derived State: Stats ---
    const stats = useMemo((): Stats => {
        if (!rawData) return { totalSellers: 0, activeSellers: 0, pendingProducts: 0, alerts: 0 };
        return {
            totalSellers: rawData.sellers.length,
            activeSellers: rawData.sellers.filter(s => s.status === 'activa' || s.status === 'ACTIVE').length,
            pendingProducts: rawData.products.filter(p => p.status === 'en_espera' || p.status === 'PENDING').length,
            alerts: rawData.notifications.filter(n => n.estado_revision === 'nueva').length
        };
    }, [rawData]);

    // --- Derived State: Filtered Sellers ---
    const filteredSellers = useMemo(() => {
        if (!rawData) return [];
        return rawData.sellers.filter(s =>
            s.name.toLowerCase().includes(filters.sellerSearch.toLowerCase()) ||
            s.company.toLowerCase().includes(filters.sellerSearch.toLowerCase())
        );
    }, [rawData, filters.sellerSearch]);

    // --- Query: Profile Requests ---
    const { data: profileRequests = [], isLoading: profileRequestsLoading, refetch: refetchProfileRequests, error: profileRequestsError } = useQuery({
        queryKey: ['admin', 'profile-requests'],
        queryFn: async () => {
            const result = await sellerApi.getAllProfileRequests();
            return result;
        },
        enabled: currentTab === 'validacion',
        staleTime: 30000,
    });

    const pendingProfileRequestsCount = profileRequests.filter(r => r.status === 'pending').length;

    // --- Mutations: Approve/Reject Profile Requests ---
    const approveProfileMutation = useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            sellerApi.approveProfileRequest(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'profile-requests'] });
        }
    });

    const rejectProfileMutation = useMutation({
        mutationFn: ({ id, notes }: { id: number; notes: string }) =>
            sellerApi.rejectProfileRequest(id, notes),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'profile-requests'] });
        }
    });

    return {
        data: rawData,
        loading: isLoading,
        error: error ? (error as Error).message : null,
        currentTab,
        setCurrentTab,
        stats,
        filteredSellers,
        filters,
        setFilters,
        profileRequests,
        profileRequestsLoading,
        profileRequestsError: profileRequestsError ? (profileRequestsError as Error).message : null,
        pendingProfileRequestsCount,
        actions: {
            updateSellerStatus: (id: number, status: SellerStatus, reason: string) =>
                sellerStatusMutation.mutateAsync({ id, status, reason }),
            updateProductStatus: (id: number, status: ProductStatus, reason: string) =>
                productStatusMutation.mutateAsync({ id, status, reason }),
            approveProfileRequest: (id: number, notes?: string) =>
                approveProfileMutation.mutateAsync({ id, notes }),
            rejectProfileRequest: (id: number, notes: string) =>
                rejectProfileMutation.mutateAsync({ id, notes }),
            refetchProfileRequests,
            markAllAsRead: () => {
                console.log("Marking all as read (Mock)");
            }
        }
    };
};
