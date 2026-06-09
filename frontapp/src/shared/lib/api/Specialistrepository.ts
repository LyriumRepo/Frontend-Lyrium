/**
 * specialistRepository.ts
 *
 * Repositorio de especialistas — conecta con Laravel SpecialistController.
 * Sigue el mismo patrón que orderRepository.ts y serviceRepository.ts.
 *
 * Ubicación: src/shared/lib/api/specialistRepository.ts
 *
 * Endpoints cubiertos:
 *   GET    /api/stores/me/specialists        → list()
 *   POST   /api/stores/me/specialists        → create()
 *   PUT    /api/stores/me/specialists/:id    → update()
 *   DELETE /api/stores/me/specialists/:id    → remove()
 */

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type DocumentType = 'DNI' | 'CE' | 'Pasaporte';
export type AvailabilityStatus = 'Disponible' | 'Indispuesto' | 'Ocupado';

/** Shape que devuelve el backend (y que muestra el panel del vendedor) */
export interface SpecialistResponse {
  id: number;
  store_id: number;
  nombres: string;
  apellidos: string;
  document_type: DocumentType;
  document_number: string;
  especialidad: string;
  availability: AvailabilityStatus;
  foto?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Payload para crear un especialista — coincide con StoreSpecialistRequest */
export interface CreateSpecialistInput {
  nombres: string;
  apellidos: string;
  document_type: DocumentType;
  document_number: string;
  especialidad: string;
  availability: AvailabilityStatus;
  foto?: string | null;
}

/** Payload para actualizar — coincide con UpdateSpecialistRequest (todos opcionales) */
export type UpdateSpecialistInput = Partial<CreateSpecialistInput>;

/** Shape interno del frontend (ServiceConfigModal / SpecialistModal) */
export interface FrontendSpecialist {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string;
  availability: AvailabilityStatus;
  foto?: string | null;
  // Campos opcionales del modal
  document_type?: DocumentType;
  document_number?: string;
}

/**
 * Convierte un SpecialistResponse del backend al shape que usa el frontend.
 * El ServiceConfigModal y SpecialistItem solo necesitan un subconjunto de campos.
 */
export function mapResponseToFrontend(
  sp: SpecialistResponse,
): FrontendSpecialist {
  return {
    id: sp.id,
    nombres: sp.nombres,
    apellidos: sp.apellidos,
    especialidad: sp.especialidad,
    availability: sp.availability,
    foto: sp.foto ?? null,
    document_type: sp.document_type,
    document_number: sp.document_number,
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
    headers: { ...headers, ...(options.headers ?? {}) },
  });

  if (res.status === 204) return undefined as T; // DELETE sin body

  const json = await res.json();

  if (!res.ok) {
    const msg = json.message ?? `Error ${res.status}`;
    throw new Error(msg);
  }

  // El backend devuelve { specialist: {...} } en store/update,
  // y un array directo en index
  return (json.specialist ?? json.data ?? json) as T;
}

// ─── API pública del repositorio ──────────────────────────────────────────────

export const specialistRepository = {
  /**
   * Lista todos los especialistas de la tienda autenticada.
   * GET /api/stores/me/specialists
   */
  async list(): Promise<SpecialistResponse[]> {
    const result = await request<
      SpecialistResponse[] | { data: SpecialistResponse[] }
    >('/stores/me/specialists');
    return Array.isArray(result) ? result : (result.data ?? []);
  },

  /**
   * Crea un nuevo especialista.
   * POST /api/stores/me/specialists
   */
  async create(input: CreateSpecialistInput): Promise<SpecialistResponse> {
    return request<SpecialistResponse>('/stores/me/specialists', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Actualiza un especialista existente.
   * PUT /api/stores/me/specialists/:id
   */
  async update(
    id: number,
    input: UpdateSpecialistInput,
  ): Promise<SpecialistResponse> {
    return request<SpecialistResponse>(`/stores/me/specialists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  /**
   * Cambia solo la disponibilidad de un especialista.
   * Atajo útil para sincronizar cuando se asigna/desasigna de un servicio.
   */
  async setAvailability(
    id: number,
    availability: AvailabilityStatus,
  ): Promise<SpecialistResponse> {
    return specialistRepository.update(id, { availability });
  },

  /**
   * Elimina un especialista.
   * DELETE /api/stores/me/specialists/:id
   */
  async remove(id: number): Promise<void> {
    await request<void>(`/stores/me/specialists/${id}`, { method: 'DELETE' });
  },
};
