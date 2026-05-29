'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Voucher, InvoiceKPIs, VoucherStatus, VoucherType } from '../types';
import { useFilteredList, FilterConfig } from '@/shared/hooks/useFilteredList';
import { invoiceApi } from '@/shared/lib/api/invoiceRepository';

export interface EmitInvoicePayload {
    type: VoucherType;
    customer_name: string;
    customer_ruc: string;
    series: string;
    number: string;
    amount: number;
    order_id: string;
}

export interface VoucherFilters {
    search: string;
    status: VoucherStatus | 'ALL';
    type: VoucherType | 'ALL';
}

const filterConfig: FilterConfig<Voucher, VoucherFilters> = {
    search: {
        enabled: true,
        fields: [
            (v: Voucher) => v.series,
            (v: Voucher) => v.number,
            (v: Voucher) => v.customer_name,
            (v: Voucher) => v.customer_ruc
        ]
    },
    fields: {
        status: {
            type: 'select',
            options: [
                { value: 'ALL', label: 'Todos' },
                { value: 'DRAFT', label: 'Borrador' },
                { value: 'SENT_WAIT_CDR', label: 'Esperando CDR' },
                { value: 'ACCEPTED', label: 'Aceptado' },
                { value: 'OBSERVED', label: 'Observado' },
                { value: 'REJECTED', label: 'Rechazado' }
            ]
        },
        type: {
            type: 'select',
            options: [
                { value: 'ALL', label: 'Todos' },
                { value: 'FACTURA', label: 'Factura' },
                { value: 'BOLETA', label: 'Boleta' },
                { value: 'NOTA_CREDITO', label: 'Nota Crédito' }
            ]
        }
    }
};

export function useSellerInvoices() {
    const queryClient = useQueryClient();
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { data: vouchers = [], isLoading } = useQuery({
        queryKey: ['seller', 'invoices', 'list'],
        queryFn: async () => {
            const result = await invoiceApi.list();
            return result as Voucher[];
        },
        staleTime: 2 * 60 * 1000,
    });

    const { data: kpisData } = useQuery({
        queryKey: ['seller', 'invoices', 'kpis'],
        queryFn: async () => {
            const result = await invoiceApi.kpis();
            return result as InvoiceKPIs;
        },
        staleTime: 2 * 60 * 1000,
    });

    const {
        filteredData: filteredVouchers,
        filters,
        setFilter,
        setSearch,
        clearFilters,
        hasActiveFilters
    } = useFilteredList<Voucher, VoucherFilters>({
        data: vouchers,
        config: filterConfig,
        initialFilters: { search: '', status: 'ALL', type: 'ALL' }
    });

    const kpis = kpisData ?? null;

    const typedFilters: VoucherFilters = {
        search: filters.search ?? '',
        status: (filters.status as VoucherStatus | 'ALL') ?? 'ALL',
        type: (filters.type as VoucherType | 'ALL') ?? 'ALL'
    };

    const setFilters = (newFilters: Partial<VoucherFilters>) => {
        if (newFilters.search !== undefined) {
            setSearch(newFilters.search);
        }
        if (newFilters.status !== undefined) {
            setFilter('status', newFilters.status);
        }
        if (newFilters.type !== undefined) {
            setFilter('type', newFilters.type);
        }
    };

    const emitMutation = useMutation({
        mutationFn: async (payload: EmitInvoicePayload) => {
            return invoiceApi.emit(payload);
        },
        onSuccess: (newVoucher) => {
            queryClient.setQueryData(['seller', 'invoices', 'list'], (old: any) => [newVoucher, ...(old || [])]);
            queryClient.invalidateQueries({ queryKey: ['seller', 'invoices', 'kpis'] });
        }
    });

    const retryMutation = useMutation({
        mutationFn: async (id: string) => {
            return invoiceApi.retry(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller', 'invoices', 'list'] });
            queryClient.invalidateQueries({ queryKey: ['seller', 'invoices', 'kpis'] });
            setIsDrawerOpen(false);
        }
    });

    return {
        vouchers: filteredVouchers,
        kpis,
        isLoading,
        selectedVoucher,
        isDrawerOpen,
        filters: typedFilters,
        setFilters,
        clearFilters,
        hasActiveFilters,
        handleViewDetail: (voucher: Voucher) => {
            setSelectedVoucher(voucher);
            setIsDrawerOpen(true);
        },
        handleCloseDrawer: () => {
            setIsDrawerOpen(false);
            setTimeout(() => setSelectedVoucher(null), 300);
        },
        handleRetryInvoice: (id: string) => retryMutation.mutate(id),
        emitNewInvoice: async (payload: EmitInvoicePayload) => {
            try {
                await emitMutation.mutateAsync(payload);
                return { success: true };
            } catch (err: unknown) {
                return { success: false, error: err instanceof Error ? err.message : 'Error al emitir factura' };
            }
        },
        isEmitting: emitMutation.isPending,
        isRetrying: retryMutation.isPending,
    };
}
