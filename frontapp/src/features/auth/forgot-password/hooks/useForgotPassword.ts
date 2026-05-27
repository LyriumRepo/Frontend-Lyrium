'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    forgotPasswordAction,
    verifyOtpResetAction,
    resetPasswordAction,
} from '@/shared/lib/actions/forgot-password';
import type { ForgotStep } from '@/features/auth/forgot-password/types';

// ─── Constantes ───────────────────────────────────────────────────────────────
const OTP_RESEND_COOLDOWN = 60; // segundos

// ─── Interfaces del hook ──────────────────────────────────────────────────────
export interface UseForgotPasswordReturn {
    // Estado del flujo
    step: ForgotStep;
    email: string;
    resetToken: string;
    isLoading: boolean;
    error: string | null;
    resendCooldown: number;
    isResending: boolean;

    // Acciones
    sendCode: (email: string) => Promise<void>;
    verifyCode: (code: string) => Promise<void>;
    changePassword: (password: string, passwordConfirmation: string) => Promise<void>;
    resendCode: () => Promise<void>;
    clearError: () => void;
    goBack: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal: maneja el estado completo del flujo de 3 pasos
// ─────────────────────────────────────────────────────────────────────────────
export function useForgotPassword(): UseForgotPasswordReturn {
    const [step, setStep]             = useState<ForgotStep>('email');
    const [email, setEmail]           = useState('');
    const [resetToken, setResetToken] = useState('');
    const [isLoading, setIsLoading]   = useState(false);
    const [error, setError]           = useState<string | null>(null);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending]       = useState(false);

    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Inicia el countdown del botón "Reenviar"
    const startCooldown = useCallback(() => {
        setResendCooldown(OTP_RESEND_COOLDOWN);
        cooldownRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // Limpia el interval al desmontar
    useEffect(() => {
        return () => {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
        };
    }, []);

    const clearError = useCallback(() => setError(null), []);

    // ── Paso 1: enviar código OTP al email ────────────────────────────────────
    const sendCode = useCallback(async (emailInput: string) => {
        setIsLoading(true);
        setError(null);

        const result = await forgotPasswordAction({ email: emailInput });

        setIsLoading(false);

        if (!result.success) {
            setError(result.error ?? 'Error al enviar el código');
            return;
        }

        setEmail(emailInput);
        setStep('otp');
        startCooldown();
    }, [startCooldown]);

    // ── Paso 2: verificar código OTP ──────────────────────────────────────────
    const verifyCode = useCallback(async (code: string) => {
        setIsLoading(true);
        setError(null);

        const result = await verifyOtpResetAction({ email, code });

        setIsLoading(false);

        if (!result.success || !result.reset_token) {
            setError(result.error ?? 'Código incorrecto');
            return;
        }

        setResetToken(result.reset_token);
        setStep('password');
    }, [email]);

    // ── Paso 3: cambiar contraseña ────────────────────────────────────────────
    const changePassword = useCallback(async (
        password: string,
        passwordConfirmation: string
    ) => {
        setIsLoading(true);
        setError(null);

        const result = await resetPasswordAction({
            email,
            token: resetToken,
            password,
            password_confirmation: passwordConfirmation,
        });

        setIsLoading(false);

        if (!result.success) {
            setError(result.error ?? 'No se pudo cambiar la contraseña');
            return;
        }

        setStep('done');
    }, [email, resetToken]);

    // ── Reenviar código (vuelve a llamar paso 1 sin cambiar step) ────────────
    const resendCode = useCallback(async () => {
        if (resendCooldown > 0 || isResending) return;

        setIsResending(true);
        setError(null);

        const result = await forgotPasswordAction({ email });

        setIsResending(false);

        if (!result.success) {
            setError(result.error ?? 'No se pudo reenviar el código');
            return;
        }

        startCooldown();
    }, [email, resendCooldown, isResending, startCooldown]);

    // ── Retroceder al paso anterior ──────────────────────────────────────────
    const goBack = useCallback(() => {
        setError(null);
        if (step === 'otp') setStep('email');
    }, [step]);

    return {
        step,
        email,
        resetToken,
        isLoading,
        error,
        resendCooldown,
        isResending,
        sendCode,
        verifyCode,
        changePassword,
        resendCode,
        clearError,
        goBack,
    };
}