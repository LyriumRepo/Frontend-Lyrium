'use client';

import type { AdminInvoiceRow } from '../hooks/useAdminInvoices';
import { downloadCsv } from '@/shared/lib/utils/csv';

const STATUS_LABEL: Record<string, string> = {
    ACCEPTED:      'Aceptado',
    SENT_WAIT_CDR: 'Pendiente CDR',
    REJECTED:      'Rechazado',
    OBSERVED:      'Observado',
    DRAFT:         'Borrador',
};

function fmtDate(d: string): string {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return d; }
}

function fmtCommission(rate: number | null, amount: number | null): string {
    if (rate == null || amount == null) return '—';
    const pct = rate > 1 ? Math.round(rate) : Math.round(rate * 100);
    return `${pct}% · S/ ${amount.toFixed(2)}`;
}

export async function exportAdminInvoicesToCsv(rows: AdminInvoiceRow[]): Promise<void> {
    if (rows.length === 0) return;

    const headers = ['Vendedor', 'Tienda', 'Tipo', 'Serie-Código', 'Cliente', 'RUC', 'Monto', 'Comisión', 'Estado SUNAT', 'Fecha'];
    const csvRows = rows.map((r) => [
        r.seller_name || '—',
        r.stores[0]?.name ?? '—',
        r.type,
        `${r.series}-${r.number}`,
        r.customer_name || '—',
        r.customer_ruc || '—',
        (r.order_total ?? r.amount).toFixed(2),
        fmtCommission(r.commission_rate, r.commission_amount),
        STATUS_LABEL[r.sunat_status] ?? r.sunat_status,
        fmtDate(r.emission_date),
    ]);

    downloadCsv(`facturacion-admin-${new Date().toISOString().slice(0, 10)}.csv`, headers, csvRows);
}
