'use client';

import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        
        // Simular envío de email
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setLoading(false);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white dark:from-[#0a1512] dark:to-[var(--bg-secondary)] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)] mb-4">
                        ¡Revisa tu email!
                    </h1>
                    <p className="text-slate-600 dark:text-[var(--text-secondary)] mb-8">
                        Hemos enviado las instrucciones para restablecer tu contraseña a <strong>{email}</strong>
                    </p>
                    <Link 
                        href="/login"
                        className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-sky-50 to-white dark:from-[#0a1512] dark:to-[var(--bg-secondary)] flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[var(--bg-card)] rounded-3xl shadow-2xl p-10 max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-sky-500" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)]">
                        ¿Olvidaste tu contraseña?
                    </h1>
                    <p className="text-slate-600 dark:text-[var(--text-secondary)] mt-2">
                        Ingresa tu email y te enviaremos las instrucciones para restablecerla.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" aria-hidden="true" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                aria-label="Correo electrónico para restablecer contraseña"
                                required
                                className="w-full py-3.5 pl-12 pr-4 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm text-slate-700 dark:text-[var(--text-primary)] bg-slate-50 dark:bg-[var(--bg-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(66,153,225,0.1)] transition-all duration-300"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {loading ? 'Enviando...' : 'Enviar instrucciones'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link 
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-600 dark:text-[var(--text-secondary)] hover:text-sky-500 font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio de sesión
                    </Link>
                </div>
            </div>
        </div>
    );
}
