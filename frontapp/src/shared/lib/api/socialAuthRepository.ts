import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

export type SocialProvider = 'google' | 'facebook';

export interface GoogleAuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
    display_name: string;
    role: string;
    avatar?: string;
  };
  is_new_user: boolean;
}

/**
 * Envía el credential (ID token) de Google al backend Laravel.
 * El backend lo verifica con Google y retorna user + token Sanctum.
 */
export async function googleAuthWithCredential(credential: string): Promise<GoogleAuthResponse> {
  const response = await fetch(`${LARAVEL_API_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ credential }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Error ${response.status}: Autenticación con Google falló`);
  }

  return response.json();
}
