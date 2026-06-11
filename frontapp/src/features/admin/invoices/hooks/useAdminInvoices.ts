import { useState, useEffect, useCallback, useMemo } from 'react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { Voucher } from '@/features/seller/invoices/types';
import { adminSellerRepository, SellerListItem } from '@/shared/lib/api/adminSellerRepository';

export interface AdminInvoiceKPIs {
    totalFacturado: number;
    totalComprobantes: number;
    pendingCount: number;
    rejectedCount: number;
    acceptedCount: number;
}

function calcKPIs(invoices: Voucher[]): AdminInvoiceKPIs {
    const accepted = invoices.filter(i => i.sunat_status === 'ACCEPTED');
    const pending = invoices.filter(i => i.sunat_status === 'SENT_WAIT_CDR');
    const rejected = invoices.filter(i => i.sunat_status === 'REJECTED' || i.sunat_status === 'OBSERVED');

    return {
        totalFacturado: accepted.reduce((s, i) => s + i.amount, 0),
        totalComprobantes: invoices.length,
        pendingCount: pending.length,
        rejectedCount: rejected.length,
        acceptedCount: accepted.length,
    };
}

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('laravel_token');
}

export function useAdminInvoices() {
    const [invoices, setInvoices] = useState<Voucher[]>([]);
    const [sellers, setSellers] = useState<SellerListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [search, setSearch] = useState('');
    const [storeSearch, setStoreSearch] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = getToken();
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${LARAVEL_API_URL}/invoices`, { headers });
            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }
            const json = await res.json() as { success: boolean; data: any; error?: string };
            if (!json.success) throw new Error(json.error ?? 'Error desconocido');
            
            const rawData = json.data;
            const invoiceList: Voucher[] = Array.isArray(rawData)
                ? rawData
                : (rawData && Array.isArray(rawData.data) ? rawData.data : []);

            setInvoices(invoiceList);

            try {
                const sellersRes = await adminSellerRepository.getSellers({ per_page: 100 });
                if (sellersRes && sellersRes.data) {
                    setSellers(sellersRes.data);
                }
            } catch (e) {
                console.warn(e);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar facturas');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const getStoreName = useCallback((storeId: string | null | undefined) => {
        if (!storeId) return 'Soporte / Lyrium';
        const seller = sellers.find(s => s.store && String(s.store.id) === String(storeId));
        return seller?.store?.trade_name || seller?.store?.store_name || `Tienda #${storeId}`;
    }, [sellers]);

    const filtered = useMemo(() => {
        return invoices.filter(i => {
            const q = search.toLowerCase();
            const matchesSearch = !search || (
                i.customer_name.toLowerCase().includes(q) ||
                i.customer_ruc.includes(q) ||
                i.series.toLowerCase().includes(q) ||
                i.number.includes(q) ||
                (i.order_id && i.order_id.toLowerCase().includes(q))
            );

            const sQ = storeSearch.toLowerCase();
            const storeName = getStoreName(i.store_id).toLowerCase();
            const matchesStore = !storeSearch || (
                storeName.includes(sQ) ||
                (i.store_id && String(i.store_id).includes(sQ))
            );

            const matchesDate = !dateFilter || (
                i.emission_date && i.emission_date.startsWith(dateFilter)
            );

            const matchesType = !typeFilter || typeFilter === 'ALL' || (
                i.type === typeFilter
            );

            return matchesSearch && matchesStore && matchesDate && matchesType;
        });
    }, [invoices, search, storeSearch, dateFilter, typeFilter, getStoreName]);

    const kpis = useMemo(() => calcKPIs(filtered), [filtered]);

    return {
        invoices: filtered,
        kpis,
        isLoading,
        error,
        search,
        setSearch,
        storeSearch,
        setStoreSearch,
        dateFilter,
        setDateFilter,
        typeFilter,
        setTypeFilter,
        getStoreName,
        refresh: fetchInvoices
    };
}
