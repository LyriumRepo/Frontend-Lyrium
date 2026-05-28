// ─── Tipos del flujo Recuperar Contraseña ─────────────────────────────────

export type ForgotStep = 'email' | 'otp' | 'password' | 'done';

// Payloads que se envían al backend (coinciden exactamente con los endpoints Laravel)
export interface ForgotPasswordPayload {
    email: string;
}

export interface VerifyOtpPayload {
    email: string;
    code: string;
}

export interface ResetPasswordPayload {
    email: string;
    token: string;
    password: string;
    password_confirmation: string;
}

// Respuestas del backend
export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface VerifyOtpResponse {
    success: boolean;
    reset_token: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
}