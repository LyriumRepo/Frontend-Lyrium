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

const MOCK_INVOICES: Voucher[] = [
    {
        id: 'mock-inv-1',
        series: 'FFF1',
        number: '0104',
        type: 'FACTURA',
        customer_name: 'BIOTIENDA DEMO SAC',
        customer_ruc: '20056089226',
        order_id: 'ORD-00104',
        amount: 320.50,
        emission_date: '2026-06-07T14:30:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '1',
        history: []
    },
    {
        id: 'mock-inv-2',
        series: 'BBB1',
        number: '0542',
        type: 'BOLETA',
        customer_name: 'JUAN PEREZ GARCIA',
        customer_ruc: '10458822991',
        order_id: 'ORD-00105',
        amount: 45.90,
        emission_date: '2026-06-08T09:15:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '2',
        history: []
    },
    {
        id: 'mock-inv-3',
        series: 'FFF1',
        number: '0105',
        type: 'FACTURA',
        customer_name: 'SERVICIOS MEDICOS INTEGRALES SAC',
        customer_ruc: '20601234567',
        order_id: 'ORD-00106',
        amount: 1500.00,
        emission_date: '2026-06-09T16:45:00Z',
        sunat_status: 'SENT_WAIT_CDR',
        store_id: '3',
        history: []
    },
    {
        id: 'mock-inv-4',
        series: 'BBB1',
        number: '0543',
        type: 'BOLETA',
        customer_name: 'MARIA ALVAREZ CHUNGA',
        customer_ruc: '10784422993',
        order_id: 'ORD-00107',
        amount: 118.00,
        emission_date: '2026-06-10T10:00:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '1',
        history: []
    },
    {
        id: 'mock-inv-5',
        series: 'FFF1',
        number: '0106',
        type: 'FACTURA',
        customer_name: 'ALIMENTOS SALUDABLES SAC',
        customer_ruc: '20458877112',
        order_id: 'ORD-00108',
        amount: 850.00,
        emission_date: '2026-06-11T11:20:00Z',
        sunat_status: 'REJECTED',
        store_id: '2',
        history: []
    },
    {
        id: 'mock-inv-6',
        series: 'BBB1',
        number: '0544',
        type: 'BOLETA',
        customer_name: 'CARLOS MERINO RUIZ',
        customer_ruc: '10229944883',
        order_id: 'ORD-00109',
        amount: 75.00,
        emission_date: '2026-06-12T12:05:00Z',
        sunat_status: 'OBSERVED',
        store_id: '3',
        history: []
    },
    {
        id: 'mock-inv-7',
        series: 'FFF1',
        number: '0107',
        type: 'FACTURA',
        customer_name: 'INVERSIONES SANTA FE EIRL',
        customer_ruc: '20556677889',
        order_id: 'ORD-00110',
        amount: 980.00,
        emission_date: '2026-06-12T14:10:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '1',
        history: []
    },
    {
        id: 'mock-inv-8',
        series: 'BBB1',
        number: '0545',
        type: 'BOLETA',
        customer_name: 'ANA GOMEZ FLORES',
        customer_ruc: '10998877665',
        order_id: 'ORD-00111',
        amount: 210.00,
        emission_date: '2026-06-12T15:30:00Z',
        sunat_status: 'ACCEPTED',
        store_id: '2',
        history: []
    }
];

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

            setInvoices([...invoiceList, ...MOCK_INVOICES]);

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
            setInvoices(MOCK_INVOICES);
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

            const matchesDate = !dateFilter || (() => {
                if (!i.emission_date) return false;
                if (i.emission_date.startsWith(dateFilter)) return true;
                try {
                    const d = new Date(i.emission_date);
                    if (isNaN(d.getTime())) return false;
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    const localDateStr = `${year}-${month}-${day}`;
                    if (localDateStr === dateFilter) return true;
                } catch {}
                try {
                    const d = new Date(i.emission_date);
                    if (isNaN(d.getTime())) return false;
                    const year = d.getUTCFullYear();
                    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(d.getUTCDate()).padStart(2, '0');
                    const utcDateStr = `${year}-${month}-${day}`;
                    if (utcDateStr === dateFilter) return true;
                } catch {}
                return false;
            })();

            const matchesType = !typeFilter || typeFilter === 'ALL' || (
                i.type && i.type.toUpperCase() === typeFilter.toUpperCase()
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
