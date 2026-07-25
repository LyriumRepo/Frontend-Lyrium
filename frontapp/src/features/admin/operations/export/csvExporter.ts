'use client';

import type { Expense } from '../types/operations';
import { downloadCsv } from '@/shared/lib/utils/csv';

function fmtDate(s: string | null | undefined): string {
    if (!s) return '—';
    try { return new Date(s).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
    catch { return s; }
}

export async function exportExpensesToCsv(expenses: Expense[]): Promise<void> {
    if (expenses.length === 0) return;

    const headers = ['N° Recibo', 'Concepto', 'Tipo', 'Monto', 'Estado', 'Proveedor', 'Tipo Prov.', 'Fecha Emis.', 'Fecha Pago', 'Registrado por'];
    const rows = expenses.map((e) => [
        e.receipt_number || '—',
        e.concept,
        e.voucher_type ?? '—',
        e.amount.toFixed(2),
        e.status,
        e.supplier?.name ?? '—',
        e.supplier?.type ?? '—',
        fmtDate(e.issued_at),
        fmtDate(e.paid_at),
        e.registered_by?.name ?? '—',
    ]);

    downloadCsv(`gestion-operativa-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}
