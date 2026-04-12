const FRONT_IMG = process.env.NEXT_PUBLIC_FRONT_IMG ?? '/img';

export const NO_IMAGE = `${FRONT_IMG}/no-image.png`;

export function money(n?: number | string | null): string {
    return 'S/ ' + Number(n ?? 0).toFixed(2);
}

export function resolveImg(url?: string | null): string {
    if (!url) return NO_IMAGE;
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith('/')) return url;
    return NO_IMAGE;
}

export interface ApiProduct {
    id: number | string;
    nombre: string;
    sku?: string;
    categoria_nombre?: string;
    imagen_url?: string;
    descripcion_corta?: string;
    descripcion_larga?: string;
    precio: number | string;
    precio_final?: number | string;
    precio_oferta?: number | string;
    descuento_pct?: number | string;
    stock?: number | string;
    estado_stock?: string;
    rating_promedio?: number | string;
    rating_total?: number | string;
}

export interface ApiCartItem {
    id: number | string;
    producto_id: number | string;
    producto_nombre?: string;
    imagen_url?: string;
    precio_unitario: number | string;
    cantidad: number | string;
    vendedor_slug?: string;
    vendedor_nombre?: string;
    categorias?: string[];
}

export function calculateCartSummary(items: ApiCartItem[], envioCosto = 0) {
    const subtotal = items.reduce(
        (sum, item) => sum + Number(item.precio_unitario ?? 0) * Number(item.cantidad ?? 0),
        0
    );

    const total = subtotal + envioCosto;
    const itemCount = items.reduce((sum, item) => sum + Number(item.cantidad ?? 0), 0);

    return {
        subtotal,
        descuento: 0,
        envio: envioCosto,
        total,
        itemCount,
    };
}

export function formatPrice(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
}

export function generateCartItemId(productId: string, variant?: string): string {
    return variant ? `${productId}-${variant}` : productId;
}
