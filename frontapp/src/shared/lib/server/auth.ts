import { cookies } from 'next/headers';

const LARAVEL_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://127.0.0.1:8000/api';

export interface AuthUser {
    id: number;
    role: string;
    email: string;
}

/**
 * Valida el token contra Laravel y devuelve el usuario.
 * Siempre hace una llamada real — nunca confía en cookies de rol.
 * Retorna null si el token no existe o es inválido.
 */
export async function validateWithLaravel(): Promise<AuthUser | null> {
    const token = (await cookies()).get('laravel_token')?.value;
    if (!token) return null;

    try {
        const res = await fetch(`${LARAVEL_URL}/auth/validate`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${decodeURIComponent(token)}`,
            },
            cache: 'no-store',
        });

        if (!res.ok) return null;

        const data = await res.json();
        const user = data.user ?? data;

        if (!user?.id || !user?.role) return null;

        return { id: user.id, role: user.role, email: user.email };
    } catch {
        return null;
    }
}