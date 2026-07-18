'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import IntroCover from '@/components/ui/IntroCover';
import { UserTypeToggle } from './UserTypeToggle';
import { LoginPanel } from './LoginPanel';
import { RegisterPanel } from './RegisterPanel';
import { RegistroLoadingModal } from './RegistroLoadingModal';
import { ResultadoRegistro } from './ResultadoRegistro';
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
        registroStep,
        rpaResult,
        rpaStep,
        setUserType,
        setFormError,
        setFormSuccess,
        toggleMode,
        resetRegistro,
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
                setTimeout(() => {
                    if (window.location.pathname !== '/auth/verify-otp') {
                        window.location.href = otpUrl;
                    }
                }, 2000);
                setIsSubmitting(false);
                return result;
            }

            setIsSubmitting(false);
            return result;
        } catch {
            setIsSubmitting(false);
            return { success: false, message: 'Error inesperado' };
        }
    }, [register, router]);

    const handleContinue = useCallback(() => {
        router.push('/login');
    }, [router]);

    const handleRetry = useCallback(() => {
        resetRegistro();
    }, [resetRegistro]);

    if (showIntro) {
        return (
            <IntroCover
                title="¡Qué bueno tenerte de vuelta!"
                subtitle="Inicia sesión como comprador o vendedor y sigue disfrutando del biomarketplace natural de Lyrium."
                icon="ShoppingBag"
                buttonText="Entrar"
                onEnter={handleEnterPortal}
                autoHideAfter={0}
                backgroundImage="/img/intro/tienda2.png"
            />
        );
    }

    const isRegister = mode === 'register';

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[var(--bg-primary)] flex-1 flex items-start sm:items-center justify-center p-3 pt-6 sm:p-4">
            <div className="relative w-full max-w-[1200px] min-h-[650px] bg-white dark:bg-[var(--bg-secondary)] rounded-[30px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col sm:flex-row">

                {/* Mobile Header */}
                <div className="sm:hidden relative w-full bg-gradient-to-br from-sky-500/90 to-lime-500/90 dark:from-[var(--brand-green)] dark:to-[var(--icons-green)] p-6 text-white overflow-hidden">
                    <img src="/img/intro/Flor6.png" alt="" className="absolute -bottom-10 -right-20 w-[300px] max-w-none opacity-50 mix-blend-overlay pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-xl font-black mb-2 tracking-[0.2em]">
                            {isRegister ? 'Únete a Lyrium' : '¡Bienvenido!'}
                        </h2>
                        <p className="text-sm text-white/80 mb-3">
                            {isRegister ? 'Crea tu cuenta' : 'Accede a tu cuenta'}
                        </p>
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="py-2 px-4 bg-white text-sky-500 dark:text-[var(--brand-green)] rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {isRegister ? 'Iniciar Sesión' : 'Crear cuenta'}
                        </button>
                    </div>
                </div>

                {/* Left Side Panel (desktop) */}
                <div
                    className={`hidden sm:flex absolute top-0 left-0 h-full w-[40%]
                    bg-[linear-gradient(to_bottom_right,rgba(14,165,233,0.9),rgba(132,204,22,0.9))]
                    dark:bg-[linear-gradient(to_bottom_right,var(--brand-green),var(--icons-green),var(--brand-green-hover))]
                    p-10 flex-col justify-between text-white z-20 rounded-r-[20px]`}
                >
                    <img src="/img/intro/Flor6.png" alt="" className="absolute -bottom-20 -left-80 w-[700px] max-w-none opacity-60 mix-blend-overlay pointer-events-none" />

                    <div className="absolute inset-0 opacity-30">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="gridAuth" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#gridAuth)" />
                        </svg>
                    </div>

                    <div className="relative z-10">
                        {isRegister ? (
                            <>
                                <h2 className="text-[2rem] font-black mb-4 leading-tight tracking-[0.2em]">
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
                                <h2 className="text-[2rem] font-black mb-4 leading-tight tracking-[0.2em]">
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
                        <p className="text-sm mb-4 text-white font-medium tracking-wide dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.9),0_4px_10px_rgba(0,0,0,0.85),0_0px_25px_rgba(0,0,0,0.7)]">
                            {isRegister ? '¿Ya tienes cuenta?' : (userType === 'vendedor' ? '¿Ya eres parte de Lyrium como vendedor?' : '¿Ya tienes una cuenta?')}
                        </p>
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="w-full py-4 px-6 bg-white text-sky-500 dark:text-[var(--brand-green)] rounded-xl font-bold text-sm uppercase tracking-wider shadow-[0_10px_25px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {isRegister ? 'Iniciar Sesión' : (userType === 'vendedor' ? 'Registrarse como vendedor' : 'Crear cuenta')}
                        </button>
                    </div>
                </div>

                {/* Right Side */}
                <div className="relative w-full sm:ml-auto sm:w-[60%] p-4 sm:p-10 flex flex-col">
                    <UserTypeToggle
                        value={userType}
                        onChange={(type) => {
                            setUserType(type);
                            setFormError(null);
                            setFormSuccess(null);
                            resetRegistro();
                        }}
                    />

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

                    {isRegister && registroStep === 'form' && (
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

                    {isRegister && registroStep === 'result' && rpaResult && (
                        <div className="flex-1">
                            <ResultadoRegistro
                                result={rpaResult}
                                onContinue={handleContinue}
                                onRetry={handleRetry}
                                isSubmitting={isSubmitting}
                                email={rpaResult?.email || undefined}
                            />
                        </div>
                    )}
                </div>
            </div>

            <RegistroLoadingModal
                isOpen={registroStep === 'loading'}
                currentStep={rpaStep}
            />
        </div>
    );
}
