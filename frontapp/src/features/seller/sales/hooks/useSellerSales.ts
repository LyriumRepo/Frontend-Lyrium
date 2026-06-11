'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, SalesKPI } from '../types';
import { orderRepository } from '@/shared/lib/api/factory';

function computeKPIs(orders: Order[]): SalesKPI[] {
    const total = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

    const pending = orders.filter(o => o.estado === 'pending_seller').length;
    const confirmed = orders.filter(o => o.estado === 'confirmed').length;
    const processing = orders.filter(o => o.estado === 'processing').length;
    const shipped = orders.filter(o => o.estado === 'shipped').length;
    const delivered = orders.filter(o => o.estado === 'delivered').length;
    const cancelled = orders.filter(o => o.estado === 'cancelled').length;

    const inProcess = confirmed + processing + shipped;

    const productCount = orders.filter(o => o.orderType === 'product').length;
    const serviceCount = orders.filter(o => o.orderType === 'service').length;
    const mixedCount = orders.filter(o => o.orderType === 'mixed').length;

    return [
        {
            label: 'Ventas Totales',
            count: totalRevenue,
            status: `${total} órdenes | ${productCount} prod, ${serviceCount} serv, ${mixedCount} mixtas`,
            icon: 'DollarSign',
            color: 'emerald',
        },
        {
            label: 'Total Órdenes',
            count: total,
            status: `${delivered} completadas · ${cancelled} canceladas`,
            icon: 'ShoppingBag',
            color: 'sky',
        },
        {
            label: 'Pendientes',
            count: pending,
            status: total > 0 ? `${Math.round((pending / total) * 100)}% requieren acción` : 'Sin datos',
            icon: 'Clock',
            color: 'amber',
        },
        {
            label: 'En Proceso',
            count: inProcess,
            status: `${processing} en preparación · ${shipped} en camino`,
            icon: 'Package',
            color: 'indigo',
        },
        {
            label: 'Completadas',
            count: delivered,
            status: `+ ${cancelled} canceladas de ${total}`,
            icon: 'CheckCircle',
            color: 'violet',
        },
    ];
}

export function useSellerSales() {
    const queryClient = useQueryClient();
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [filters, setFilters] = useState<{ dateStart: string | null; dateEnd: string | null; orderType: string | null }>({
        dateStart: null,
        dateEnd: null,
        orderType: null,
    });

    const { data, isFetching, isLoading, error, refetch } = useQuery({
        queryKey: ['seller', 'sales', filters],
        queryFn: async () => {
            const allOrders = await orderRepository.getOrders();
            const orders = allOrders.filter(order => {
                if (filters.dateStart && order.fecha < filters.dateStart) return false;
                if (filters.dateEnd && order.fecha > filters.dateEnd) return false;
                if (filters.orderType && order.orderType !== filters.orderType) return false;
                return true;
            });
            return { orders, kpis: computeKPIs(orders) };
        },
        placeholderData: (previousData) => previousData,
        staleTime: 5 * 60 * 1000,
    });

    const advanceStepMutation = useMutation({
        mutationFn: async (orderId: string) => {
            await orderRepository.advanceOrderStep(orderId);
            return orderId;
        },
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ['seller', 'sales'] });
        }
    });

    const shipWithCarrierMutation = useMutation({
        mutationFn: async ({ orderId, carrierCode, carrierData }: { orderId: string; carrierCode: string; carrierData: Record<string, string> }) => {
            await orderRepository.updateOrder(orderId, {
                status: 'shipped',
                carrier_code: carrierCode,
                carrier_data: carrierData,
            });
            return orderId;
        },
        onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: ['seller', 'sales'] });
        }
    });

    const cancelOrderMutation = useMutation({
        mutationFn: async (orderId: string) => {
            await orderRepository.updateOrder(orderId, { status: 'cancelled' });
            return orderId;
        },
        onSuccess: (orderId) => {
            queryClient.setQueryData(['seller', 'sales', filters], (old: { orders: Order[]; kpis: SalesKPI[] } | undefined) => {
                if (!old) return old;
                return {
                    ...old,
                    orders: old.orders.map((o: Order) =>
                        o.id === orderId ? { ...o, estado: 'cancelled', currentStep: 0 } : o
                    )
                };
            });
            refetch();
        }
    });

    const selectedOrder = data?.orders.find((o: Order) => o.id === selectedOrderId) || null;

    return {
        orders: data?.orders || [],
        kpis: data?.kpis || [],
        isLoading,
        isFetching,
        selectedOrder,
        setSelectedOrder: (order: Order | null) => setSelectedOrderId(order?.id || null),
        filters,
        updateFilters: (newFilters: { dateStart?: string | null; dateEnd?: string | null; orderType?: string | null }) =>
            setFilters({ ...filters, ...newFilters }),
        clearFilters: () => setFilters({ dateStart: null, dateEnd: null, orderType: null }),
        advanceStep: (id: string) => advanceStepMutation.mutateAsync(id),
        isAdvancing: advanceStepMutation.isPending,
        shipWithCarrier: (orderId: string, carrierCode: string, carrierData: Record<string, string>) =>
            shipWithCarrierMutation.mutateAsync({ orderId, carrierCode, carrierData }),
        isShipping: shipWithCarrierMutation.isPending,
        cancelOrder: (id: string) => cancelOrderMutation.mutateAsync(id),
        isCancelling: cancelOrderMutation.isPending,
        refresh: refetch
    };
}
