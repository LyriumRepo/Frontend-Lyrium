/**
 * Tipos compartidos por las secciones de detalle de comprobantes
 * (drawer de vendedor y drawers de admin).
 *
 * Vienen de `InvoiceResource` en el backend, en camelCase.
 */

export interface InvoiceOrderItem {
    productName: string;
    /** 'Producto' | 'Servicio' — distingue order_items de order_service_items */
    itemType?: 'Producto' | 'Servicio';
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    commissionAmount?: number;
    commissionRate?: number;
    storeName: string | null;
    storeSlug?: string | null;
}

export interface InvoiceStoreCommission {
    storeId: string;
    storeName: string;
    storeSlug?: string;
    subtotal: number;
    /** Tasa en porcentaje entero (ej. 15) tal como la guarda CommissionTier */
    commissionRate: number;
    commissionAmount: number;
    commissionIgv: number;
    commissionTotal: number;
}

export interface InvoiceOrderSummary {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
    items?: InvoiceOrderItem[];
    stores?: { id: string; name: string; slug: string }[];
}

const IGV_FACTOR = 1.18;
const IGV_RATE = 0.18;

/**
 * `commission_rate` llega como porcentaje entero (15) desde los ítems del pedido,
 * pero el fallback de `stores.commission_rate` es una fracción (0.15).
 * Normalizamos a porcentaje para mostrar siempre "15%".
 */
export function toPercent(rate: number): number {
    return rate > 0 && rate <= 1 ? rate * 100 : rate;
}

/**
 * Deriva las comisiones por tienda a partir de los ítems del pedido, replicando
 * la misma fórmula del backend (`InvoiceResource::storeCommissions` +
 * `CommissionService`): la comisión se calcula sobre el valor de venta sin IGV
 * y el IGV se extrae de la comisión, no se suma encima.
 */
export function buildStoreCommissions(
    items: InvoiceOrderItem[],
    fallbackRate?: number | null,
): InvoiceStoreCommission[] {
    const groups = new Map<string, InvoiceOrderItem[]>();

    for (const item of items) {
        const key = item.storeName ?? '—';
        const bucket = groups.get(key);
        if (bucket) bucket.push(item);
        else groups.set(key, [item]);
    }

    return Array.from(groups.entries()).map(([storeName, storeItems], idx) => {
        const subtotal = storeItems.reduce((sum, i) => sum + i.lineTotal, 0);

        const rawRate = storeItems.find(i => i.commissionRate)?.commissionRate
            ?? (fallbackRate ?? 0);
        const ratePercent = toPercent(rawRate);

        const storedCommission = storeItems.reduce((sum, i) => sum + (i.commissionAmount ?? 0), 0);
        const commissionTotal = storedCommission > 0
            ? storedCommission
            : round2((subtotal / IGV_FACTOR) * (ratePercent / 100));

        const commissionIgv = round2((commissionTotal / IGV_FACTOR) * IGV_RATE);

        return {
            storeId: `${storeName}-${idx}`,
            storeName,
            subtotal: round2(subtotal),
            commissionRate: ratePercent,
            commissionAmount: round2(commissionTotal),
            commissionIgv,
            commissionTotal: round2(commissionTotal),
        };
    });
}

function round2(value: number): number {
    return Math.round(value * 100) / 100;
}
