'use server';

import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import type {
    ForgotPasswordPayload,
    ForgotPasswordResponse,
    VerifyOtpPayload,
    VerifyOtpResponse,
    ResetPasswordPayload,
    ResetPasswordResponse,
} from '@/features/auth/forgot-password/types';

// ─── Helper interno ────────────────────────────────────────────────────────
async function postToLaravel<T>(
    endpoint: string,
    body: Record<string, string>
): Promise<T> {
    const res = await fetch(`${LARAVEL_API_URL}/auth${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify(body),
        cache: 'no-store',
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json.error ?? json.message ?? 'Error desconocido');
    }

    return json as T;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/forgot-password
// Envía el OTP al correo del usuario
// ─────────────────────────────────────────────────────────────────────────────
export async function forgotPasswordAction(
    payload: ForgotPasswordPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        await postToLaravel<ForgotPasswordResponse>('/forgot-password', {
            email: payload.email,
        });
        return { success: true };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'No se pudo enviar el código',
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp-reset
// Verifica el código OTP y devuelve el reset_token para cambiar la contraseña
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyOtpResetAction(
    payload: VerifyOtpPayload
): Promise<{ success: boolean; reset_token?: string; error?: string }> {
    try {
        const data = await postToLaravel<VerifyOtpResponse>('/verify-otp-reset', {
            email: payload.email,
            code: payload.code,
        });
        return { success: true, reset_token: data.reset_token };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'Código incorrecto o expirado',
        };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/reset-password
// Cambia la contraseña usando el reset_token obtenido tras verificar el OTP
// ─────────────────────────────────────────────────────────────────────────────
export async function resetPasswordAction(
    payload: ResetPasswordPayload
): Promise<{ success: boolean; error?: string }> {
    try {
        await postToLaravel<ResetPasswordResponse>('/reset-password', {
            email: payload.email,
            token: payload.token,
            password: payload.password,
            password_confirmation: payload.password_confirmation,
        });
        return { success: true };
    } catch (err: unknown) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'No se pudo cambiar la contraseña',
        };
    }
}