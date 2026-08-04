const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

export type ContractStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED';

export interface SellerContract {
    id: string; // contract_number
    dbId: number;
    status: ContractStatus;
    start: string | null;
    end: string | null;
    storage_path: string;
    has_signed_doc: boolean;
    expiryUrgency: string | null;
    createdAt: string | null;
}

function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('laravel_token');
}

function authHeaders(): Record<string, string> {
    const token = getToken();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

/** Devuelve el convenio del vendedor autenticado, o `null` si aún no se ha generado ninguno. */
export async function fetchMyContract(): Promise<SellerContract | null> {
    const res = await fetch(`${API_BASE}/contracts/me`, { headers: authHeaders() });
    if (res.status === 404) return null;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message ?? 'No se pudo cargar el convenio');
    return json.data as SellerContract;
}

/** Descarga el documento Word del convenio pendiente de firma y dispara la descarga en el navegador. */
export async function downloadMyContract(): Promise<void> {
    const res = await fetch(`${API_BASE}/contracts/me/download`, { headers: authHeaders() });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message ?? 'No se pudo descargar el documento');
    }
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') ?? '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match?.[1] ?? 'convenio.docx';

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

/** Sube el documento firmado por el vendedor para verificación del administrador. */
export async function uploadSignedContract(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/contracts/me/upload-signed`, {
        method: 'POST',
        headers: authHeaders(),
        body: formData,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message ?? 'No se pudo subir el documento firmado');
}

/** Solicita la renovación de un convenio vencido. */
export async function renewContract(dbId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/contracts/${dbId}/renew`, {
        method: 'POST',
        headers: authHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message ?? json.error ?? 'No se pudo solicitar la renovación');
}
