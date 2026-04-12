'use client';

import { FormEvent, useState, useEffect } from 'react';
import { Loader2, Lock, Mail, Phone, Building2, ArrowRight, CheckCircle } from 'lucide-react';
import { SocialLoginButton } from '@/components/login/social/SocialLoginButton';
import type { RegisterFormData, UserType } from '../types/auth';

interface RegisterPanelProps {
    userType: UserType;
    error: string | null;
    success: string | null;
    isLoading: boolean;
    onSubmit: (data: RegisterFormData) => Promise<{ success: boolean }>;
    onClearError: () => void;
}

const LABELS: Record<UserType, { title: string; subtitle: string; buttonText: string }> = {
    vendedor: {
        title: 'Crea tu tienda',
        subtitle: 'Ingresa los detalles para configurar tu perfil de vendedor.',
        buttonText: 'Crear Tienda'
    },
    cliente: {
        title: 'Crea tu cuenta',
        subtitle: 'Ingresa tus datos para registrarte como cliente.',
        buttonText: 'Crear Cuenta'
    }
};

const EMPTY_FORM: RegisterFormData = {
    storeName: '',
    email: '',
    phone: '',
    password: '',
    ruc: ''
};

export function RegisterPanel({ 
    userType, 
    error, 
    success, 
    isLoading, 
    onSubmit, 
    onClearError
}: RegisterPanelProps) {
    const [formData, setFormData] = useState<RegisterFormData>(EMPTY_FORM);

    const labels = LABELS[userType];
    const isVendedor = userType === 'vendedor';

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setFormData(EMPTY_FORM);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        if (name === 'phone' || name === 'ruc') {
            const numericValue = value.replace(/[^0-9]/g, '');
            setFormData(prev => ({ ...prev, [name]: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        onClearError();
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 w-[90%] mx-auto">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-sky-50 dark:bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center text-sky-500 shadow-[0_10px_20px_rgba(14,165,233,0.1)] flex-shrink-0">
                        {userType === 'vendedor' ? <Building2 className="w-8 h-8" /> : <Mail className="w-8 h-8" />}
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

                <form onSubmit={handleSubmit} className={`grid ${isVendedor ? 'grid-cols-2' : 'grid-cols-1'} gap-5`} noValidate>
                    {/* Nombre Comercial (vendedor) / Tu Nombre (cliente) */}
                    <div className={isVendedor ? 'col-span-2' : ''}>
                        <label htmlFor="store-name" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                            {isVendedor ? 'Nombre Comercial' : 'Tu Nombre'} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                            <input
                                id="store-name"
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleChange}
                                placeholder={isVendedor ? 'Ej: Mi Dulce Hogar' : 'Ej: Juan Pérez'}
                                autoComplete={isVendedor ? 'organization' : 'name'}
                                required
                                className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className={isVendedor ? '' : ''}>
                        <label htmlFor="reg-email" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                            <input
                                id="reg-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={isVendedor ? 'email@tienda.com' : 'tu@email.com'}
                                autoComplete="email"
                                required
                                className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Teléfono — solo vendedor */}
                    {isVendedor && (
                        <div>
                            <label htmlFor="reg-phone" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                Teléfono <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                <input
                                    id="reg-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="999 000 000"
                                    maxLength={9}
                                    inputMode="tel"
                                    required
                                    className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                />
                            </div>
                        </div>
                    )}

                    {/* Contraseña */}
                    <div>
                        <label htmlFor="reg-password" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                            <input
                                id="reg-password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                autoComplete="new-password"
                                required
                                className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* RUC — solo vendedor */}
                    {isVendedor && (
                        <div>
                            <label htmlFor="reg-ruc" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                                RUC <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                                <input
                                    id="reg-ruc"
                                    type="text"
                                    name="ruc"
                                    value={formData.ruc}
                                    onChange={handleChange}
                                    placeholder="11 dígitos"
                                    maxLength={11}
                                    inputMode="numeric"
                                    required
                                    className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                                />
                            </div>
                        </div>
                    )}

                    <div className={isVendedor ? 'col-span-2' : ''}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Registrando...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{labels.buttonText}</span>
                                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-rotate-10" />
                                    </>
                                )}
                            </span>
                        </button>

                        <div className="relative my-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200 dark:border-[var(--border-subtle)]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-[var(--bg-secondary)] px-3 text-slate-500 dark:text-[var(--text-secondary)]">
                                    o regístrate con
                                </span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <SocialLoginButton provider="google" />
                            <SocialLoginButton provider="facebook" />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
