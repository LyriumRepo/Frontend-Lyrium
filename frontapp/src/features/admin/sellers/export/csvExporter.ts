'use client';

import type { Seller } from '../types';
import { downloadCsv } from '@/shared/lib/utils/csv';

const STATUS_LABEL: Record<string, string> = {
    ACTIVE:     'Activo',
    PENDING:    'Pendiente',
    SUSPENDED:  'Suspendido',
    REJECTED:   'Rechazado',
    activa:     'Activo',
    approved:   'Aprobado',
    suspendida: 'Suspendido',
    baja_logica:'Baja Lógica',
};

export async function exportSellersToCsv(sellers: Seller[]): Promise<void> {
    if (sellers.length === 0) return;

    const headers = ['ID', 'Nombre', 'Empresa', 'Email', 'Estado', 'Productos', 'Pendientes', 'Contratos', 'Registro'];
    const rows = sellers.map((s) => [
        s.id,
        s.name,
        s.company,
        s.email,
        STATUS_LABEL[String(s.status)] ?? String(s.status),
        s.productsTotal,
        s.productsPending,
        s.contractStatus ?? '—',
        s.regDate,
    ]);

    downloadCsv(`padron-vendedores-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}
