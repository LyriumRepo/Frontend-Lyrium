import { useState, useEffect, useCallback } from 'react';
import { nubefactApi, type PlanInvoice, type PlanInvoiceKPIs, mapStatusLabel } from '@/shared/lib/api/nubefactRepository';
import type { AdminInvoiceKPIs } from './useAdminInvoices';

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

export interface PlanInvoiceRow {
    id: number;
    invoice_number: string;
    series: string;
    number: string;
    type: string;
    store_name: string;
    customer_name: string;
    customer_ruc: string;
    plan_name: string;
    months: number;
    payment_method: string;
    total: number;
    subtotal_sin_igv: number;
    igv_amount: number;
    sunat_status: string;
    sunat_label: string;
    emission_date: string;
    receipt_pdf_url: string;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    izipay: 'Izipay',
    trial: 'Prueba gratuita',
    culqi: 'Culqi',
};

function toRow(inv: PlanInvoice): PlanInvoiceRow {
    return {
        id: inv.id,
        invoice_number: inv.invoice_number ?? '—',
        series: inv.series ?? 'F001',
        number: inv.number ?? '—',
        type: inv.type ?? 'FACTURA',
        store_name: inv.store_name ?? '—',
        customer_name: inv.customer_name ?? '—',
        customer_ruc: inv.customer_ruc ?? '—',
        plan_name: inv.plan_name ?? '—',
        months: inv.months ?? 0,
        payment_method: inv.payment_method
            ? (PAYMENT_METHOD_LABELS[inv.payment_method] ?? inv.payment_method)
            : '—',
        total: inv.total,
        subtotal_sin_igv: inv.subtotal_sin_igv ?? 0,
        igv_amount: inv.igv_amount ?? 0,
        sunat_status: inv.sunat_status,
        sunat_label: mapStatusLabel(inv.sunat_status),
        emission_date: inv.emission_date ?? inv.created_at,
        receipt_pdf_url: `${API_URL}/plan-invoices/${inv.id}/pdf`,
    };
}

function toAdminKpis(kpis: PlanInvoiceKPIs): AdminInvoiceKPIs {
    return { ...kpis, topSellers: [] };
}

export function usePlanInvoices() {
    const [rows, setRows] = useState<PlanInvoiceRow[]>([]);
    const [kpis, setKpis] = useState<AdminInvoiceKPIs | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [total, setTotal] = useState(0);
    const [selectedRow, setSelectedRow] = useState<PlanInvoiceRow | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [result, kpisResult] = await Promise.all([
                nubefactApi.planInvoices(1, 100),
                nubefactApi.planInvoiceKpis(),
            ]);
            setRows(result.data.map(toRow));
            setTotal(result.pagination.total);
            setKpis(toAdminKpis(kpisResult));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar facturas de suscripciones');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleViewDetail = useCallback((row: PlanInvoiceRow) => {
        setSelectedRow(row);
        setIsDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setSelectedRow(null);
    }, []);

    return {
        rows,
        kpis,
        isLoading,
        error,
        total,
        refresh: fetchData,
        selectedRow,
        isDrawerOpen,
        handleViewDetail,
        handleCloseDrawer,
    };
}
