import { useState, useEffect, useCallback } from 'react';
import { nubefactApi, type PlanInvoice, mapStatusLabel } from '@/shared/lib/api/nubefactRepository';

export interface PlanInvoiceRow {
    id: number;
    invoice_number: string;
    series: string;
    number: string;
    store_name: string;
    customer_name: string;
    customer_ruc: string;
    plan_name: string;
    months: number;
    total: number;
    sunat_status: string;
    sunat_label: string;
    emission_date: string;
    pdf_url: string | null;
}

function toRow(inv: PlanInvoice): PlanInvoiceRow {
    return {
        id: inv.id,
        invoice_number: inv.invoice_number ?? '—',
        series: inv.series ?? 'F001',
        number: inv.number ?? '—',
        store_name: inv.store_name ?? '—',
        customer_name: inv.customer_name ?? '—',
        customer_ruc: inv.customer_ruc ?? '—',
        plan_name: inv.plan_name ?? '—',
        months: inv.months ?? 0,
        total: inv.total,
        sunat_status: inv.sunat_status,
        sunat_label: mapStatusLabel(inv.sunat_status),
        emission_date: inv.emission_date ?? inv.created_at,
        pdf_url: inv.pdf_url,
    };
}

export function usePlanInvoices() {
    const [rows, setRows] = useState<PlanInvoiceRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await nubefactApi.planInvoices(1, 100);
            setRows(result.data.map(toRow));
            setTotal(result.pagination.total);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar facturas de suscripciones');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { rows, isLoading, error, total, refresh: fetchData };
}
