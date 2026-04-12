/**
 * useAdminInvoices.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { StoredInvoice } from '@/integrations/rapifac/invoiceStore';

export interface AdminInvoiceKPIs {
    totalFacturado: number;
    totalComprobantes: number;
    pendingCount: number;
    rejectedCount: number;
    acceptedCount: number;
}

function calcKPIs(invoices: StoredInvoice[]): AdminInvoiceKPIs {
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

export function useAdminInvoices() {
    const [invoices, setInvoices] = useState<StoredInvoice[]>([]);
    const [kpis, setKpis] = useState<AdminInvoiceKPIs | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchInvoices = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/rapifac/invoices');
            if (!res.ok) {
                throw new Error(`API error: ${res.status}`);
            }
            const json = await res.json() as { success: boolean; data: StoredInvoice[]; error?: string };
            if (!json.success) throw new Error(json.error ?? 'Error desconocido');
            setInvoices(json.data);
            setKpis(calcKPIs(json.data));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Error al cargar facturas');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const filtered = invoices.filter(i => {
        const q = search.toLowerCase();
        return (
            i.seller_name?.toLowerCase().includes(q) ||
            i.customer_name.toLowerCase().includes(q) ||
            i.customer_ruc.includes(q) ||
            i.series.toLowerCase().includes(q) ||
            i.number.includes(q) ||
            i.order_id.toLowerCase().includes(q)
        );
    });

    return {
        invoices: filtered,
        kpis,
        isLoading,
        error,
        search,
        setSearch,
        refresh: fetchInvoices,
    };
}
