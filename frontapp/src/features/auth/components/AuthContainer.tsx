'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import IntroCover from '@/components/ui/IntroCover';
import { UserTypeToggle } from './UserTypeToggle';
import { LoginPanel } from './LoginPanel';
import { RegisterPanel } from './RegisterPanel';
import { useAuthForm } from '../hooks/useAuthForm';
import type { LoginFormData, RegisterFormData, UserType } from '../types/auth';

interface AuthContainerProps {
    onSuccess?: () => void;
}

export function AuthContainer({ onSuccess }: AuthContainerProps) {
    const [showIntro, setShowIntro] = useState(true);
    const router = useRouter();
    
    const { 
        mode, 
        userType, 
        formError, 
        formSuccess, 
        setUserType, 
        setFormError,
        setFormSuccess,
        toggleMode,
        login,
        register,
    } = useAuthForm();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleEnterPortal = useCallback(() => {
        setShowIntro(false);
    }, []);

    const handleLogin = useCallback(async (data: LoginFormData) => {
        setIsSubmitting(true);
        const result = await login(data);
        setIsSubmitting(false);
        if (result.success) {
            onSuccess?.();
        }
        return result;
    }, [login, onSuccess]);

    const handleRegister = useCallback(async (data: RegisterFormData) => {
        setIsSubmitting(true);
        try {
            const result = await register(data);

            if (result.success && result.requiresVerification && result.email) {
                const otpUrl = `/auth/verify-otp?email=${encodeURIComponent(result.email)}`;
                router.push(otpUrl);
                // Fallback: si router.push no navega en 2s, forzar con window.location
                setTimeout(() => {
                    if (window.location.pathname !== '/auth/verify-otp') {
                        window.location.href = otpUrl;
                    }
                }, 2000);
                return result;
            }

            setIsSubmitting(false);
            return result;
        } catch {
            setIsSubmitting(false);
            return { success: false, message: 'Error inesperado' };
        }
    }, [register, router]);

    if (showIntro) {
        return (
            <IntroCover
                title="Tu marketplace de productos naturales"
                subtitle="Únete a la comunidad que está transformando el comercio saludable"
                icon="ShoppingBag"
                buttonText="Entrar"
                onEnter={handleEnterPortal}
                autoHideAfter={0}
            />
        );
    }

    const isRegister = mode === 'register';

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[var(--bg-primary)] flex items-center justify-center p-4">
            <div className="relative w-full max-w-[1200px] min-h-[650px] bg-white dark:bg-[var(--bg-secondary)] rounded-[30px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden flex">
                
                {/* Left Side Panel - visible siempre */}
                <div
                    className={`absolute top-0 left-0 h-full w-[40%] bg-gradient-to-br from-sky-500 via-sky-400 to-lime-400 p-10 flex flex-col justify-between text-white z-20 rounded-r-[20px]`}
                >
                    <div className="absolute inset-0 opacity-30">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="gridAuth" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#gridAuth)"/>
                        </svg>
                    </div>

                    <div className="relative z-10">
                        {isRegister ? (
                            <>
                                <h2 className="text-[2rem] font-black mb-4 leading-tight">
                                    {userType === 'vendedor' ? 'Haz crecer tu marca con nosotros.' : 'Únete a Lyrium'}
                                </h2>
                                <p className="text-white/95 text-center max-w-[300px] mx-auto">
                                    {userType === 'vendedor' 
                                        ? 'Únete a la comunidad de vendedores más grande y gestiona tus pedidos en un solo lugar.'
                                        : 'Crea tu cuenta y descubre los mejores productos naturales y saludables.'}
                                </p>
                            </>
                        ) : (
                            <>
                                <h2 className="text-[2rem] font-black mb-4 leading-tight">
                                    {userType === 'vendedor' ? '¡Qué gusto verte de nuevo!' : '¡Bienvenido de nuevo!'}
                                </h2>
                                <p className="text-white/95 text-center max-w-[300px] mx-auto">
                                    {userType === 'vendedor'
                                        ? 'Accede a tu panel para revisar tus ventas de hoy y actualizar tu inventario.'
                                        : 'Accede a tu cuenta para realizar tus compras y gestionar tus pedidos.'}
                                </p>
                            </>
                        )}
                    </div>

                    <div className="relative z-10">
                        <p className="text-sm mb-4 opacity-90">
                            {isRegister ? '¿Ya tienes cuenta?' : (userType === 'vendedor' ? '¿Ya eres parte de Lyrium como vendedor?' : '¿Ya tienes una cuenta?')}
                        </p>
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="w-full py-4 px-6 bg-white text-sky-500 rounded-xl font-bold text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {isRegister ? 'Iniciar Sesión' : (userType === 'vendedor' ? 'Registrarse como vendedor' : 'Crear cuenta')}
                        </button>
                    </div>
                </div>

                {/* Right Side - Forms */}
                <div className="relative ml-auto w-[60%] p-10 flex flex-col">
                    <UserTypeToggle
                        value={userType}
                        onChange={(type) => {
                            setUserType(type);
                            setFormError(null);
                            setFormSuccess(null);
                        }}
                    />

                    {/* Login Panel - only show when NOT register */}
                    {!isRegister && (
                        <div className="flex-1">
                            <LoginPanel
                                userType={userType}
                                error={formError}
                                success={formSuccess}
                                isLoading={isSubmitting}
                                onSubmit={handleLogin}
                                onClearError={() => setFormError(null)}
                            />
                        </div>
                    )}

                    {/* Register Panel - only show when register */}
                    {isRegister && (
                        <div className="flex-1">
                            <RegisterPanel
                                userType={userType}
                                error={formError}
                                success={formSuccess}
                                isLoading={isSubmitting}
                                onSubmit={handleRegister}
                                onClearError={() => setFormError(null)}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
