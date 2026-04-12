/**
 * client.ts  (SERVER-ONLY — nunca importar desde código cliente)
 * ---------------------------------------------------------------
 * Comunicación de bajo nivel con la API de Rapifac.
 * Lee las variables de entorno definidas en .env.local:
 *   RAPIFAC_AUTH_URL, RAPIFAC_SALES_URL, RAPIFAC_RUC,
 *   RAPIFAC_USER, RAPIFAC_PASSWORD, RAPIFAC_BRANCH_ID
 * ---------------------------------------------------------------
 */

let _cachedToken: string | null = null;
let _tokenExpiresAt = 0;

/** Obtiene un Bearer token de Rapifac con caché de 55 min */
export async function getRapifacToken(): Promise<string> {
    const now = Date.now();
    if (_cachedToken && now < _tokenExpiresAt) {
        return _cachedToken;
    }

    const authUrl = process.env.RAPIFAC_AUTH_URL;
    if (!authUrl) throw new Error('RAPIFAC_AUTH_URL no definida en .env.local');

    const body = new URLSearchParams({
        grant_type: 'password',
        client_id: process.env.RAPIFAC_RUC ?? '',
        username: process.env.RAPIFAC_USER ?? '',
        password: process.env.RAPIFAC_PASSWORD ?? '',
    });

    const res = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Rapifac Auth falló [${res.status}]: ${text}`);
    }

    const data = await res.json();
    _cachedToken = data.access_token as string;
    _tokenExpiresAt = now + 55 * 60 * 1000; // 55 minutos
    return _cachedToken;
}

/** Payload mínimo que Rapifac espera para emitir una factura */
export interface RapifacInvoicePayload {
    customer_name: string;
    customer_ruc: string;
    type: 'FACTURA' | 'BOLETA' | 'NOTA_CREDITO';
    series: string;
    number: string;
    amount: number;
    order_id: string;
    /** Metadatos extra (libres) */
    [key: string]: unknown;
}

/** Envía una factura a Rapifac y retorna la respuesta cruda */
export async function emitRapifacInvoice(
    payload: RapifacInvoicePayload
): Promise<unknown> {
    const token = await getRapifacToken();
    const salesUrl = process.env.RAPIFAC_SALES_URL;
    const branchId = process.env.RAPIFAC_BRANCH_ID;

    if (!salesUrl) throw new Error('RAPIFAC_SALES_URL no definida en .env.local');

    const url = branchId ? `${salesUrl}?branchId=${branchId}` : salesUrl;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Rapifac Emission falló [${res.status}]: ${text}`);
    }

    return res.json();
}
