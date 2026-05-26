'use server';

import { cookies } from 'next/headers';
import type { ChangePasswordPayload, ChangePasswordResult } from '@/features/auth/change-password/types';

const API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

export async function changePasswordAction(
  payload: ChangePasswordPayload,
): Promise<ChangePasswordResult> {
  // ── Leer el token de sesión (Sanctum) ──────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get('laravel_token')?.value;

  if (!token) {
    return { success: false, message: 'No autenticado. Por favor inicia sesión.' };
  }

  try {
    const laravelPayload = {
      actual: payload.current_password,
      nueva: payload.password,
    };

    const res = await fetch(`${API_BASE}/users/profile/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(laravelPayload),
      // No cachear respuestas de mutación
      cache: 'no-store',
    });

    const data = await res.json();

    if (!res.ok) {
      // Laravel devuelve 422 con { message, errors }
      return {
        success: false,
        message: data.message ?? 'Error al actualizar la contraseña.',
        errors: data.errors,
      };
    }

    return { success: true, message: data.message };
  } catch {
    return {
      success: false,
      message: 'Error de conexión. Por favor intenta de nuevo.',
    };
  }
}