/**
 * serviceRepository.ts
 *
 * Repositorio de servicios — conecta con Laravel ServiceController.
 * Sigue el mismo patrón que orderRepository.ts y cartRepository.ts.
 *
 * Ubicación: src/shared/lib/api/serviceRepository.ts
 *
 * Endpoints cubiertos:
 *   GET    /api/services/me                  → list()
 *   GET    /api/services/:id                 → getById()
 *   POST   /api/services                     → create()
 *   PUT    /api/services/:id                 → update()
 *   DELETE /api/services/:id                 → remove()
 *   GET    /api/services/:id/slots?date=...  → getSlots()
 *
 * Transformación Frontend → Backend:
 *   El ServiceConfigModal del vendedor usa campos en español (denominacion,
 *   diasAtencion, cupos, etc.). Este repositorio expone CreateServiceInput
 *   en inglés (igual al shape que acepta el backend) y provee la función
 *   helper `mapFormToInput` para convertir el form del modal al payload correcto.
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type { ApiResponse } from '@/shared/lib/api/base-client';

// ─── Tipos de respuesta del backend ──────────────────────────────────────────

export type ServiceStatus = 'active' | 'inactive' | 'draft';
export type CancellationPolicy = 'flexible' | 'strict' | 'no_refund';

export interface ServiceScheduleResponse {
  id: number;
  day_of_week: number; // 0=lun … 6=dom (como lo devuelve ServiceResource)
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  is_available: boolean;
  max_appointments: number;
}

export interface ServiceResponse {
  id: number;
  store_id: number;
  store_name: string;
  name: string;
  slug: string;
  description: string;
  duration_minutes: number;
  price: number;
  currency: string;
  category: string;
  image?: string | null;
  status: ServiceStatus;
  cancellation_policy: CancellationPolicy;
  cancellation_hours: number;
  requires_payment: boolean;
  is_virtual: boolean;
  meeting_link?: string | null;
  max_bookings_per_slot: number;
  schedule: ServiceScheduleResponse[];
  created_at: string;
  updated_at: string;
}

export interface ServiceSlot {
  date: string;
  time: string;
  available: boolean;
  remaining_slots: number;
}

// ─── Tipos de entrada (payload al backend) ────────────────────────────────────

export interface ScheduleInput {
  day_of_week:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  max_appointments: number;
  is_active: boolean;
}

export interface CreateServiceInput {
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  status?: ServiceStatus;
  cancellation_policy?: CancellationPolicy;
  max_cancellations?: number;
  category_id?: number | null;
  // Campos del frontend (paso 1 del modal)
  buffer_minutes?: number;
  is_home_service?: boolean;
  booking_advance_hours?: number;
  max_capacity?: number;
  specialist_ids?: number[];
  // Horarios
  schedules?: ScheduleInput[];
}

export type UpdateServiceInput = Partial<CreateServiceInput> & {
  status?: ServiceStatus;
};

// ─── Paginación ───────────────────────────────────────────────────────────────

export interface PaginatedServices {
  data: ServiceResponse[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ─── Helper: Auth headers ─────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<HeadersInit> {
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const res = await fetch('/api/auth-token');
    if (res.ok) {
      const { token } = await res.json();
      if (token) base['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    /* sin token — continúa sin auth */
  }

  return base;
}

// ─── Request base ─────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok) {
    const msg =
      (json as unknown as { message?: string }).message ??
      `Error ${res.status}`;
    throw new Error(msg);
  }

  return (json.data ?? json) as T;
}

// ─── Mapa de días: frontend (español) → backend (inglés) ────────────────────

const DAY_MAP: Record<string, ScheduleInput['day_of_week']> = {
  // Nombres completos en español
  Lunes: 'monday',
  Martes: 'tuesday',
  Miércoles: 'wednesday',
  Miercoles: 'wednesday',
  Jueves: 'thursday',
  Viernes: 'friday',
  Sábado: 'saturday',
  Sabado: 'saturday',
  Domingo: 'sunday',
  // Abreviaciones del modal
  LUN: 'monday',
  MAR: 'tuesday',
  MIÉ: 'wednesday',
  MIE: 'wednesday',
  JUE: 'thursday',
  VIE: 'friday',
  SÁB: 'saturday',
  SAB: 'saturday',
  DOM: 'sunday',
  // Por si el frontend ya manda en inglés
  monday: 'monday',
  tuesday: 'tuesday',
  wednesday: 'wednesday',
  thursday: 'thursday',
  friday: 'friday',
  saturday: 'saturday',
  sunday: 'sunday',
};

/**
 * Convierte el form del ServiceConfigModal al payload que acepta el backend.
 *
 * El modal guarda los datos así:
 * {
 *   denominacion: string,
 *   categoria: string,        ← nombre de categoría, no ID
 *   duracion: number,
 *   diasAtencion: AttendanceDay[],
 *   cupos: number,
 *   precio: number,
 *   estado: 'borrador' | 'publicado',
 *   domicilio: boolean,
 *   anticipacionReserva: 24 | 48 | 72,
 *   bufferMinutos: number,
 *   especialistasAsignados: number[],
 * }
 *
 * El backend espera CreateServiceInput (campos en inglés).
 * category_id no se puede resolver aquí sin hacer un lookup — pásalo por separado.
 */
export function mapFormToInput(
  form: {
    denominacion: string;
    descripcion?: string;
    categoria?: string;
    duracion: number;
    diasAtencion: Array<{
      dia: string;
      bloques: Array<{ inicio: string; fin: string }>;
    }>;
    cupos: number;
    precio: number;
    estado: 'borrador' | 'publicado';
    domicilio: boolean;
    anticipacionReserva: number;
    bufferMinutos?: number;
    especialistasAsignados?: number[];
  },
  categoryId?: number | null,
): CreateServiceInput {
  // Cada día puede tener varios bloques horarios → un schedule por bloque
  const schedules: ScheduleInput[] = form.diasAtencion.flatMap((dayEntry) =>
    dayEntry.bloques.map((block) => ({
      day_of_week: DAY_MAP[dayEntry.dia] ?? 'monday',
      start_time: block.inicio,
      end_time: block.fin,
      max_appointments: form.cupos,
      is_active: true,
    })),
  );

  return {
    name: form.denominacion,
    description: form.descripcion ?? '',
    price: form.precio,
    duration_minutes: form.duracion,
    status: form.estado === 'publicado' ? 'active' : 'inactive',
    cancellation_policy: 'flexible',
    category_id: categoryId ?? null,
    buffer_minutes: form.bufferMinutos ?? 0,
    is_home_service: form.domicilio,
    booking_advance_hours: form.anticipacionReserva,
    max_capacity: form.cupos,
    specialist_ids: form.especialistasAsignados ?? [],
    schedules,
  };
}

// ─── API pública del repositorio ──────────────────────────────────────────────

export const serviceRepository = {
  /**
   * Lista los servicios de la tienda autenticada.
   * GET /api/services/me
   */
  async list(perPage = 50): Promise<ServiceResponse[]> {
    const paginated = await request<PaginatedServices>(
      `/services/me?per_page=${perPage}`,
    );
    // Si el backend devuelve paginado, extraer data; si devuelve array, devolver directo
    return Array.isArray(paginated) ? paginated : (paginated.data ?? []);
  },

  /**
   * Obtiene un servicio por ID.
   * GET /api/services/:id
   */
  async getById(id: number): Promise<ServiceResponse | null> {
    try {
      return await request<ServiceResponse>(`/services/${id}`);
    } catch {
      return null;
    }
  },

  /**
   * Obtiene los slots disponibles para una fecha.
   * GET /api/services/:id/slots?date=YYYY-MM-DD
   */
  async getSlots(id: number, date: string): Promise<string[]> {
    const result = await request<{ data: string[] } | string[]>(
      `/services/${id}/slots?date=${date}`,
    );
    return Array.isArray(result)
      ? result
      : ((result as { data: string[] }).data ?? []);
  },

  /**
   * Crea un nuevo servicio.
   * POST /api/services
   */
  async create(input: CreateServiceInput): Promise<ServiceResponse> {
    return request<ServiceResponse>('/services', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Actualiza un servicio existente.
   * PUT /api/services/:id
   */
  async update(
    id: number,
    input: UpdateServiceInput,
  ): Promise<ServiceResponse> {
    return request<ServiceResponse>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Elimina un servicio.
   * DELETE /api/services/:id
   */
  async remove(id: number): Promise<void> {
    await request<void>(`/services/${id}`, { method: 'DELETE' });
  },

  /**
   * Cambia el estado activo/inactivo del servicio.
   * Atajos para publicar/despublicar desde el panel.
   */
  async publish(id: number): Promise<ServiceResponse> {
    return serviceRepository.update(id, { status: 'active' });
  },

  async unpublish(id: number): Promise<ServiceResponse> {
    return serviceRepository.update(id, { status: 'inactive' });
  },
};
