import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ScanApiResponse } from '@/features/admin/operations/types/scan';
import {
  Supplier,
  SupplierFilters,
  StoreSupplierPayload,
  UpdateSupplierPayload,
  Expense,
  ExpenseStats,
  ExpenseFilters,
  StoreExpensePayload,
  UpdateExpensePayload,
  OperationalRole,
  StoreOperationalRolePayload,
  UpdateOperationalRolePayload,
  AuditLog,
  AuditLogFilters,
  OperationsStats,
  PaginatedResponse,
} from '@/features/admin/operations/types/operations';
import type {
  ScanFileResponse,
  ScanBatchStorePayload,
  ScanBatchStoreResponse,
} from '@/features/admin/operations/types/scan';

// ─── Helpers de autenticación ─────────────────────────────────────────────────

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) {
    return _tokenCache.value;
  }
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

// ─── Request base ─────────────────────────────────────────────────────────────

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...((init.headers as Record<string, string>) ?? {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${LARAVEL_API_URL}${path}`, {
    ...init,
    headers,
  });

  // 🛡️ Extraemos correctamente los errores de validación de Laravel
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    let errorMsg = body.message ?? `HTTP Error ${res.status}`;

    // Si Laravel envía detalles de validación (422), los concatenamos
    if (body.errors) {
      const detailedErrors = Object.values(body.errors).flat().join('\n- ');
      errorMsg = `${errorMsg}\n\nDetalles:\n- ${detailedErrors}`;
    }

    throw new Error(errorMsg);
  }

  // Soporte para respuestas exitosas sin contenido (204 No Content)
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

function buildQuery(params: Record<string, unknown>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join('&');
  return q ? `?${q}` : '';
}

// ─── Operations Dashboard ────────────────────────────────────────────────────

export const operationsRepository = {
  getStats(): Promise<OperationsStats> {
    return request('/operations/stats');
  },
};

// ─── Suppliers ───────────────────────────────────────────────────────────────

export const supplierRepository = {
  list(filters: SupplierFilters = {}): Promise<PaginatedResponse<Supplier>> {
    return request(
      `/suppliers${buildQuery(filters as Record<string, unknown>)}`,
    );
  },

  get(id: number): Promise<Supplier> {
    return request(`/suppliers/${id}`);
  },

  create(payload: StoreSupplierPayload): Promise<Supplier> {
    return request('/suppliers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: UpdateSupplierPayload): Promise<Supplier> {
    return request(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  delete(id: number): Promise<{ success: boolean }> {
    return request(`/expenses/${id}`, { method: 'DELETE' });
  },

  async scan(file: File, password?: string): Promise<ScanFileResponse> {
    const token = await getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${LARAVEL_API_URL}/expenses/scan`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? `Error HTTP ${res.status} al escanear`);
    }

    return res.json();
  },

  async scanBatchStore(
    payload: ScanBatchStorePayload,
  ): Promise<ScanBatchStoreResponse> {
    return request('/expenses/scan/batch-store', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ─── Expenses ────────────────────────────────────────────────────────────────

export const expenseRepository = {
  list(filters: ExpenseFilters = {}): Promise<PaginatedResponse<Expense>> {
    return request(
      `/expenses${buildQuery(filters as Record<string, unknown>)}`,
    );
  },

  stats(): Promise<ExpenseStats> {
    return request('/expenses/stats');
  },

  get(id: number): Promise<Expense> {
    return request(`/expenses/${id}`);
  },

  create(payload: StoreExpensePayload): Promise<Expense> {
    return request('/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(id: number, payload: UpdateExpensePayload): Promise<Expense> {
    return request(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  delete(id: number): Promise<{ success: boolean }> {
    return request(`/expenses/${id}`, { method: 'DELETE' });
  },

  scan: async (file: File, password?: string): Promise<ScanFileResponse> => {
    const token = await getAuthToken();
    const baseUrl = LARAVEL_API_URL.endsWith('/')
      ? LARAVEL_API_URL.slice(0, -1)
      : LARAVEL_API_URL;
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }
    const res = await fetch(`${baseUrl}/expenses/scan`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? err.message ?? `Error ${res.status}`);
    }
    return res.json();
  },

  scanBatchStore(payload: ScanBatchStorePayload): Promise<ScanBatchStoreResponse> {
    return request('/expenses/scan/batch-store', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ─── Operational Roles ───────────────────────────────────────────────────────

export const operationalRoleRepository = {
  list(active?: boolean): Promise<OperationalRole[]> {
    const q = active !== undefined ? `?active=${active}` : '';
    return request(`/operational-roles${q}`);
  },

  get(id: number): Promise<OperationalRole> {
    return request(`/operational-roles/${id}`);
  },

  create(payload: StoreOperationalRolePayload): Promise<OperationalRole> {
    return request('/operational-roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  update(
    id: number,
    payload: UpdateOperationalRolePayload,
  ): Promise<OperationalRole> {
    return request(`/operational-roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  toggle(id: number): Promise<OperationalRole> {
    return request(`/operational-roles/${id}/toggle`, { method: 'PUT' });
  },

  assignUser(roleId: number, userId: number): Promise<OperationalRole> {
    return request(`/operational-roles/${roleId}/users`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  removeUser(roleId: number, userId: number): Promise<{ success: boolean }> {
    return request(`/operational-roles/${roleId}/users/${userId}`, {
      method: 'DELETE',
    });
  },

  delete(id: number): Promise<{ success: boolean }> {
    return request(`/operational-roles/${id}`, { method: 'DELETE' });
  },
};

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export const auditLogRepository = {
  list(filters: AuditLogFilters = {}): Promise<PaginatedResponse<AuditLog>> {
    return request(
      `/audit-logs${buildQuery(filters as Record<string, unknown>)}`,
    );
  },

  modules(): Promise<string[]> {
    return request('/audit-logs/modules');
  },

  get(id: number): Promise<AuditLog> {
    return request(`/audit-logs/${id}`);
  },
};
