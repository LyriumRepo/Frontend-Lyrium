'use client';

import type { Transaction } from '../types/transactions';
import { downloadCsv } from '@/shared/lib/utils/csv';

const PAYMENT_LABEL: Record<string, string> = {
    paid:     'Pagado',
    pending:  'Pendiente',
    failed:   'Fallido',
    refunded: 'Reembolsado',
};

const TX_LABEL: Record<string, string> = {
    AUTHORISED: 'Autorizado',
    CAPTURED:   'Capturado',
    REFUSED:    'Rechazado',
    CANCELLED:  'Cancelado',
    PENDING:    'Pendiente',
    EXPIRED:    'Expirado',
    ERROR:      'Error',
};

function fmtDate(s: string): string {
    try { return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return s; }
}

export async function exportPaymentsToCsv(transactions: Transaction[]): Promise<void> {
    if (transactions.length === 0) return;

    const headers = ['Orden', 'Fecha', 'Cliente', 'Tienda(s)', 'Total', 'Comisión', 'Método', 'Tarjeta', 'Estado Pago', 'Estado Trans.'];
    const rows = transactions.map((t) => [
        t.orderNumber,
        fmtDate(t.createdAt),
        t.customer?.name ?? '—',
        t.stores.map((s) => s.name).join(', ') || '—',
        t.total.toFixed(2),
        t.commissionTotal != null ? t.commissionTotal.toFixed(2) : '—',
        t.paymentMethod ?? '—',
        t.cardBrand ? `${t.cardBrand} ****${t.cardLast4}` : '—',
        PAYMENT_LABEL[t.paymentStatus] ?? t.paymentStatus,
        t.transactionStatus ? (TX_LABEL[t.transactionStatus] ?? t.transactionStatus) : '—',
    ]);

    downloadCsv(`pagos-izipay-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}
