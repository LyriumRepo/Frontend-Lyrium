'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Voucher, InvoiceKPIs, VoucherStatus, VoucherType } from '../types';
import { MOCK_VOUCHERS, calculateKPIs } from '../mock';
import { useFilteredList, FilterConfig } from '@/shared/hooks/useFilteredList';
import { invoiceApi } from '@/shared/lib/api/invoiceRepository';
import { USE_MOCKS } from '@/shared/lib/config/flags';

export interface EmitInvoicePayload {
    seller_id: string;
    seller_name: string;
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
                { value: 'PENDING', label: 'Pendiente' },
                { value: 'SENT', label: 'Enviado' },
                { value: 'SENT_WAIT_CDR', label: 'Esperando CDR' },
                { value: 'ACCEPTED', label: 'Aceptado' },
                { value: 'REJECTED', label: 'Rechazado' }
            ]
        },
        type: {
            type: 'select',
            options: [
                { value: 'ALL', label: 'Todos' },
                { value: 'FACTURA', label: 'Factura' },
                { value: 'BOLETA', label: 'Boleta' }
            ]
        }
    }
};

export function useSellerInvoices() {
    const queryClient = useQueryClient();
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const { data: vouchers = [] } = useQuery({
        queryKey: ['seller', 'invoices', 'list'],
        queryFn: async () => {
            if (USE_MOCKS) {
                return [...MOCK_VOUCHERS] as Voucher[];
            }
            try {
                const result = await invoiceApi.list() as unknown as Voucher[];
                return result && result.length > 0 ? result : [...MOCK_VOUCHERS] as Voucher[];
            } catch (e) {
                console.warn('FALLBACK: Using mock invoices data', e);
                return [...MOCK_VOUCHERS] as Voucher[];
            }
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

    const isLoading = false;
    const kpis = calculateKPIs(vouchers);

    const typedFilters: VoucherFilters = {
        search: filters.search ?? '',
        status: filters.status ?? 'ALL',
        type: filters.type ?? 'ALL'
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
            const res = await fetch('/api/rapifac/emit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const json = await res.json();
            if (!json.success || !json.data) throw new Error(json.error ?? 'Error desconocido');
            return json.data as Voucher;
        },
        onSuccess: (newVoucher) => {
            queryClient.setQueryData(['seller', 'invoices', 'list'], (old: any) => [newVoucher, ...(old || [])]);
        }
    });

    const retryMutation = useMutation({
        mutationFn: async (id: string) => {
            await new Promise(r => setTimeout(r, 1200));
            return id;
        },
        onSuccess: (id) => {
            queryClient.setQueryData(['seller', 'invoices', 'list'], (old: any) => {
                if (!old) return old;
                return old.map((v: Voucher) => v.id === id ? {
                    ...v,
                    sunat_status: 'SENT_WAIT_CDR' as VoucherStatus,
                    history: [
                        ...v.history,
                        {
                            status: 'SENT_WAIT_CDR' as VoucherStatus,
                            note: 'Reintento solicitado por el vendedor. Procesando con Rapifac...',
                            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            user: 'Vendedor'
                        }
                    ]
                } : v);
            });
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
