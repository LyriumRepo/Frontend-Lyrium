'use client';

import { FormEvent, useState } from 'react';
import { Loader2, Lock, Mail, User, Building2 } from 'lucide-react';
import { SocialLoginButton } from '@/components/login/social/SocialLoginButton';
import type { LoginFormData, UserType } from '../types/auth';

interface LoginPanelProps {
    userType: UserType;
    error: string | null;
    success: string | null;
    isLoading: boolean;
    onSubmit: (data: LoginFormData) => Promise<{ success: boolean }>;
    onClearError: () => void;
}

const LABELS: Record<UserType, { title: string; subtitle: string; placeholder: string }> = {
    vendedor: {
        title: 'Inicia sesión como vendedor',
        subtitle: 'Ingresa tus credenciales para acceder al panel de vendedor.',
        placeholder: 'Nombre de tu tienda o admin'
    },
    cliente: {
        title: 'Inicia sesión como cliente',
        subtitle: 'Ingresa tus credenciales para acceder a tu cuenta.',
        placeholder: 'tu@email.com'
    }
};

export function LoginPanel({ 
    userType, 
    error, 
    success, 
    isLoading, 
    onSubmit, 
    onClearError 
}: LoginPanelProps) {
    const [formData, setFormData] = useState<LoginFormData>({
        username: '',
        password: '',
        rememberMe: false
    });

    const labels = LABELS[userType];

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        onClearError();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 w-[90%] mx-auto">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-sky-50 dark:bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-sky-500 shadow-[0_10px_20px_rgba(14,165,233,0.1)] flex-shrink-0">
                        {userType === 'vendedor' ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)]">
                            {labels.title}
                        </h3>
                        <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm">
                            {labels.subtitle}
                        </p>
                    </div>
                </div>

                {error && (
                    <div role="alert" aria-live="polite" className="error-message mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}
                {success && (
                    <div role="status" aria-live="polite" className="success-message mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div>
                        <label htmlFor="login-email" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                            Usuario / Nombre de Tienda <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                            <input
                                id="login-email"
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder={labels.placeholder}
                                autoComplete="username"
                                required
                                aria-required="true"
                                aria-label={userType === 'vendedor' ? 'Nombre de tienda o usuario' : 'Correo electrónico'}
                                className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="login-password" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                            <input
                                id="login-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                required
                                aria-required="true"
                                className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                            />
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <label htmlFor="remember-me" className="flex items-center gap-2 cursor-pointer">
                            <input
                                id="remember-me"
                                type="checkbox"
                                name="rememberMe"
                                checked={formData.rememberMe}
                                onChange={handleChange}
                                className="w-4 h-4 accent-sky-500 cursor-pointer"
                            />
                            <span className="text-sm text-slate-600 dark:text-[var(--text-secondary)] select-none">Recordarme</span>
                        </label>
                        <a href="/forgot-password" className="text-sm text-sky-500 hover:text-sky-700 font-medium transition-colors">
                            ¿Olvidaste tu contraseña?
                        </a>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Iniciando sesión...</span>
                                </>
                            ) : (
                                <>
                                    <span>Iniciar Sesión</span>
                                    <User className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-10" />
                                </>
                            )}
                        </span>
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200 dark:border-[var(--border-subtle)]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white dark:bg-[var(--bg-secondary)] px-3 text-slate-500 dark:text-[var(--text-secondary)]">
                                o continúa con
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <SocialLoginButton provider="google" />
                        <SocialLoginButton provider="facebook" />
                    </div>
                </form>
            </div>
        </div>
    );
}
