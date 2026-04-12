/**
 * invoiceStore.ts
 * ---------------------------------------------------------------
 * Store en memoria que actúa como capa de persistencia temporal.
 * En un proyecto real esto sería reemplazado por Prisma / Supabase.
 *
 * Al vivir en un módulo de Node.js (Route Handlers de Next.js),
 * el objeto se mantiene vivo entre peticiones dentro de la misma
 * instancia del servidor de desarrollo.
 * ---------------------------------------------------------------
 */

import { Voucher } from '@/features/seller/invoices/types';

/** Extiende Voucher con datos de auditoría */
export interface StoredInvoice extends Voucher {
    /** ID del vendedor que emitió el comprobante */
    seller_id: string;
    /** Nombre o correo del vendedor */
    seller_name: string;
    /** Timestamp de creación en el store */
    created_at: string;
    /** Respuesta cruda de Rapifac (para auditoría admin) */
    rapifac_response?: unknown;
}

/** Store en memoria — se comparte entre todos los Route Handlers */
const _store: StoredInvoice[] = [];

export const invoiceStore = {
    /** Guarda una factura emitida por un vendedor */
    add(invoice: StoredInvoice): StoredInvoice {
        _store.unshift(invoice); // más recientes primero
        return invoice;
    },

    /** Devuelve TODAS las facturas (para admin) */
    getAll(): StoredInvoice[] {
        return [..._store];
    },

    /** Devuelve sólo las facturas de un vendedor concreto */
    getBySeller(seller_id: string): StoredInvoice[] {
        return _store.filter(i => i.seller_id === seller_id);
    },

    /** Actualiza el estado de un comprobante (p.ej. retry) */
    updateStatus(id: string, patch: Partial<Voucher>): StoredInvoice | null {
        const idx = _store.findIndex(i => i.id === id);
        if (idx === -1) return null;
        _store[idx] = { ..._store[idx], ...patch };
        return _store[idx];
    }
};
