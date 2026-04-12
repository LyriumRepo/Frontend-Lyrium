import { useState, useCallback } from 'react';
import { useLogin } from '@/shared/hooks/useLogin';
import type { AuthMode, LoginFormData, RegisterFormData, UserType } from '../types/auth';

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
    register: (data: RegisterFormData) => Promise<{ success: boolean; message?: string; requiresVerification?: boolean; email?: string }>;
    resetForm: () => void;
}

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

    const register = useCallback(async (data: RegisterFormData) => {
        setFormError(null);
        setFormSuccess(null);

        try {
            const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';

            let url: string;
            let body: Record<string, string>;

            if (userType === 'vendedor') {
                url = `${LARAVEL_API}/auth/register`;
                body = {
                    storeName: data.storeName,
                    email: data.email,
                    phone: data.phone,
                    password: data.password,
                    ruc: data.ruc,
                };
            } else {
                url = `${LARAVEL_API}/auth/register-customer`;
                body = {
                    name: data.storeName || data.email.split('@')[0],
                    email: data.email,
                    password: data.password,
                };
            }

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
    }, [userType]);

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
