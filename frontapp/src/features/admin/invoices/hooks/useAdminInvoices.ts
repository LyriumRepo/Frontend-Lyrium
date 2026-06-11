import { useState, useEffect, useCallback } from 'react';
import { nubefactApi, type NubefactInvoice, type NubefactStore } from '@/shared/lib/api/nubefactRepository';

export interface AdminInvoiceKPIs {
    totalFacturado: number;
    totalComprobantes: number;
    pendingCount: number;
    rejectedCount: number;
    acceptedCount: number;
}

export interface AdminInvoiceRow {
    id: string;
    type: string;
    series: string;
    number: string;
    customer_name: string;
    customer_ruc: string;
    amount: number;
    sunat_status: string;
    emission_date: string;
    order_id: string;
    pdf_url: string | null;
    items: NubefactInvoice['items'];
    order: NubefactInvoice['order'];
    stores: NubefactStore[];
}

function toRow(inv: NubefactInvoice): AdminInvoiceRow {
    return {
        id: inv.id,
        type: inv.type,
        series: inv.series ?? '—',
        number: inv.number ?? '—',
        customer_name: inv.businessName ?? '—',
        customer_ruc: inv.nit ?? '—',
        amount: inv.total,
        sunat_status: inv.status,
        emission_date: inv.createdAt,
        order_id: inv.orderId ?? '',
        pdf_url: inv.pdfUrl,
        items: inv.items,
        order: inv.order,
        stores: inv.order?.stores ?? [],
    };
}

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('laravel_token');
}

export function useAdminInvoices() {
    const [invoices, setInvoices] = useState<NubefactInvoice[]>([]);
    const [kpis, setKpis] = useState<AdminInvoiceKPIs | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [listResult, kpisResult] = await Promise.all([
                nubefactApi.comprobantes(1, 200),
                nubefactApi.kpis(),
            ]);

            setInvoices(listResult.data);
            setKpis({
                totalFacturado: kpisResult.totalFacturado,
                totalComprobantes: kpisResult.totalComprobantes,
                pendingCount: kpisResult.pendientesCdr,
                rejectedCount: kpisResult.rechazadosObservados,
                acceptedCount: kpisResult.aceptados,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar comprobantes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = invoices
        .map(toRow)
        .filter(i => {
            const q = search.toLowerCase();
            return (
                i.customer_name.toLowerCase().includes(q) ||
                i.customer_ruc.includes(q) ||
                i.series.toLowerCase().includes(q) ||
                i.number.includes(q) ||
                i.type.toLowerCase().includes(q)
            );
        });

    return {
        invoices: filtered,
        kpis,
        isLoading,
        error,
        search,
        setSearch,
        refresh: fetchData,
    };
}
