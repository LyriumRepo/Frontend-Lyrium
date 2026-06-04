import { getToken } from './token-store';
import type {
  CalendarStatus,
  AuthUrlResponse,
} from "@/features/seller/services/types";

// Usamos la URL directa a Laravel que ya tienes definida para evitar el proxy 404
const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? "http://localhost:8000/api";

// ─── Helper request() siguiendo tu patrón de arquitectura ────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const url = `${LARAVEL_API_URL}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message ?? error.error ?? `HTTP Error ${res.status}`);
  }

  // Adaptador defensivo por si el backend envuelve la respuesta en { data: ... }
  const json = await res.json();
  return (json.data !== undefined ? json.data : json) as T;
}

// ─── Métodos del Repositorio ──────────────────────────────────────────────────

/**
 * Obtiene el estado de conexión de Google Calendar del vendedor
 */
export async function getGoogleCalendarStatus(): Promise<CalendarStatus> {
  return request<CalendarStatus>("/google/status");
}

/**
 * Solicita la URL de redirección de Google OAuth2
 */
export async function getGoogleAuthUrl(): Promise<AuthUrlResponse> {
  return request<AuthUrlResponse>("/google/auth-url");
}

/**
 * Desconecta la cuenta de Google Calendar del vendedor
 */
export async function disconnectGoogleCalendar(): Promise<{ message: string }> {
  return request<{ message: string }>("/google/disconnect", {
    method: "DELETE",
  });
}
