/**
 * POST /api/rapifac/emit
 * ---------------------------------------------------------------
 * Emite una factura electrónica a través de Rapifac.
 * Solo debe ser llamado desde el panel del Vendedor.
 *
 * Body esperado (JSON):
 *  {
 *    seller_id:     string   (ID del vendedor autenticado)
 *    seller_name:   string   (Nombre o email del vendedor)
 *    type:          'FACTURA' | 'BOLETA' | 'NOTA_CREDITO'
 *    customer_name: string
 *    customer_ruc:  string
 *    series:        string   (ej: "F001")
 *    number:        string   (ej: "00000001")
 *    amount:        number   (en PEN)
 *    order_id:      string
 *  }
 * ---------------------------------------------------------------
 */

import { NextResponse } from 'next/server';
import { emitRapifacInvoice } from '@/integrations/rapifac/client';
import { invoiceStore, StoredInvoice } from '@/integrations/rapifac/invoiceStore';
import { VoucherStatus } from '@/features/seller/invoices/types';
import { validateWithLaravel } from '@/shared/lib/server/auth';

export async function POST(request: Request) {
    const authUser = await validateWithLaravel();
    if (!authUser || !['seller', 'administrator'].includes(authUser.role)) {
        return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    let body: Record<string, unknown>;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, error: 'Body JSON inválido' },
            { status: 400 }
        );
    }

    const {
        seller_id,
        seller_name,
        type,
        customer_name,
        customer_ruc,
        series,
        number,
        amount,
        order_id,
    } = body as Record<string, string | number>;

    // Validación mínima
    if (!seller_id || !customer_name || !amount || !type) {
        return NextResponse.json(
            { success: false, error: 'Faltan campos obligatorios: seller_id, customer_name, amount, type' },
            { status: 422 }
        );
    }

    try {
        // 1. Llamar a Rapifac
        const rapifacResponse = await emitRapifacInvoice({
            customer_name: customer_name as string,
            customer_ruc: customer_ruc as string,
            type: type as 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO',
            series: series as string,
            number: number as string,
            amount: amount as number,
            order_id: order_id as string,
        });

        // 2. Persistir en el store compartido (admin + vendedor lo verán)
        const now = new Date().toISOString();
        const invoice: StoredInvoice = {
            id: `V-${Date.now()}`,
            series: series as string,
            number: number as string,
            type: type as 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO',
            customer_name: customer_name as string,
            customer_ruc: customer_ruc as string,
            order_id: order_id as string,
            amount: amount as number,
            emission_date: now,
            sunat_status: 'SENT_WAIT_CDR' as VoucherStatus,
            history: [
                {
                    status: 'DRAFT',
                    note: 'Documento generado por el vendedor',
                    timestamp: now.replace('T', ' ').substring(0, 16),
                    user: seller_name as string,
                },
                {
                    status: 'SENT_WAIT_CDR',
                    note: 'Enviado a Rapifac. Pendiente de CDR de SUNAT',
                    timestamp: now.replace('T', ' ').substring(0, 16),
                    user: 'Sistema',
                },
            ],
            seller_id: seller_id as string,
            seller_name: seller_name as string,
            created_at: now,
            rapifac_response: rapifacResponse,
        };

        invoiceStore.add(invoice);

        return NextResponse.json({ success: true, data: invoice });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        console.error('[Rapifac Emit Error]', message);
        return NextResponse.json(
            { success: false, error: message },
            { status: 502 }
        );
    }
}
