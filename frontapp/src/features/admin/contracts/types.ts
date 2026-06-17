// ─────────────────────────────────────────────────────────────────────────────
// types.ts — Módulo Contratos (admin)
//
// Los valores de ContractStatus y ContractModality usan MAYÚSCULAS en el
// frontend para consistencia con el resto del panel admin. El hook useContratos
// se encarga de mapear los valores snake_case/minúsculas que llegan del API.
// ─────────────────────────────────────────────────────────────────────────────

// Valores exactos que devuelve el campo `status` en la tabla contracts
// (se mapean a MAYÚSCULAS en el hook antes de llegar a los componentes)
export type ContractStatus = 'ACTIVE' | 'PENDING' | 'EXPIRED';

// Planes reales del marketplace (Anexo N°1 del acuerdo)
export type ContractModality = 'emprende' | 'crece' | 'especial' | 'estandar';

export type ExpiryUrgency = 'normal' | 'warning' | 'critical';

export interface AuditEvent {
    timestamp: string;
    action: string;
    user: string;
}

export interface Contract {
    // _numericId: ID numérico real de la BD (para URLs de API: /contracts/{id})
    // Se usa internamente en el hook — los componentes no deben depender de él.
    _numericId: number;

    // id: Número de contrato legible (ej. "LYRIUM-2025-0001") — se muestra al admin
    id: string;

    company:      string;          // Nombre comercial del SELLER
    ruc:          string;          // RUC del SELLER
    rep:          string;          // Representante/Contacto del SELLER
    type:         string;          // "comercial"
    modality:     ContractModality; // emprende | crece | especial | estandar
    status:       ContractStatus;  // ACTIVE | PENDING | EXPIRED
    start:        string;          // Fecha de inicio (YYYY-MM-DD)
    end:          string;          // Fecha de fin   (YYYY-MM-DD)
    storage_path: string;          // Ruta del .docx en storage (file_path del API)

    // Campos opcionales / enriquecidos
    store_id?:         number | null;
    signed_file_path?: string | null;
    notes?:            string | null;
    created_at?:       string;

    // Calculado en el frontend por useContratos
    expiryUrgency?: ExpiryUrgency;

    // Trazabilidad de cambios de estado (se llena localmente tras cada mutación)
    auditTrail?: AuditEvent[];
}

export interface ContractFilters {
    query:     string;
    modality:  ContractModality | 'ALL';
    status:    ContractStatus   | 'ALL';
    dateType:  'SIGNATURE' | 'EXPIRY';
    dateLimit: string;
}

export interface ContractKPI {
    label: string;
    val:   number | string;
    color: string;
    icon:  string;
}

// ── Forma del body para actualizar estado vía API ─────────────────────────────
export interface UpdateContractStatusPayload {
    status: ContractStatus; // ACTIVE | PENDING | EXPIRED — exacto, en mayúsculas
}

// ── Forma de los KPIs ya calculados por el backend (sobre toda la tabla,
//    no solo la página actual) ──────────────────────────────────────────────
export interface ApiContractKpis {
    total:   number;
    active:  number;
    pending: number;
    expired: number;
}