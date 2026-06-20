// ─── Supplier ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  nombre: string; // backend: "nombre" (se mapea con el input del front)
  slug: string;
  ruc: string | null;
  tipo: string; // backend: "tipo" (antes .type)
  especialidad: string | null;
  estado: 'Activo' | 'Suspendido' | 'Inactivo' | 'En Pausa'; // backend: "estado" (antes .status)
  fechaRenovacion: string | null; // backend: camelCase "fechaRenovacion" (antes .fecha_renovacion)
  proyectos: string[] | null;
  certificaciones: string[] | null;
  created_at: string;
}

export interface SupplierFilters {
  search?: string;
  status?: string; // Corresponde al filtro visual de "estado"
  type?: string; // Corresponde al filtro visual de "tipo"
  per_page?: number;
  page?: number;
}

export interface StoreSupplierPayload {
  name: string; // backend: espera "name" para crear o actualizar
  ruc?: string | null;
  tipo?: string; // backend: "tipo"
  especialidad?: string | null;
  fechaRenovacion?: string | null; // backend: "fechaRenovacion"
  proyectos?: string[] | null;
  certificaciones?: string[] | null;
}

export interface UpdateSupplierPayload extends Partial<StoreSupplierPayload> {
  estado?: string; // backend: "estado"
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export interface Expense {
  id: number;
  receipt_number: string;
  concept: string;
  amount: number;
  status: 'Pagado' | 'Pendiente' | 'Anulado';
  issued_at: string;
  paid_at: string | null;
  voucher_type: string | null;
  voucher_number: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  supplier: {
    id: number;
    name: string;
    especialidad: string | null;
    type: string;
  } | null;
  registered_by: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface ExpenseStats {
  total_invertido: number;
  total_pagado: number;
  total_pendiente: number;
  total_recibos: number;
  recibos_pendientes: number;
}

export interface ExpenseFilters {
  search?: string;
  status?: 'Pagado' | 'Pendiente' | 'Anulado';
  voucher_type?: string;
  supplier_id?: number;
  from?: string;
  to?: string;
  per_page?: number;
  page?: number;
}

export interface StoreExpensePayload {
  supplier_id: number;
  concept: string;
  amount: number;
  status?: 'Pagado' | 'Pendiente' | 'Anulado';
  issued_at: string;
  paid_at?: string | null;
  voucher_type?: string | null;
  voucher_number?: string | null;
  file_url?: string | null;
  notes?: string | null;
}

export type UpdateExpensePayload = Partial<StoreExpensePayload>;

// ─── Operational Role ─────────────────────────────────────────────────────────

export interface OperationalRole {
  id: number;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  modules: string[];
  requires_2fa: boolean;
  users_count: number;
  created_at: string;
}

export interface StoreOperationalRolePayload {
  name: string;
  code: string;
  description?: string | null;
  is_active?: boolean;
  modules?: string[];
  requires_2fa?: boolean;
}

export type UpdateOperationalRolePayload = Partial<StoreOperationalRolePayload>;

// ─── Audit Log ────────────────────────────────────────────────────────────────

export interface AuditLog {
  id: number;
  event: string;
  module: string;
  description: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  actor: {
    id: number | null;
    email: string | null;
    role: string | null;
  };
  auditable: {
    type: string;
    id: number;
  } | null;
}

export interface AuditLogFilters {
  module?: string;
  event?: string;
  user_id?: number;
  from?: string;
  to?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

// ─── Operations Dashboard ────────────────────────────────────────────────────

export interface OperationalKPI {
  label: string;
  val: string | number;
  icon: string;
  color: string;
}

export interface OperationsStats {
  inversion_total: number;
  proveedores_activos: number;
  proveedores_suspendidos: number;
  recibos_pendientes: number;
}

// ─── Shared pagination ───────────────────────────────────────────────────────

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface OperationalKPI {
  label: string;
  val: string | number;
  icon: string;
  color: string;
}
