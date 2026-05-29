/**
 * useAdminInvoices.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { Voucher } from '@/features/seller/invoices/types';

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
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, ...vals] = cookie.trim().split('=');
        if (key) acc[key] = decodeURIComponent(vals.join('='));
        return acc;
    }, {} as Record<string, string>);
    return cookies['laravel_token'] ?? null;
}

export function useAdminInvoices() {
    const [invoices, setInvoices] = useState<Voucher[]>([]);
    const [kpis, setKpis] = useState<AdminInvoiceKPIs | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

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
            const json = await res.json() as { success: boolean; data: Voucher[]; error?: string };
            if (!json.success) throw new Error(json.error ?? 'Error desconocido');
            setInvoices(json.data || []);
            setKpis(calcKPIs(json.data || []));
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
