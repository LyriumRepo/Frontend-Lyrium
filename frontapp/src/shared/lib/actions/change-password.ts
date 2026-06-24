'use server';

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface ChangePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
  token: string;
}

interface ChangePasswordResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export async function changePasswordAction(
  data: ChangePasswordPayload,
): Promise<ChangePasswordResult> {
  const { token, ...body } = data;

  if (!token) {
    return {
      success: false,
      message: 'No autenticado. Por favor inicia sesión nuevamente.',
    };
  }

  try {
    const res = await fetch(`${LARAVEL_API_URL}/users/profile/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (res.ok) {
      return {
        success: true,
        message: json.message ?? 'Contraseña actualizada correctamente.',
      };
    }

    // 422 Unprocessable Entity → errores de validación de Laravel
    if (res.status === 422) {
      return {
        success: false,
        message: json.message ?? 'Error de validación.',
        errors: json.errors,
      };
    }

    // 401 u otros
    return {
      success: false,
      message: json.message ?? 'Error al actualizar la contraseña.',
    };
  } catch {
    return {
      success: false,
      message: 'Error de conexión con el servidor.',
    };
  }
}
