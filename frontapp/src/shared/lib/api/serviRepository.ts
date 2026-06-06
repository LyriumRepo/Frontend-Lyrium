/**
 * serviceRepository.ts — v4 (Corregido para API Real)
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Helper: session ID for cart_token ────────────────────────────────────────

function getCartToken(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem('cart_session_id');
  if (!sid) {
    sid = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('cart_session_id', sid);
  }
  return sid;
}

// ─── Service Hold types ───────────────────────────────────────────────────────

export interface ServiceHold {
  id: number;
  service_id: number;
  service_name: string;
  service_price: number;
  service_image: string | null;
  specialist_id: number;
  specialist_name: string;
  schedule_id: number | null;
  appointment_date: string;
  start_time: string;
  customer_notes: string | null;
  service_address: string | null;
  expires_at: string;
  seconds_remaining: number;
}

export interface AddServiceHoldPayload {
  service_id: number;
  specialist_id: number;
  schedule_id?: number | null;
  appointment_date: string;
  start_time: string;
  customer_notes?: string | null;
  cart_token: string;
  service_address?: string | null;
}

// ─── Tipos de Dominio ─────────────────────────────────────────────────────────

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface ServiceSchedule {
  id: number;
  service_id: number;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  orden_bloque: number;
  max_appointments: number;
  is_active: boolean;
}

export interface ServiceSpecialist {
  id: number;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
  especialidad: string;
  sub_especialidad: string | null;
  anios_experiencia: number | null;
  foto: string | null;
  availability: 'Disponible' | 'Indispuesto' | 'Ocupado';
  schedules: ServiceSchedule[];
}

export interface Service {
  id: number;
  store_id: number;
  store_name: string;
  store_logo: string | null;
  name: string;
  slug: string;
  description: string;
  benefits?: string;
  duration_minutes: number;
  buffer_minutes: number;
  price: number;
  currency: string;
  category: string;
  category_id: number;
  parent_category_id: number | null;
  image: string | null;
  sticker?: string | null;
  discount_percentage?: number | null;
  settings?: Record<string, unknown> | null;
  status: 'active' | 'inactive' | 'draft';
  cancellation_policy: 'flexible' | 'strict' | 'no_refund';
  cancellation_hours: number;
  requires_payment: boolean;
  is_virtual: boolean;
  meeting_link: string | null;
  max_bookings_per_slot: number;
  is_home_service: boolean;
  booking_advance_hours: number;
  max_capacity: number;
  schedule: Array<{
    id: number;
    specialist_id: number | null;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_available: boolean;
    max_appointments: number;
  }>;
  specialists: ServiceSpecialist[];
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: number;
  parent: number; // 👈 CORREGIDO: Viene 'parent' en lugar de 'parent_id'
  name: string;
  slug: string;
  description?: string;
  image?: { src: string } | null; // 👈 CORREGIDO: Viene como objeto { src: string }
  type?: string;
}

// ─── Respuestas del Backend ───────────────────────────────────────────────────

export interface ServicesResponse {
  data: Service[];
}

export interface CategoriesResponse {
  success: boolean;
  data: ServiceCategory[];
}

export interface SlotsResponse {
  success: boolean;
  date: string;
  slots: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const DAY_ORDER: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

// ─── Fetch genérico simplificado para propósitos públicos ────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${LARAVEL_API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? `HTTP ${res.status}`);
  }

  return res.json();
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '')
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    )
    .join('&');
  return q ? `?${q}` : '';
}

// ─── Repositorio ──────────────────────────────────────────────────────────────

export const serviceRepository = {
  /** GET /services?category_slug=&per_page= */
  async getByCategory(categorySlug: string, perPage = 50): Promise<Service[]> {
    try {
      const q = toQuery({ category_slug: categorySlug, per_page: perPage });
      const res = await apiFetch<ServicesResponse>(`/services${q}`, {
        next: { revalidate: 30 },
      });
      return res.data ?? [];
    } catch {
      return [];
    }
  },

  /** GET /services/{id} */
  async getById(id: number): Promise<Service | null> {
    try {
      return await apiFetch<Service>(`/services/${id}`, {
        next: { revalidate: 30 },
      });
    } catch {
      return null;
    }
  },

  /** GET /services/slug/{slug} */
  async getBySlug(slug: string): Promise<Service | null> {
    try {
      return await apiFetch<Service>(`/services/slug/${slug}`, {
        cache: 'no-store',
      });
    } catch {
      return null;
    }
  },

  /** GET /services/{serviceId}/slots?specialist_id=&appointment_date= */
  async getSlots(
    serviceId: number,
    specialistId: number,
    date: string,
  ): Promise<string[]> {
    try {
      const q = toQuery({
        specialist_id: specialistId,
        appointment_date: date,
      });
      const res = await apiFetch<SlotsResponse>(
        `/services/${serviceId}/slots${q}`,
        {
          cache: 'no-store',
        },
      );
      return res.slots ?? [];
    } catch {
      return [];
    }
  },

  /** * GET /categories?type=service&per_page=100
   * FIX 2: Categorías raíz usan parent === 0 en tu base de datos
   */
  async getCategories(): Promise<ServiceCategory[]> {
    try {
      const q = toQuery({ type: 'service', per_page: 100 });
      const res = await apiFetch<CategoriesResponse>(`/categories${q}`, {
        next: { revalidate: 60 },
      });
      const all = res.data ?? [];
      return all.filter((c) => c.parent === 0); // 👈 CORREGIDO: Filtrado por 0 en vez de null
    } catch {
      return [];
    }
  },

  /** * FIX 1: Busca por slug exacto localmente
   */
  async getCategoryBySlug(slug: string): Promise<ServiceCategory | null> {
    try {
      const q = toQuery({ type: 'service', per_page: 100 });
      const res = await apiFetch<CategoriesResponse>(`/categories${q}`, {
        next: { revalidate: 60 },
      });
      const items = res.data ?? [];
      return items.find((c) => c.slug === slug) ?? null;
    } catch {
      return null;
    }
  },

  // ── Service Hold API ────────────────────────────────────────────────────

  async addServiceToCart(
    payload: AddServiceHoldPayload,
  ): Promise<{ hold: ServiceHold }> {
    return apiFetch('/cart/add-service', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async getServiceHolds(
    cartToken: string,
  ): Promise<{ holds: ServiceHold[] }> {
    const q = toQuery({ cart_token: cartToken });
    return apiFetch(`/cart/service-holds${q}`, {
      cache: 'no-store',
    });
  },

  async removeServiceHold(
    holdId: number,
    cartToken: string,
  ): Promise<{ success: boolean }> {
    const q = toQuery({ cart_token: cartToken });
    return apiFetch(`/cart/service-holds/${holdId}${q}`, {
      method: 'DELETE',
    });
  },

  async updateServiceHold(
    holdId: number,
    payload: { cart_token: string; service_address: string },
  ): Promise<{ hold: { id: number; service_address: string } }> {
    return apiFetch(`/cart/service-holds/${holdId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
