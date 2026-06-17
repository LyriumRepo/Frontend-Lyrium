import { useState, useCallback } from 'react';
import { useLogin } from '@/shared/hooks/useLogin';
import type { AuthMode, LoginFormData, RegisterFormData, UserType, RpaResultado } from '../types/auth';

interface UseAuthFormReturn {
    mode: AuthMode;
    userType: UserType;
    formError: string | null;
    formSuccess: string | null;

    setMode: (mode: AuthMode) => void;
    setUserType: (type: UserType) => void;
    setFormError: (error: string | null) => void;
    setFormSuccess: (success: string | null) => void;
    toggleMode: () => void;

    login: (data: LoginFormData) => Promise<{ success: boolean; message?: string }>;
    register: (data: RegisterFormData) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; email?: string; rpaResultado?: RpaResultado }>;
    resetForm: () => void;
}

// URL del servicio RPA (Node.js) — configurable vía variable de entorno
const RPA_API = process.env.NEXT_PUBLIC_RPA_API_URL || 'http://localhost:3001';
const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

// ─── Timeout helper — aborta el fetch si el RPA tarda más de 90s ─────────────
function fetchConTimeout(url: string, options: RequestInit, ms = 90_000): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
}

// ─── Mensajes amigables para cada estado de evaluación del RPA ───────────────
const MENSAJES_RESULTADO: Record<RpaResultado['estado'], (r: RpaResultado) => string> = {
    ACEPTADO: (r) =>
        `¡Felicidades! Tu solicitud fue aprobada (puntaje: ${r.score}/100). ` +
        `Revisa tu correo para verificar tu cuenta y comenzar a vender.`,
    REVISION: (r) =>
        `Tu solicitud quedó en revisión manual (puntaje: ${r.score}/100). ` +
        `Nuestro equipo la evaluará pronto. Mientras tanto, revisa tu correo para verificar tu cuenta.`,
    RECHAZADO: () =>
        'Tu solicitud no cumple con los requisitos del marketplace.',
};

export function useAuthForm(): UseAuthFormReturn {
    const [mode, setMode] = useState<AuthMode>('login');
    const [userType, setUserType] = useState<UserType>('vendedor');
    const [formError, setFormError] = useState<string | null>(null);
    const [formSuccess, setFormSuccess] = useState<string | null>(null);

    const { login: performLogin, isLoading, error: loginError, clearError } = useLogin();

    const toggleMode = useCallback(() => {
        setMode(prev => prev === 'login' ? 'register' : 'login');
        setFormError(null);
        setFormSuccess(null);
        clearError();
    }, [clearError]);

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

    // ── Fallback Laravel — usado cuando el RPA no responde O responde con error ──
    const registrarFallbackLaravel = useCallback(async (data: RegisterFormData) => {
        try {
            const fallbackResponse = await fetch(`${LARAVEL_API}/auth/register-seller-fallback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    nombre:          data.storeName,
                    correo:          data.email,
                    password:        data.password,
                    ruc:             data.ruc,
                    dni:             data.dni,
                    telefono:        data.phone,
                    categoria:       data.categoria,
                    // ── Campos para el acuerdo comercial ──────────────────────
                    contacto:        data.contacto,        // nombre del representante/contacto
                    domicilio_legal: data.domicilioLegal,  // dirección legal del SELLER
                }),
            });

            const fallbackResult = await fallbackResponse.json();

            if (!fallbackResponse.ok) {
                const errorMsg = fallbackResult.errors
                    ? Object.values(fallbackResult.errors).flat().join('. ')
                    : fallbackResult.message || 'No se pudo completar el registro.';
                setFormError(errorMsg as string);
                return { success: false, message: errorMsg as string };
            }

            // Mostrar pantalla de resultado con estado REVISION
            const fallbackRpa = fallbackResult as RpaResultado;

            // Generar y guardar el contrato también en la ruta fallback
            await generarContrato(data, null, fallbackRpa.application_id ?? null);

            return {
                success: true,
                message: 'Tu solicitud fue registrada para revisión manual.',
                email: data.email,
                rpaResultado: fallbackRpa,
            };

        } catch {
            const msg = 'No se pudo completar el registro. Por favor intenta más tarde.';
            setFormError(msg);
            return { success: false, message: msg };
        }
    }, []);

    // ── Generación del contrato (fire-and-forget) ─────────────────────────────
    // Se llama después de que el RPA o el fallback responden con ACEPTADO o
    // REVISIÓN. No bloquea el flujo del usuario: si falla, solo se loguea.
    const generarContrato = useCallback(async (
        data:          RegisterFormData,
        storeId?:      number | null,
        applicationId?: number | null,
    ) => {
        try {
            await fetch(`${LARAVEL_API}/contracts/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify({
                    storeName:       data.storeName,
                    contacto:        data.contacto,
                    domicilio_legal: data.domicilioLegal,
                    ruc:             data.ruc,
                    dni:             data.dni,
                    phone:           data.phone,
                    email:           data.email,
                    store_id:        storeId       ?? null,
                    application_id:  applicationId ?? null,
                }),
            });
        } catch (err) {
            // No exponemos este error al usuario — el equipo de Lyrium
            // puede regenerar el contrato manualmente desde el panel admin.
            console.warn('[Contratos] No se pudo generar el contrato automáticamente:', err);
        }
    }, []);

    // ── Registro de VENDEDOR — vía servicio RPA ───────────────────────────────
    const registerVendedor = useCallback(async (data: RegisterFormData) => {
        // ── Construir FormData para el RPA ───────────────────────────────────
        const body = new FormData();
        body.append('nombre',               data.storeName);
        body.append('dni',                  data.dni);
        body.append('ruc',                  data.ruc);
        body.append('telefono',             data.phone);
        body.append('correo',               data.email);
        body.append('password',             data.password);
        body.append('categoria',            data.categoria);
        body.append('descripcionActividad', data.descripcionActividad);
        body.append('tipoEvidencia',        data.tipoEvidencia);
        // ── Campos para el acuerdo comercial ──────────────────────────────────
        body.append('contacto',        data.contacto);        // nombre del representante/contacto
        body.append('domicilio_legal', data.domicilioLegal);  // dirección legal del SELLER

        if (data.tipoEvidencia === 'texto') {
            body.append('textoEvidencia', data.textoEvidencia);
        } else if (data.tipoEvidencia === 'url') {
            body.append('valorEvidencia', data.valorEvidencia);
        } else if (data.archivoPDF) {
            body.append('archivoPDF', data.archivoPDF);
        }

        // ── Intentar RPA — con fallback si no está disponible o falla ────────
        try {
            const response = await fetchConTimeout(`${RPA_API}/registro-seller`, {
                method: 'POST',
                body,
            });

            if (!response.ok) {
                // El RPA respondió pero con error (caído, excepción interna, etc.)
                // → tratamos esto igual que si el RPA no estuviera disponible.
                console.warn('[RPA] Respondió con error, usando fallback Laravel');
                return registrarFallbackLaravel(data);
            }

            const result: RpaResultado = await response.json();

            // Generar y guardar el contrato si el RPA acepta o pone en revisión
            if (result.estado === 'ACEPTADO' || result.estado === 'REVISION') {
                await generarContrato(data, result.store_id ?? null, result.application_id ?? null);
            }

            // Para los 3 estados mostramos la pantalla de resultado
            const mensaje = MENSAJES_RESULTADO[result.estado](result);
            return {
                success: result.estado !== 'RECHAZADO',
                message: mensaje,
                email: data.email,
                rpaResultado: result,
            };

        } catch (rpaError) {
            // ── RPA no disponible (red caída, timeout, etc.): fallback Laravel ──
            console.warn('[RPA] Servicio no disponible, usando fallback Laravel:', rpaError);
            return registrarFallbackLaravel(data);
        }
    }, [registrarFallbackLaravel, generarContrato]);

    // ── Registro de CLIENTE — flujo original vía Laravel ──────────────────────
    const registerCliente = useCallback(async (data: RegisterFormData) => {
        try {
            const url = `${LARAVEL_API}/auth/register-customer`;
            const body = {
                name: data.storeName || data.email.split('@')[0],
                email: data.email,
                password: data.password,
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(body),
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
                return {
                    success: true,
                    message: result.message,
                    requiresVerification: true,
                    email: result.email,
                };
            }

            setFormSuccess(result.message || '¡Registro exitoso!');
            return { success: true, message: result.message };
        } catch (error) {
            setFormError('Error de conexión con el servidor');
            return { success: false, message: 'Error de conexión' };
        }
    }, []);

    const register = useCallback(async (data: RegisterFormData) => {
        setFormError(null);
        setFormSuccess(null);

        if (userType === 'vendedor') {
            return registerVendedor(data);
        }
        return registerCliente(data);
    }, [userType, registerVendedor, registerCliente]);

    const resetForm = useCallback(() => {
        setFormError(null);
        setFormSuccess(null);
        clearError();
    }, [clearError]);

    return {
        mode,
        userType,
        formError: formError || loginError,
        formSuccess,

        setMode,
        setUserType,
        setFormError,
        setFormSuccess,
        toggleMode,

        login,
        register,
        resetForm,
    };
}