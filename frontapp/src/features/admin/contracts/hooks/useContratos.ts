'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    Contract,
    ContractFilters,
    ContractKPI,
    ContractStatus,
    UpdateContractStatusPayload,
    ApiContractKpis,
} from '@/lib/types/admin/contracts';

// ─────────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────────

const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Obtiene el token Bearer de la sesión admin actual.
 * Misma fuente que usa useSellers.ts: una ruta propia de Next.js que
 * expone el token ya emitido por Laravel Sanctum para este usuario.
 */
async function getAuthToken(): Promise<string | null> {
    try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.authenticated || !data.token) {
            console.warn('[useContratos] Sesión no autenticada o sin token:', data);
            return null;
        }
        return data.token;
    } catch (err) {
        console.error('[useContratos] Error obteniendo sesión:', err);
        return null;
    }
}

/**
 * Helper de fetch autenticado para rutas admin.
 * Adjunta el token Bearer obtenido de getAuthToken() — mismo mecanismo
 * que usa useSellers.ts para el módulo de Solicitudes de Registro.
 */
async function adminFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const token = await getAuthToken();
    const res = await fetch(`${LARAVEL_API}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status} en ${path}`);
    }
    return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mapeo API → frontend
//
// Alineado con App\Http\Resources\ContractResource::toArray():
//   id      → contract_number (string, ej. "CTR-2025-001")
//   dbId    → ID numérico real de la tabla `contracts` (usado en las URLs)
//   storeId, rep, storage_path, signed_file_path, expiryUrgency, auditTrail,
//   createdAt ya vienen en el formato/clave exactos que usa este hook.
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApiToContract(raw: any): Contract {
    // El Resource devuelve el string 'Pendiente de Carga' cuando no hay
    // archivo aún (en vez de null/''), así que lo normalizamos aquí.
    const storagePath = raw.storage_path && raw.storage_path !== 'Pendiente de Carga'
        ? raw.storage_path
        : '';

    return {
        _numericId:       raw.dbId,                                  // ID numérico real → para URLs de API
        id:               raw.id ?? String(raw.dbId),                // ya es el contract_number (ej. "CTR-2025-001")
        company:          raw.company          ?? '',
        ruc:              raw.ruc              ?? '',
        rep:              raw.rep              ?? '',                // el Resource ya lo expone como "rep"
        type:             raw.type             ?? 'comercial',
        modality:         raw.modality         ?? 'estandar',
        status:           (raw.status?.toUpperCase() ?? 'PENDING') as ContractStatus,
        start:            raw.start             ?? '',                // el Resource ya lo expone como "start" (YYYY-MM-DD)
        end:              raw.end               ?? '',                // el Resource ya lo expone como "end"   (YYYY-MM-DD)
        storage_path:     storagePath,
        store_id:         raw.storeId          ?? null,               // el Resource lo expone como "storeId"
        signed_file_path: raw.signed_file_path ?? null,
        notes:            raw.notes            ?? null,
        created_at:       raw.createdAt        ?? '',                 // el Resource lo expone como "createdAt"
        expiryUrgency:    raw.expiryUrgency    ?? 'normal',            // ya viene calculado desde el backend
        auditTrail:       raw.auditTrail       ?? [],                 // ya viene en la forma {timestamp, action, user}
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────

export const useContratos = () => {
    const queryClient = useQueryClient();
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

    const [filters, setFilters] = useState<ContractFilters>({
        query:     '',
        modality:  'ALL',
        status:    'ALL',
        dateType:  'SIGNATURE',
        dateLimit: '',
    });

    // ── Query: listar contratos desde la API real ─────────────────────────────
    // La respuesta de index() viene con forma { data: [...], links, meta, kpis }.
    // Los KPIs los calcula el backend sobre TODA la tabla — no solo la página
    // actual — así que los capturamos aparte en vez de recalcularlos aquí.

    const { data, isLoading, error } = useQuery({
        queryKey: ['admin', 'contracts'],
        queryFn: async (): Promise<{ contracts: Contract[]; apiKpis: ApiContractKpis | null }> => {
            const res  = await adminFetch('/contracts');
            const json = await res.json();
            // Si alguna vez se usa sin paginar, también acepta un array directo.
            const rows = Array.isArray(json) ? json : (json.data ?? []);
            return {
                contracts: rows.map(mapApiToContract),
                apiKpis:   Array.isArray(json) ? null : (json.kpis ?? null),
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutos de caché
    });

    const contracts = data?.contracts ?? [];
    const apiKpis    = data?.apiKpis  ?? null;

    // ── Mutation: cambiar estado (validar / invalidar) ────────────────────────

    const updateContractMutation = useMutation({
        mutationFn: async ({
            numericId,
            status,
            updatedInfo,
        }: {
            numericId:   number;
            id:          string;          // contract_number — para actualizar caché
            status:      ContractStatus;
            updatedInfo: Partial<Contract>;
        }) => {
            const payload: UpdateContractStatusPayload = { status };
            await adminFetch(`/contracts/${numericId}/status`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            return { numericId, status, updatedInfo };
        },

        onSuccess: ({ numericId, status, updatedInfo }) => {
            queryClient.setQueryData(['admin', 'contracts'], (old: Contract[] | undefined) => {
                if (!old) return old;
                return old.map(c => {
                    if (c._numericId !== numericId) return c;
                    return {
                        ...c,
                        ...updatedInfo,
                        status,
                        auditTrail: [
                            ...(c.auditTrail || []),
                            {
                                timestamp: new Date().toISOString(),
                                action:    `Estado actualizado a ${status}`,
                                user:      'Admin',
                            },
                        ],
                    };
                });
            });
            setSelectedContractId(null);
        },
    });

    // ── Mutation: crear contrato manualmente (borrador en blanco) ─────────────
    // Usado por el botón "Nuevo Contrato" en ContratosModule, para los casos
    // en que el admin necesita crear un contrato fuera del flujo de registro
    // automático del SELLER (RPA / fallback).
    const createContractMutation = useMutation({
        mutationFn: async (): Promise<Contract> => {
            const res  = await adminFetch('/contracts', { method: 'POST' });
            const json = await res.json();
            return mapApiToContract(json.data ?? json);
        },
        onSuccess: (newContract) => {
            queryClient.setQueryData(['admin', 'contracts'], (old: Contract[] | undefined) => {
                return old ? [newContract, ...old] : [newContract];
            });
            setSelectedContractId(newContract.id);
        },
    });

    // ── Action: descargar .docx del contrato ─────────────────────────────────
    // Usa fetch + Blob para que la descarga respete la autenticación Sanctum.

    const downloadContract = async (contract: Contract) => {
        try {
            const res  = await adminFetch(`/contracts/${contract._numericId}/download`);
            const blob = await res.blob();
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `${contract.id}_${contract.company.replace(/\s+/g, '_')}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('[Contratos] Error al descargar el contrato:', err);
            throw err; // re-lanzamos para que el componente pueda mostrar feedback
        }
    };

    // ── Filtrado (la urgencia de vencimiento ya viene calculada del backend) ──

    const filteredContracts = useMemo(() => {
        return contracts.filter(c => {
            const matchQuery = !filters.query ||
                c.company.toLowerCase().includes(filters.query.toLowerCase()) ||
                c.ruc.includes(filters.query) ||
                c.id.toLowerCase().includes(filters.query.toLowerCase()) ||
                c.rep.toLowerCase().includes(filters.query.toLowerCase());

            const matchStatus   = filters.status   === 'ALL' || c.status   === filters.status;
            const matchModality = filters.modality === 'ALL' || c.modality === filters.modality;

            let matchDate = true;
            if (filters.dateLimit) {
                const targetDate = filters.dateType === 'SIGNATURE' ? c.start : c.end;
                matchDate = !!targetDate && targetDate <= filters.dateLimit;
            }

            return matchQuery && matchStatus && matchModality && matchDate;
        });
    }, [contracts, filters]);

    // ── KPIs ──────────────────────────────────────────────────────────────────
    // Usamos los KPIs que calcula el backend sobre TODA la tabla (apiKpis).
    // Si por algún motivo no llegan (ej. respuesta no paginada), recurrimos a
    // contar el array cargado como respaldo — sabiendo que solo reflejaría
    // la página actual.

    const kpis = useMemo((): ContractKPI[] => {
        const total   = apiKpis?.total   ?? contracts.length;
        const active  = apiKpis?.active  ?? contracts.filter(c => c.status === 'ACTIVE').length;
        const pending = apiKpis?.pending ?? contracts.filter(c => c.status === 'PENDING').length;
        const expired = apiKpis?.expired ?? contracts.filter(c => c.status === 'EXPIRED').length;

        return [
            { label: 'Total Contratos',     val: total,   color: 'indigo',  icon: 'Files' },
            { label: 'Vigentes (Activos)',   val: active,  color: 'emerald', icon: 'CheckCircle' },
            { label: 'Por Validar',          val: pending, color: 'amber',   icon: 'Hourglass' },
            { label: 'Vencidos / Exp.',      val: expired, color: 'red',     icon: 'AlertOctagon' },
        ];
    }, [contracts, apiKpis]);

    // ── Contrato seleccionado ─────────────────────────────────────────────────

    const selectedContract = useMemo(
        () => contracts.find(c => c.id === selectedContractId) || null,
        [contracts, selectedContractId]
    );

    // ── Acción: abrir plantillas legales ─────────────────────────────────────

    const openTemplates = () => {
        window.open(
            'https://docs.google.com/viewer?url=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            '_blank'
        );
    };

    // ── API pública del hook ──────────────────────────────────────────────────

    return {
        state: {
            contracts: filteredContracts,
            kpis,
            loading: isLoading
                || updateContractMutation.isPending
                || createContractMutation.isPending,
            error:   error ? (error as Error).message : null,
            filters,
            selectedContract,
        },
        actions: {
            setFilters,

            setSelectedContract: (c: Contract | null) =>
                setSelectedContractId(c?.id || null),

            // Cambia estado a ACTIVE — llama a PUT /api/contracts/{id}/status
            validateContract: (id: string, updatedInfo: Partial<Contract>) => {
                const contract = contracts.find(c => c.id === id);
                if (!contract) return Promise.reject(new Error('Contrato no encontrado'));
                return updateContractMutation.mutateAsync({
                    numericId: contract._numericId,
                    id,
                    status: 'ACTIVE',
                    updatedInfo,
                });
            },

            // Cambia estado a EXPIRED — llama a PUT /api/contracts/{id}/status
            invalidateContract: (id: string, updatedInfo: Partial<Contract>) => {
                const contract = contracts.find(c => c.id === id);
                if (!contract) return Promise.reject(new Error('Contrato no encontrado'));
                return updateContractMutation.mutateAsync({
                    numericId: contract._numericId,
                    id,
                    status: 'EXPIRED',
                    updatedInfo,
                });
            },

            // Descarga el .docx del contrato desde el servidor
            downloadContract,

            // Crea un contrato borrador en blanco (POST /api/contracts)
            createNew: () => createContractMutation.mutateAsync(),

            // Fuerza recarga de la lista desde la API
            fetchContracts: () =>
                queryClient.invalidateQueries({ queryKey: ['admin', 'contracts'] }),

            openTemplates,
        },
    };
};