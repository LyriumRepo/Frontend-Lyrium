import { useState, useEffect, useMemo, useCallback } from 'react';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type FiltroEstado = 'TODOS' | 'ACEPTADO' | 'REVISION' | 'RECHAZADO';

export interface SunatValidacion {
    rucExiste: boolean;
    estadoActivo: boolean;
    condicionHabido: boolean;
    emiteComprobante: boolean;
}

export interface SunatData {
    razonSocial: string | null;
    nombreComercial: string | null;
    fechaInicio: string | null;
    actividad: string | null;
    estado: string | null;
    condicion: string | null;
    comprobantes: string[];
    representantes: { tipoDocumento?: string; nroDocumento?: string; nombre?: string; cargo?: string; dni?: string }[];
    validacion: SunatValidacion;
}

export interface Solicitud {
    id: number;
    ruc: string;
    dni: string;
    nombreComercial: string;
    razonSocial: string;
    correo: string;
    score: number;
    etapa: number;           // 0 = sin evaluación RPA (fallback), 1 = booleana, 2 = puntaje
    riesgo: 'BAJO' | 'MEDIO' | 'ALTO';
    estado: 'ACEPTADO' | 'REVISION' | 'RECHAZADO';
    fechaRegistro: string;
    diagnostico: string[];
    sunatData: SunatData | null;
}

interface ResumenSolicitudes {
    total: number;
    aceptados: number;
    revision: number;
    rechazados: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
const PER_PAGE = 10;
const DEBOUNCE_MS = 400;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getAuthToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.authenticated || !data.token) {
            console.warn('[useSellers] Sesión no autenticada o sin token:', data);
            return null;
        }
        return data.token;
    } catch (err) {
        console.error('[useSellers] Error obteniendo sesión:', err);
        return null;
    }
}

// Mapea la respuesta del backend (snake_case) al tipo Solicitud (camelCase)
// usado por el componente SellersSolicitudes.
function mapApiToSolicitud(item: any): Solicitud {
    return {
        id: item.id,
        ruc: item.ruc ?? '',
        nombreComercial: item.nombre_comercial ?? '',
        razonSocial: item.razon_social ?? '—',
        dni: item.dni ?? '',
        correo: item.correo ?? '',
        score: Number(item.score ?? 0),
        etapa: Number(item.etapa ?? 1),
        riesgo: (item.riesgo ?? 'alto').toUpperCase() as Solicitud['riesgo'],
        estado: item.estado as Solicitud['estado'],
        fechaRegistro: item.created_at ?? new Date().toISOString(),
        diagnostico: Array.isArray(item.diagnostico) ? item.diagnostico : [],
        sunatData: item.sunat_data ?? null,
    };
}

// ─── Hook principal ───────────────────────────────────────────────────────────

export function useSellers() {
    const [datos, setDatos] = useState<Solicitud[]>([]);
    const [resumen, setResumen] = useState<ResumenSolicitudes>({ total: 0, aceptados: 0, revision: 0, rechazados: 0 });

    const [buscar, setBuscarRaw] = useState('');
    const [buscarDebounced, setBuscarDebounced] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS');

    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalFiltrado, setTotalFiltrado] = useState(0);

    const [expandido, setExpandido] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce del buscador
    useEffect(() => {
        const timer = setTimeout(() => setBuscarDebounced(buscar), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [buscar]);

    // Resetear a página 1 cuando cambian los filtros
    useEffect(() => {
        setPagina(1);
    }, [buscarDebounced, filtroEstado]);

    // Fetch principal
    const fetchSolicitudes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                estado: filtroEstado,
                per_page: String(PER_PAGE),
                page: String(pagina),
            });
            if (buscarDebounced.trim()) {
                params.append('buscar', buscarDebounced.trim());
            }

            const token = await getAuthToken();

            const response = await fetch(`${LARAVEL_API}/admin/seller-applications?${params.toString()}`, {
                headers: {
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status} al obtener solicitudes`);
            }

            const json = await response.json();

            const items: Solicitud[] = (json.data || []).map(mapApiToSolicitud);
            setDatos(items);

            if (json.pagination) {
                setTotalPaginas(json.pagination.totalPages || 1);
                setTotalFiltrado(json.pagination.total || items.length);
            } else {
                setTotalPaginas(1);
                setTotalFiltrado(items.length);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
            setDatos([]);
            setTotalFiltrado(0);
            setTotalPaginas(1);
        } finally {
            setLoading(false);
        }
    }, [filtroEstado, buscarDebounced, pagina]);

    useEffect(() => {
        fetchSolicitudes();
    }, [fetchSolicitudes]);

    // Resumen — se obtiene aparte (sin filtros) para mostrar las stat cards globales.
    // Si no quieres una llamada extra, puedes derivar esto de `datos` cuando filtroEstado === 'TODOS'.
    useEffect(() => {
        const fetchResumen = async () => {
            try {
                const token = await getAuthToken();
                const params = new URLSearchParams({ estado: 'TODOS', per_page: '1' });

                const response = await fetch(`${LARAVEL_API}/admin/seller-applications?${params.toString()}`, {
                    headers: {
                        Accept: 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                });
                if (!response.ok) return;

                const json = await response.json();
                const total = json.pagination?.total ?? 0;

                // Para los contadores por estado hacemos 3 llamadas livianas (per_page=1, solo nos interesa el total)
                const [acc, rev, rej] = await Promise.all(
                    ['ACEPTADO', 'REVISION', 'RECHAZADO'].map(async (estado) => {
                        const p = new URLSearchParams({ estado, per_page: '1' });
                        const r = await fetch(`${LARAVEL_API}/admin/seller-applications?${p.toString()}`, {
                            headers: {
                                Accept: 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                            },
                        });
                        if (!r.ok) return 0;
                        const j = await r.json();
                        return j.pagination?.total ?? 0;
                    })
                );

                setResumen({ total, aceptados: acc, revision: rev, rechazados: rej });
            } catch {
                // Silencioso: las stat cards simplemente quedarán en 0
            }
        };

        fetchResumen();
    }, [datos]); // se re-sincroniza cada vez que cambian los datos (ej. tras una acción)

    const toggleExpandido = useCallback((id: number) => {
        setExpandido(prev => (prev === id ? null : id));
    }, []);

    const cambiarPagina = useCallback((n: number) => {
        if (n < 1 || n > totalPaginas) return;
        setExpandido(null);
        setPagina(n);
    }, [totalPaginas]);

    const setBuscar = useCallback((v: string) => {
        setBuscarRaw(v);
    }, []);

    // ── Cambiar estado de una solicitud (acción del admin) ──────────────────
    const [cambiandoEstado, setCambiandoEstado] = useState<number | null>(null);
    const [errorEstado, setErrorEstado] = useState<string | null>(null);

    const cambiarEstado = useCallback(async (id: number, nuevoEstado: Solicitud['estado']) => {
        setCambiandoEstado(id);
        setErrorEstado(null);

        try {
            const token = await getAuthToken();

            const response = await fetch(`${LARAVEL_API}/admin/seller-applications/${id}/estado`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            const json = await response.json();

            if (!response.ok || !json.success) {
                throw new Error(json.errors?.estado?.[0] || json.message || 'No se pudo actualizar el estado');
            }

            // Actualizar la fila localmente sin esperar un refetch completo
            setDatos(prev => prev.map(s => s.id === id
                ? { ...s, estado: json.data.estado, sunatData: json.data.sunat_data ?? s.sunatData }
                : s
            ));

            return { success: true };
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Error al actualizar el estado';
            setErrorEstado(msg);
            return { success: false, message: msg };
        } finally {
            setCambiandoEstado(null);
        }
    }, []);

    return {
        datos,
        buscar,
        setBuscar,
        filtroEstado,
        setFiltroEstado,
        expandido,
        toggleExpandido,
        pagina,
        totalPaginas,
        cambiarPagina,
        resumen,
        totalFiltrado,
        loading,
        error,
        refetch: fetchSolicitudes,
        cambiarEstado,
        cambiandoEstado,
        errorEstado,
    };
}