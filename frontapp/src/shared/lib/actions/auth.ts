'use server';

import { cookies } from 'next/headers';
import { authRepository } from '@/shared/lib/api/factory';
import { LoginCredentials } from '@/lib/types/auth';

export async function loginAction(credentials: LoginCredentials) {
    const result = await authRepository.login(credentials);

    if (!result.success || !result.token) {
        return { success: false, error: result.error || 'Login failed' };
    }

    const cookieStore = await cookies();

    cookieStore.set('laravel_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    });

    return { success: true, user: result.user, token: result.token };
}

export async function logoutAction() {
    const cookieStore = await cookies();

    cookieStore.delete('laravel_token');
    cookieStore.delete('wp_session');

    return { success: true };
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('laravel_token')?.value;

    if (!token) {
        return { authenticated: false, user: null, role: null };
    }

    try {
        const user = await authRepository.validateToken();
        return {
            authenticated: true,
            user,
            role: user?.role || null
        };
    } catch {
        return { authenticated: false, user: null, role: null };
    }
}

export async function loginWithSocialAction(provider: string, credential: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

        const response = await fetch(`${baseUrl}/auth/${provider}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ credential }),
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            return { success: false, error: data.error || 'Error de autenticación social' };
        }

        const result = await response.json();

        if (!result.success || !result.token) {
            return { success: false, error: result.error || 'Error de autenticación social' };
        }

        const cookieStore = await cookies();

        cookieStore.set('laravel_token', result.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        return { success: true, user: result.user, token: result.token };
    } catch (error) {
        console.error('Social login error:', error);
        return { success: false, error: 'Error de conexión' };
    }
}
