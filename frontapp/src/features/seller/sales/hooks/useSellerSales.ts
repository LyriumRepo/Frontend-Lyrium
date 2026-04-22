'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, SalesKPI } from '../types';
import { MOCK_ORDERS, MOCK_KPIS } from '../mock';
import { orderRepository } from '@/shared/lib/api/factory';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export function useSellerSales() {
    const queryClient = useQueryClient();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ dateStart: string | null; dateEnd: string | null }>({
        dateStart: null,
        dateEnd: null
    });

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['seller', 'sales', filters],
        queryFn: async () => {
            if (USE_MOCKS) {
                let filteredOrders = MOCK_ORDERS;
                if (filters.dateStart || filters.dateEnd) {
                    filteredOrders = MOCK_ORDERS.filter(o => {
                        const oDate = new Date(o.fecha + 'T00:00:00');
                        const start = filters.dateStart ? new Date(filters.dateStart + 'T00:00:00') : null;
                        const end = filters.dateEnd ? new Date(filters.dateEnd + 'T00:00:00') : null;
                        if (start && oDate < start) return false;
                        if (end && oDate > end) return false;
                        return true;
                    });
                }
                return { orders: filteredOrders as Order[], kpis: MOCK_KPIS as SalesKPI[] };
            }

             try {
                 const result = await orderRepository.getOrders() as Order[] | { data: Order[] };
                 const orders = Array.isArray(result) ? result : (result?.data ?? []);
                 return { orders: orders as Order[], kpis: [] as SalesKPI[] };
             } catch (error) {
                 console.warn('FALLBACK: orderRepository.getOrders() error', error);
                 return { orders: MOCK_ORDERS as Order[], kpis: MOCK_KPIS as SalesKPI[] };
             }
        },
        staleTime: 5 * 60 * 1000,
    });

    const advanceStepMutation = useMutation({
        mutationFn: async (orderId: string) => {
            if (!USE_MOCKS) {
                await orderRepository.advanceOrderStep(orderId);
            }
            return orderId;
        },
        onSuccess: (orderId) => {
            queryClient.setQueryData(['seller', 'sales', filters], (old: { orders: Order[]; kpis: SalesKPI[] } | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    orders: old.orders.map((o: Order) =>
                        o.id === orderId ? { ...o, currentStep: Math.min(o.currentStep + 1, 5) } : o
                    )
                };
            });
        }
    });

    const selectedOrder = data?.orders.find((o: Order) => o.id === selectedOrderId) || null;

    return {
        orders: data?.orders || [],
        kpis: data?.kpis || [],
        isLoading,
        selectedOrder,
        setSelectedOrder: (order: Order | null) => setSelectedOrderId(order?.id || null),
        filters,
        updateFilters: (newFilters: { dateStart?: string | null; dateEnd?: string | null }) =>
            setFilters({ ...filters, ...newFilters }),
        clearFilters: () => setFilters({ dateStart: null, dateEnd: null }),
        advanceStep: (id: string) => advanceStepMutation.mutateAsync(id),
        isAdvancing: advanceStepMutation.isPending,
        refresh: refetch
    };
}
