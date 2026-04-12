/**
 * GET /api/rapifac/invoices?seller_id=xxx
 * ---------------------------------------------------------------
 * Devuelve las facturas del store compartido.
 *
 * Parámetros de query:
 *   seller_id  (opcional) — filtra solo las facturas de ese vendedor.
 *                Si se omite, devuelve TODAS (uso del admin).
 * ---------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import { invoiceStore } from '@/integrations/rapifac/invoiceStore';
import { validateWithLaravel } from '@/shared/lib/server/auth';

export async function GET(request: Request) {
    const authUser = await validateWithLaravel();
    if (!authUser || !['seller', 'administrator'].includes(authUser.role)) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('seller_id');

    const invoices = sellerId
        ? invoiceStore.getBySeller(sellerId)
        : invoiceStore.getAll();

    return NextResponse.json({ success: true, data: invoices });
}
