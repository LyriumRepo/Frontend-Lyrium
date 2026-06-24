import { getToken } from './token-store';
import {
  Service,
  Specialist,
  Appointment,
} from '@/features/seller/services/types';
import {
  adaptServiceToFrontend,
  adaptServiceToBackend,
  adaptSpecialistToFrontend,
  adaptSpecialistToBackend,
  adaptAppointmentToFrontend,
  LaravelService,
  LaravelSpecialist,
  LaravelBooking,
} from '@/features/seller/services/utils/serviceAdapter';

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

/**
 * Obtiene las cabeceras de autenticación desde /api/auth-token
 * (lee la cookie HttpOnly laravel_token en el servidor y devuelve el Bearer)
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  try {
    const res = await fetch('/api/auth-token');
    if (res.ok) {
      const { token } = await res.json();
      if (token) {
        base['Authorization'] = `Bearer ${token}`;
        return base;
      }
    }
  } catch {
    // /api/auth-token no respondió — continúa al fallback
  }

  // Fallback: leer token de localStorage / cookie (getToken ya importado)
  const localToken = getToken();
  if (localToken) base['Authorization'] = `Bearer ${localToken}`;

  return base;
}

interface ServiceListResponse {
  data?: LaravelService[];
}

interface SpecialistListResponse {
  specialists?: LaravelSpecialist[];
  data?: LaravelSpecialist[];
}

interface BookingListResponse {
  bookings?: LaravelBooking[];
  data?: LaravelBooking[];
}

export const serviceRepository = {
  // ── SERVICES ENDPOINTS ──────────────────────────────────────────────────────

  async listServices(): Promise<Service[]> {
    const response = await fetch(`${LARAVEL_API_URL}/seller/services`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok)
      throw new Error('No se pudo cargar la lista de servicios');
    const data = (await response.json()) as
      | ServiceListResponse
      | LaravelService[];

    const rawServices = Array.isArray(data) ? data : data.data || [];
    return rawServices.map((s: LaravelService) => adaptServiceToFrontend(s));
  },

  async createService(serviceData: Partial<Service>): Promise<Service> {
    const backendPayload = adaptServiceToBackend(serviceData);
    const response = await fetch(`${LARAVEL_API_URL}/services`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(err.message || 'Error al crear el servicio');
    }

    const data = (await response.json()) as
      | LaravelService
      | { service: LaravelService };
    const rawService = 'service' in data ? data.service : data;
    return adaptServiceToFrontend(rawService);
  },

  async updateService(
    id: number,
    serviceData: Partial<Service>,
  ): Promise<Service> {
    const backendPayload = adaptServiceToBackend(serviceData);
    const response = await fetch(`${LARAVEL_API_URL}/services/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(err.message || 'Error al actualizar el servicio');
    }

    const data = (await response.json()) as
      | LaravelService
      | { service: LaravelService };
    const rawService = 'service' in data ? data.service : data;
    return adaptServiceToFrontend(rawService);
  },

  async deleteService(id: number): Promise<void> {
    const response = await fetch(`${LARAVEL_API_URL}/services/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('No se pudo eliminar el servicio');
  },

  // ── SPECIALISTS ENDPOINTS ───────────────────────────────────────────────────

  async listSpecialists(): Promise<Specialist[]> {
    const response = await fetch(`${LARAVEL_API_URL}/stores/me/specialists`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok)
      throw new Error('No se pudo cargar la lista de especialistas');
    const data = (await response.json()) as
      | SpecialistListResponse
      | LaravelSpecialist[];

    let rawSpecs: LaravelSpecialist[] = [];
    if (Array.isArray(data)) {
      rawSpecs = data;
    } else {
      rawSpecs = data.specialists || data.data || [];
    }

    return rawSpecs.map((sp: LaravelSpecialist) =>
      adaptSpecialistToFrontend(sp),
    );
  },

  async createSpecialist(specData: Partial<Specialist>): Promise<Specialist> {
    const backendPayload = adaptSpecialistToBackend(specData);
    const response = await fetch(`${LARAVEL_API_URL}/stores/me/specialists`, {
      method: 'POST',
      headers: await getAuthHeaders(),
      body: JSON.stringify(backendPayload),
    });

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(err.message || 'Error al registrar especialista');
    }

    const data = (await response.json()) as
      | LaravelSpecialist
      | { specialist: LaravelSpecialist };
    const rawSpec = 'specialist' in data ? data.specialist : data;
    return adaptSpecialistToFrontend(rawSpec);
  },

  async updateSpecialist(
    id: number,
    specData: Partial<Specialist>,
  ): Promise<Specialist> {
    const backendPayload = adaptSpecialistToBackend(specData);
    delete backendPayload.email;
    delete backendPayload.document_number;
    delete backendPayload.document_type;
    const response = await fetch(
      `${LARAVEL_API_URL}/stores/me/specialists/${id}`,
      {
        method: 'PUT',
        headers: await getAuthHeaders(),
        body: JSON.stringify(backendPayload),
      },
    );

    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      throw new Error(err.message || 'Error al actualizar especialista');
    }

    const data = (await response.json()) as
      | LaravelSpecialist
      | { specialist: LaravelSpecialist };
    const rawSpec = 'specialist' in data ? data.specialist : data;
    return adaptSpecialistToFrontend(rawSpec);
  },

  async deleteSpecialist(id: number): Promise<void> {
    const response = await fetch(
      `${LARAVEL_API_URL}/stores/me/specialists/${id}`,
      {
        method: 'DELETE',
        headers: await getAuthHeaders(),
      },
    );

    if (!response.ok) throw new Error('No se pudo dar de baja al especialista');
  },

  // ── BOOKINGS ENDPOINTS ──────────────────────────────────────────────────────

  async listAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${LARAVEL_API_URL}/bookings/seller`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });

    if (!response.ok) throw new Error('No se pudo cargar la agenda operativa');
    const data = (await response.json()) as
      | BookingListResponse
      | LaravelBooking[];

    let rawBookings: LaravelBooking[] = [];
    if (Array.isArray(data)) {
      rawBookings = data;
    } else {
      rawBookings = data.bookings || data.data || [];
    }

    return rawBookings.map((b: LaravelBooking) =>
      adaptAppointmentToFrontend(b),
    );
  },

  async rescheduleAppointment(
    appointmentId: number,
    newDate: string,
    newStartTime: string,
    newEndTime: string,
    token: string,
  ): Promise<void> {
    const response = await fetch(
      `${LARAVEL_API_URL}/bookings/${appointmentId}/reschedule`,
      {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          date: newDate,
          start_time: newStartTime,
          end_time: newEndTime,
          token,
        }),
      },
    );

    if (!response.ok)
      throw new Error('No se pudo reprogramar la cita');
  },

  async getServiceById(id: number): Promise<Service | null> {
    try {
      const response = await fetch(`${LARAVEL_API_URL}/seller/services/${id}`, {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      if (!response.ok) return null;
      const data = await response.json();
      const rawService: LaravelService = data.data || data;
      return adaptServiceToFrontend(rawService);
    } catch {
      return null;
    }
  },

  async publishService(id: number, publish: boolean): Promise<Service> {
    const response = await fetch(`${LARAVEL_API_URL}/services/${id}`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ status: publish ? 'active' : 'inactive' }),
    });
    if (!response.ok) {
      const err = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message || 'Error al cambiar estado del servicio');
    }
    const data = (await response.json()) as LaravelService | { service: LaravelService };
    const rawService = 'service' in data ? data.service : data;
    return adaptServiceToFrontend(rawService);
  },

  async uploadServiceImage(id: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(
      `${LARAVEL_API_URL}/services/${id}/media`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: (await getAuthHeaders())['Authorization'] ?? '',
        },
        body: formData,
      },
    );
    if (!response.ok) throw new Error('Error al subir la imagen');
    const data = await response.json();
    return data.url ?? data.data?.url ?? '';
  },

  async cancelAppointment(id: number): Promise<void> {
    const response = await fetch(`${LARAVEL_API_URL}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('No se pudo cancelar la cita');
  },

  async confirmAppointment(id: number): Promise<void> {
    const response = await fetch(`${LARAVEL_API_URL}/bookings/${id}/confirm`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
    });
    if (!response.ok) throw new Error('No se pudo confirmar la cita');
  },

  async markNoShowAppointment(id: number, reason?: string): Promise<void> {
    const response = await fetch(`${LARAVEL_API_URL}/bookings/${id}/no-show`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('No se pudo marcar como no-show');
  },

  async updateServiceNotes(id: number, notes: string): Promise<void> {
    const response = await fetch(`${LARAVEL_API_URL}/bookings/${id}/notes`, {
      method: 'PUT',
      headers: await getAuthHeaders(),
      body: JSON.stringify({ notes }),
    });
    if (!response.ok) throw new Error('No se pudieron actualizar las notas');
  },
};
