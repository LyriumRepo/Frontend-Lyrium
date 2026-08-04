'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Order, SalesKPI } from '../types';
import { orderRepository } from '@/shared/lib/api/factory';
import { useToast } from '@/shared/lib/context/ToastContext';

const PRODUCT_STATUS_STEP_MAP: Record<string, number> = {
    pending_seller: 1,
    confirmed:      2,
    processing:     3,
    shipped:        4,
    delivered:      5,
    cancelled:      0,
};

function computeSellerOrder(order: Order): Order {
    const hasIsOwn = order.items.some((i) => i.isOwn === true || i.isOwn === false);
    if (!hasIsOwn) return order;

    const isMultiStore = order.items.some((i) => !i.isOwn);

    // Resumen por tienda — se calcula ANTES de filtrar a solo los items propios,
    // porque necesita ver el estado de las otras tiendas del pedido (el resto de
    // la UI del vendedor solo debe ver sus propios items, por eso se filtra después).
    const storesSummary = isMultiStore
        ? Object.values(
            order.items.reduce((acc, i) => {
                if (!acc[i.storeId]) {
                    acc[i.storeId] = { storeId: i.storeId, storeName: i.storeName || `Tienda #${i.storeId}`, isOwn: i.isOwn, confirmed: true };
                }
                if (i.status === 'pending_seller') acc[i.storeId].confirmed = false;
                return acc;
            }, {} as Record<number, { storeId: number; storeName: string; isOwn: boolean; confirmed: boolean }>),
        )
        : undefined;

    const ownItems = order.items.filter((i) => i.isOwn);
    const productCurrentStep = ownItems.length > 0
        ? Math.max(...ownItems.map((i) => PRODUCT_STATUS_STEP_MAP[i.status] ?? 0), 0) || 1
        : 0;
    const sellerSubtotal = ownItems.reduce((sum, i) => sum + i.lineTotal, 0);
    const sellerShipping = ownItems.reduce((sum, i) => sum + (i.shippingCost ?? 0), 0);
    const sellerTotal = sellerSubtotal + sellerShipping;

    const needsMyAction = ownItems.some((i) => i.status === 'pending_seller');
    const waitingOnOtherStore = isMultiStore && !needsMyAction && ownItems.length > 0;

    return { ...order, items: ownItems, productCurrentStep, sellerSubtotal, sellerShipping, sellerTotal, isMultiStore, storesSummary, needsMyAction, waitingOnOtherStore };
}

function computeKPIs(orders: Order[]): SalesKPI[] {
    const total = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.sellerSubtotal ?? o.total), 0);

    const pending = orders.filter(o => o.estado === 'pending_seller' && !o.waitingOnOtherStore).length;
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
    const { showToast } = useToast();
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
            const orders = allOrders
                .map(computeSellerOrder)
                .filter(order => {
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
        mutationFn: async ({ orderId, section, serviceItemId }: { orderId: string; section?: 'products' | 'services' | 'confirm'; serviceItemId?: string }) => {
            console.log('[useSellerSales::advanceStepMutation] START', { orderId, section, serviceItemId });
            const result = await orderRepository.advanceOrderStep(orderId, section, serviceItemId);
            console.log('[useSellerSales::advanceStepMutation] DONE', { orderId, section, serviceItemId });
            return result;
        },
        onSuccess: async (order) => {
            console.log('[useSellerSales::advanceStepMutation] onSuccess, updating cache', { orderId: order.id, serviceItems: order.serviceItems?.map(s => ({ id: s.id, status: s.status, bookingStatus: s.bookingStatus })) });
            queryClient.setQueryData(['seller', 'sales', filters], (old: { orders: Order[]; kpis: SalesKPI[] } | undefined) => {
                if (!old) return old;
                const updated = old.orders.map((o: Order) => o.id === order.id ? computeSellerOrder(order) : o);
                const kpis = computeKPIs(updated);
                return { ...old, orders: updated, kpis };
            });
            console.log('[useSellerSales::advanceStepMutation] cache updated, skipping refetch to avoid stale overwrite');
        },
        onError: (err) => {
            console.error('[useSellerSales::advanceStepMutation] onError', err);
            showToast(err instanceof Error ? err.message : 'Error al avanzar la orden', 'error');
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
        advanceStep: (id: string, section?: 'products' | 'services' | 'confirm', serviceItemId?: string) =>
            advanceStepMutation.mutateAsync({ orderId: id, section, serviceItemId }),
        isAdvancing: advanceStepMutation.isPending,
        shipWithCarrier: (orderId: string, carrierCode: string, carrierData: Record<string, string>) =>
            shipWithCarrierMutation.mutateAsync({ orderId, carrierCode, carrierData }),
        isShipping: shipWithCarrierMutation.isPending,
        cancelOrder: (id: string) => cancelOrderMutation.mutateAsync(id),
        isCancelling: cancelOrderMutation.isPending,
        refresh: refetch
    };
}
