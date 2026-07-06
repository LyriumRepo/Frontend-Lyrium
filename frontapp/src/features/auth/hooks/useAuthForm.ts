import { useState, useCallback } from 'react';
import { useLogin } from '@/shared/hooks/useLogin';
import type { AuthMode, LoginFormData, RegisterFormData, UserType, RpaResult, RegistroStep } from '../types/auth';

interface UseAuthFormReturn {
    mode: AuthMode;
    userType: UserType;
    formError: string | null;
    formSuccess: string | null;
    registroStep: RegistroStep;
    rpaResult: RpaResult | null;
    rpaStep: string;

    setMode: (mode: AuthMode) => void;
    setUserType: (type: UserType) => void;
    setFormError: (error: string | null) => void;
    setFormSuccess: (success: string | null) => void;
    toggleMode: () => void;
    resetRegistro: () => void;

    login: (data: LoginFormData) => Promise<{ success: boolean; message?: string }>;
    register: (data: RegisterFormData) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; email?: string }>;
    resetForm: () => void;
}

const RPA_API_URL = process.env.NEXT_PUBLIC_RPA_API_URL || 'http://localhost:3001';
const RPA_TIMEOUT = 90000;

class RpaValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'RpaValidationError';
    }
}

export function useAuthForm(): UseAuthFormReturn {
    const [mode, setMode] = useState<AuthMode>('login');
    const [userType, setUserType] = useState<UserType>('vendedor');
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);
    const [registroStep, setRegistroStep] = useState<RegistroStep>('form');
    const [rpaResult, setRpaResult] = useState<RpaResult | null>(null);
    const [rpaStep, setRpaStep] = useState<string>('validar');

    const { login: performLogin, isLoading, error: loginError, clearError } = useLogin();

    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'login' ? 'register' : 'login');
        setFormError(null);
        setFormSuccess(null);
        setRegistroStep('form');
        setRpaResult(null);
        clearError();
    }, [clearError]);

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    const login = useCallback(async (data: LoginFormData) => {
        setFormError(null);
        setFormSuccess(null);

        const result = await performLogin(data);

        if (result.success) {
            setFormSuccess(result.message || 'Login exitoso');
            return { success: true, message: result.message };
        } else {
            setFormError(result.error || 'Credenciales inválidas');
            return { success: false, message: result.error };
        }
    }, [performLogin]);

    const callRpaMicroservice = useCallback(async (data: RegisterFormData): Promise<RpaResult> => {
        const formPayload = new FormData();
        formPayload.append('nombre', data.storeName);
        formPayload.append('dni', data.dni);
        formPayload.append('ruc', data.ruc);
        formPayload.append('telefono', data.phone);
        formPayload.append('correo', data.email);
        formPayload.append('password', data.password);
        formPayload.append('categoria', data.categoria);
        formPayload.append('descripcionActividad', data.descripcionActividad);

        if (data.tipoEvidencia === 'url') {
            formPayload.append('tipoEvidencia', 'url');
            formPayload.append('valorEvidencia', data.valorEvidencia);
        } else if (data.tipoEvidencia === 'texto') {
            formPayload.append('tipoEvidencia', 'texto');
            formPayload.append('textoEvidencia', data.textoEvidencia);
        } else {
            formPayload.append('tipoEvidencia', data.tipoEvidencia);
            if (data.archivoPDF) {
                formPayload.append('archivoPDF', data.archivoPDF);
            }
        }

        formPayload.append('contacto', data.contacto);
        formPayload.append('domicilioLegal', data.domicilioLegal);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), RPA_TIMEOUT);

        try {
            setRpaStep('validar');
            await sleep(800);

            setRpaStep('sunat');
            await sleep(1200);

            const response = await fetch(`${RPA_API_URL}/registro-seller`, {
                method: 'POST',
                body: formPayload,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const err = await response.json().catch(() => ({ error: 'Error en el RPA' }));
                throw new RpaValidationError(err.error || `Error del RPA (${response.status})`);
            }

            setRpaStep('evidencia');
            await sleep(600);

            setRpaStep('score');
            await sleep(600);

            setRpaStep('resultado');

            const result: RpaResult = await response.json();
            return result;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }, []);

    const registerSellerFallback = useCallback(async (data: RegisterFormData) => {
        const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

        const response = await fetch(`${LARAVEL_API}/auth/register-seller-fallback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
                storeName: data.storeName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                ruc: data.ruc,
                dni: data.dni,
                categoria: data.categoria,
                descripcionActividad: data.descripcionActividad,
                tipoEvidencia: data.tipoEvidencia,
                valorEvidencia: data.valorEvidencia,
                textoEvidencia: data.textoEvidencia,
                contacto: data.contacto,
                domicilioLegal: data.domicilioLegal,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            const errorMsg = result.errors
                ? Object.values(result.errors).flat().join('. ')
                : result.error || result.message || 'Error al registrar';
            throw new Error(errorMsg as string);
        }

        return result;
    }, []);

    const register = useCallback(async (data: RegisterFormData) => {
        setFormError(null);
        setFormSuccess(null);

        if (userType === 'vendedor') {
            setRegistroStep('loading');
            setRpaResult(null);

            try {
                const result = await callRpaMicroservice(data);
                setRpaResult(result);
                setRegistroStep('result');

                if (result.estado === 'ACEPTADO') {
                    setFormSuccess('¡Solicitud aprobada! Tu tienda ha sido creada.');
                    return { success: true, message: 'Solicitud aprobada' };
                } else {
                    return { success: true, message: `Solicitud en estado: ${result.estado}` };
                }
            } catch (error) {
                if (error instanceof RpaValidationError) {
                    setRegistroStep('form');
                    setFormError(error.message);
                    return { success: false, message: error.message };
                }

                console.warn('RPA no disponible, intentando fallback:', error);

                try {
                    const fallbackResult = await registerSellerFallback(data);
                    setRegistroStep('result');
                    setRpaResult({
                        estado: 'REVISION',
                        score: 50,
                        riesgo: 'MEDIO',
                        etapa: 1,
                        diagnostico: [
                            'Registro enviado para revisión manual',
                            'El RPA no estuvo disponible en este momento',
                            'El equipo revisará tu solicitud pronto',
                        ],
                        application_id: fallbackResult.application_id || 0,
                        store_id: fallbackResult.store_id || null,
                    });

                    setFormSuccess('Solicitud enviada para revisión manual.');
                    return { success: true, message: 'Solicitud en revisión manual' };
                } catch (fallbackError) {
                    setRegistroStep('form');
                    const msg = fallbackError instanceof Error ? fallbackError.message : 'Error al registrar';
                    setFormError(msg);
                    return { success: false, message: msg };
                }
            }
        } else {
            const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

            try {
                const response = await fetch(`${LARAVEL_API}/auth/register-customer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({
                        name: data.storeName || data.email.split('@')[0],
                        email: data.email,
                        password: data.password,
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    const errorMsg = result.errors
                        ? Object.values(result.errors).flat().join('. ')
                        : result.error || result.message || 'Error al registrar';
                    setFormError(errorMsg as string);
                    return { success: false, message: errorMsg as string };
                }

                if (result.requires_verification) {
                    setFormSuccess('Registro exitoso. Revisa tu correo para el código de verificación.');
                    return { success: true, message: result.message, requiresVerification: true, email: result.email };
                }

                setFormSuccess(result.message || '¡Registro exitoso!');
                return { success: true, message: result.message };
            } catch (error) {
                setFormError('Error de conexión con el servidor');
                return { success: false, message: 'Error de conexión' };
            }
        }
    }, [userType, callRpaMicroservice, registerSellerFallback]);

    const resetRegistro = useCallback(() => {
        setRegistroStep('form');
        setRpaResult(null);
        setRpaStep('validar');
        setFormError(null);
        setFormSuccess(null);
    }, []);

    const resetForm = useCallback(() => {
        setFormError(null);
        setFormSuccess(null);
        setRegistroStep('form');
        setRpaResult(null);
        clearError();
    }, [clearError]);

    return {
        mode,
        userType,
        formError: formError || loginError,
        formSuccess,
        registroStep,
        rpaResult,
        rpaStep,

        setMode,
        setUserType,
        setFormError,
        setFormSuccess,
        toggleMode,
        resetRegistro,

        login,
        register,
        resetForm,
    };
}
