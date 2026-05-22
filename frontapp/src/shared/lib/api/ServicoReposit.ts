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
 * Genera de forma automatizada las cabeceras comunes inyectando el Laravel Token de sesión
 */
function getHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
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
    const response = await fetch(`${LARAVEL_API_URL}/services/me`, {
      method: 'GET',
      headers: getHeaders(),
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
      headers: getHeaders(),
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
      headers: getHeaders(),
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
      headers: getHeaders(),
    });

    if (!response.ok) throw new Error('No se pudo eliminar el servicio');
  },

  // ── SPECIALISTS ENDPOINTS ───────────────────────────────────────────────────

  async listSpecialists(): Promise<Specialist[]> {
    const response = await fetch(`${LARAVEL_API_URL}/stores/me/specialists`, {
      method: 'GET',
      headers: getHeaders(),
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
      headers: getHeaders(),
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
    const response = await fetch(
      `${LARAVEL_API_URL}/stores/me/specialists/${id}`,
      {
        method: 'PUT',
        headers: getHeaders(),
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
        headers: getHeaders(),
      },
    );

    if (!response.ok) throw new Error('No se pudo dar de baja al especialista');
  },

  // ── BOOKINGS ENDPOINTS ──────────────────────────────────────────────────────

  async listAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${LARAVEL_API_URL}/bookings/seller`, {
      method: 'GET',
      headers: getHeaders(),
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
    newSession: { inicio: string; fin: string },
  ): Promise<void> {
    const response = await fetch(
      `${LARAVEL_API_URL}/bookings/${appointmentId}/notes`,
      {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          notes: `Reprogramado operativamente a las: ${newSession.inicio} - ${newSession.fin}`,
        }),
      },
    );

    if (!response.ok)
      throw new Error('No se pudo actualizar el itinerario de la cita');
  },
};
