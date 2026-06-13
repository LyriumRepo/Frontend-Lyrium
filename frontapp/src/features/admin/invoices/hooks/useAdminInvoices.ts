import { useState, useEffect, useCallback, useMemo } from 'react';
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

export function useAdminInvoices() {
    const [invoices, setInvoices] = useState<NubefactInvoice[]>([]);
    const [kpis, setKpis] = useState<AdminInvoiceKPIs | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [storeFilter, setStoreFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

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

    const allStores = useMemo(() => {
        const names = new Set<string>();
        for (const inv of invoices) {
            for (const s of inv.order?.stores ?? []) {
                names.add(s.name);
            }
        }
        return Array.from(names).sort();
    }, [invoices]);

    const allTypes = useMemo(() => {
        const types = new Set(invoices.map(i => i.type));
        return Array.from(types).sort();
    }, [invoices]);

    const filtered = useMemo(() => {
        const rows = invoices.map(toRow);

        return rows.filter(i => {
            const q = search.toLowerCase();
            if (q && !(
                i.customer_name.toLowerCase().includes(q) ||
                i.customer_ruc.includes(q) ||
                i.series.toLowerCase().includes(q) ||
                i.number.includes(q) ||
                i.type.toLowerCase().includes(q)
            )) return false;

            if (storeFilter && !i.stores.some(s => s.name === storeFilter)) return false;

            if (typeFilter && i.type !== typeFilter) return false;

            if (dateFrom && i.emission_date < dateFrom) return false;

            if (dateTo) {
                const endOfDay = dateTo + 'T23:59:59';
                if (i.emission_date > endOfDay) return false;
            }

            return true;
        });
    }, [invoices, search, storeFilter, typeFilter, dateFrom, dateTo]);

    return {
        invoices: filtered,
        kpis,
        isLoading,
        error,
        search,
        setSearch,
        storeFilter,
        setStoreFilter,
        typeFilter,
        setTypeFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        allStores,
        allTypes,
        refresh: fetchData,
    };
}
