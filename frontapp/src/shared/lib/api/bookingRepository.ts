/**
 * bookingRepository.ts
 *
 * Repositorio de reservas — conecta con Laravel ServiceController (sección bookings).
 * Sigue el mismo patrón que orderRepository.ts y serviceRepository.ts.
 *
 * Ubicación: src/shared/lib/api/bookingRepository.ts
 *
 * Endpoints cubiertos:
 *   POST /api/services/:id/book             → create()      ← cliente reserva
 *   GET  /api/bookings/my                   → myBookings()  ← cliente ve sus reservas
 *   GET  /api/bookings/seller               → sellerBookings() ← vendedor ve las de su tienda
 *   PUT  /api/bookings/:id/cancel           → cancel()
 *   PUT  /api/bookings/:id/confirm          → confirm()     ← vendedor confirma
 *   PUT  /api/bookings/:id/no-show          → markNoShow()  ← vendedor marca no-show
 *   PUT  /api/bookings/:id/notes            → updateNotes() ← vendedor agrega notas
 *   POST /api/bookings/:id/reschedule       → reschedule()
 */

import { LARAVEL_API_URL } from "@/shared/lib/config/flags";
import { getAuthHeaders } from './token-store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show"
  | "on_the_way"
  | "rescheduled";

export type PaymentStatus = "pending" | "paid" | "refunded" | "failed";
export type PaymentMethod =
  | "card"
  | "yape"
  | "plin"
  | "cash"
  | "transfer"
  | "store";

/** Shape que devuelve el backend (ServiceBookingResource) */
export interface BookingResponse {
  id: number;
  service_id: number;
  service_name: string;
  store_id: number;
  store_name: string;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  specialist?: { id: number; name: string };
  // Fecha y hora separados (como los devuelve ServiceBookingResource)
  date: string; // 'YYYY-MM-DD'
  start_time: string; // 'HH:MM'
  end_time: string; // 'HH:MM'
  status: BookingStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_amount: number;
  notes?: string;
  seller_notes?: string;
  reschedule_token?: string;
  no_show_reason?: string;
  is_home_service?: boolean;
  can_cancel?: boolean;
  can_reschedule?: boolean;
  confirmed_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  review?: { rating: number; comment: string | null } | null;
}

/** Payload para crear una reserva — coincide con BookServiceRequest */
export interface CreateBookingInput {
  schedule_id: number;
  appointment_date: string; // 'YYYY-MM-DD HH:MM:SS'
  start_time: string; // 'HH:MM'
  payment_method: PaymentMethod;
  notes?: string;
  specialist_id?: number;
}

/** Payload para reagendar */
export interface RescheduleInput {
  new_datetime: string; // 'YYYY-MM-DD HH:MM:SS'
  token: string;
}

export interface PaginatedBookings {
  data: BookingResponse[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

// ─── Request base ─────────────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 204) return undefined as T;

  const json = await res.json();

  if (!res.ok) {
    const msg = json.message ?? `Error ${res.status}`;
    throw new Error(msg);
  }

  return (json.data ?? json) as T;
}

// ─── API pública del repositorio ──────────────────────────────────────────────

export const bookingRepository = {
  // ── Reservas del cliente ──────────────────────────────────────────────────

  /**
   * Crea una reserva para un servicio.
   * POST /api/services/:serviceId/book
   *
   * El appointment_date combina la fecha + hora elegidas:
   *   appointment_date: '2026-05-20 11:30:00'
   *   start_time: '11:30'
   */
  async create(
    serviceId: number,
    input: CreateBookingInput,
  ): Promise<BookingResponse> {
    return request<BookingResponse>(`/services/${serviceId}/book`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  /**
   * Lista las reservas del usuario autenticado (cliente).
   * GET /api/bookings/my
   */
  async myBookings(perPage = 20): Promise<BookingResponse[]> {
    const result = await request<PaginatedBookings | BookingResponse[]>(
      `/bookings/my?per_page=${perPage}`,
    );
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /**
   * Cancela una reserva (cliente o vendedor).
   * PUT /api/bookings/:id/cancel
   */
  async cancel(id: number): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/cancel`, {
      method: "PUT",
    });
  },

  /**
   * Califica una reserva completada.
   * POST /api/bookings/:id/rate
   */
  async rate(id: number, data: { rating: number; comment?: string }): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`${LARAVEL_API_URL}/bookings/${id}/rate`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? 'Error al calificar');
    return json;
  },

  /**
   * Reagenda una reserva usando el token de reagendamiento.
   * POST /api/bookings/:id/reschedule
   */
  async reschedule(
    id: number,
    input: RescheduleInput,
  ): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/reschedule`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  // ── Reservas del vendedor ─────────────────────────────────────────────────

  /**
   * Lista las reservas de la tienda del vendedor autenticado.
   * GET /api/bookings/seller
   */
  async sellerBookings(
    status?: BookingStatus,
    perPage = 20,
  ): Promise<BookingResponse[]> {
    const params = new URLSearchParams({ per_page: String(perPage) });
    if (status) params.set("status", status);
    const result = await request<PaginatedBookings | BookingResponse[]>(
      `/bookings/seller?${params}`,
    );
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /**
   * Confirma una reserva pendiente.
   * PUT /api/bookings/:id/confirm
   */
  async confirm(id: number): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/confirm`, {
      method: "PUT",
    });
  },

  /**
   * Marca una reserva confirmada como no-show.
   * PUT /api/bookings/:id/no-show
   */
  async markNoShow(id: number, reason?: string): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/no-show`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Marca una reserva como completada (seller).
   * PUT /api/bookings/:id/complete
   */
  async complete(id: number): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/complete`, {
      method: "PUT",
    });
  },

  /**
   * Marca una reserva confirmada como "en camino" (seller, solo domicilio).
   * PUT /api/bookings/:id/on-the-way
   */
  async markOnTheWay(id: number): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/on-the-way`, {
      method: "PUT",
    });
  },

  /**
   * Cliente confirma que recibió la atención.
   * PUT /api/bookings/:id/confirm-completion
   */
  async confirmCompletion(id: number): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/confirm-completion`, {
      method: "PUT",
    });
  },

  /**
   * Agrega notas del vendedor a una reserva.
   * PUT /api/bookings/:id/notes
   */
  async updateNotes(id: number, notes: string): Promise<BookingResponse> {
    return request<BookingResponse>(`/bookings/${id}/notes`, {
      method: "PUT",
      body: JSON.stringify({ notes }),
    });
  },
};

// ─── Helper: construir appointment_date desde fecha + hora ──────────────────
/**
 * Combina una fecha 'YYYY-MM-DD' y una hora 'HH:MM' en el formato
 * que acepta el backend: 'YYYY-MM-DD HH:MM:00'
 */
export function buildAppointmentDate(date: string, time: string): string {
  return `${date} ${time}:00`;
}
