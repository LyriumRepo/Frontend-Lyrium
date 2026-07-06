'use client';

import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Voucher, InvoiceKPIs, VoucherStatus, VoucherType } from '../types';
import { invoiceApi } from '@/shared/lib/api/invoiceRepository';

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
    dateFrom: string;
    dateTo: string;
}

const DEFAULT_FILTERS: VoucherFilters = {
    search: '', status: 'ALL', type: 'ALL', dateFrom: '', dateTo: '',
};

export function useSellerInvoices() {
    const queryClient = useQueryClient();
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [filters, setFiltersState] = useState<VoucherFilters>(DEFAULT_FILTERS);

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

    const filteredVouchers = vouchers.filter((v) => {
        if (filters.search) {
            const s = filters.search.toLowerCase();
            const match = v.series.toLowerCase().includes(s) ||
                v.number.toLowerCase().includes(s) ||
                v.store_name.toLowerCase().includes(s) ||
                v.store_ruc.toLowerCase().includes(s);
            if (!match) return false;
        }
        if (filters.status !== 'ALL' && v.sunat_status !== filters.status) return false;
        if (filters.type !== 'ALL' && v.type !== filters.type) return false;
        if (filters.dateFrom && new Date(v.emission_date) < new Date(filters.dateFrom)) return false;
        if (filters.dateTo) {
            const end = new Date(filters.dateTo);
            end.setHours(23, 59, 59, 999);
            if (new Date(v.emission_date) > end) return false;
        }
        return true;
    });

    const kpis = kpisData ?? null;

    const setFilters = (newFilters: Partial<VoucherFilters>) => {
        setFiltersState((prev) => ({ ...prev, ...newFilters }));
    };

    const clearAllFilters = useCallback(() => {
        setFiltersState(DEFAULT_FILTERS);
        queryClient.invalidateQueries({ queryKey: ['seller', 'invoices'] });
    }, [queryClient]);

    const hasActiveFilters = filters.search !== '' || filters.status !== 'ALL' || filters.type !== 'ALL' ||
        filters.dateFrom !== '' || filters.dateTo !== '';

    return {
        vouchers: filteredVouchers,
        kpis,
        isLoading,
        selectedVoucher,
        isDrawerOpen,
        filters,
        setFilters,
        clearFilters: clearAllFilters,
        hasActiveFilters,
        handleViewDetail: (voucher: Voucher) => {
            setSelectedVoucher(voucher);
            setIsDrawerOpen(true);
        },
        handleCloseDrawer: () => {
            setIsDrawerOpen(false);
            setTimeout(() => setSelectedVoucher(null), 300);
        },
    };
}
