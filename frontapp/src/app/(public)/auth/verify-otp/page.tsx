'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, ShieldCheck, RefreshCw, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

function VerifyOtpContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get('email') || '';

    const [code, setCode] = useState<string[]>(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
    const [cooldown, setCooldown] = useState(0);
    const [verified, setVerified] = useState(false);
    const [userType, setUserType] = useState<string | null>(null);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // Auto-focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.slice(-1);
        setCode(newCode);
        setError(null);

        // Auto-advance
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 0) return;

        const newCode = [...code];
        for (let i = 0; i < 6; i++) {
            newCode[i] = pasted[i] || '';
        }
        setCode(newCode);

        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleVerify = useCallback(async () => {
        const fullCode = code.join('');
        if (fullCode.length !== 6) {
            setError('Ingresa el código completo de 6 dígitos');
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${LARAVEL_API}/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, code: fullCode }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.attempts_remaining !== undefined) {
                    setAttemptsLeft(result.attempts_remaining);
                    setError(result.error || `Código incorrecto. Te quedan ${result.attempts_remaining} intentos.`);
                } else if (result.error?.includes('expirado') || result.error?.includes('expired')) {
                    setError('El código ha expirado. Solicita uno nuevo.');
                } else {
                    setError(result.error || result.message || 'Error al verificar el código');
                }
                setCode(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
                return;
            }

            // Success
            setVerified(true);
            setUserType(result.user_type || null);

            if (result.already_verified) {
                setSuccess('El email ya está verificado.');
            } else if (result.user_type === 'seller') {
                setSuccess('¡Tu correo fue verificado! Te notificaremos por email cuando tu tienda sea aprobada.');
            } else {
                setSuccess('¡Tu correo fue verificado! Ya puedes iniciar sesión.');
            }
        } catch {
            setError('Error de conexión con el servidor');
        } finally {
            setIsVerifying(false);
        }
    }, [code, email]);

    const handleResend = useCallback(async () => {
        if (cooldown > 0) return;

        setIsResending(true);
        setError(null);

        try {
            const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
            const response = await fetch(`${LARAVEL_API}/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (response.ok) {
                setSuccess('Se ha enviado un nuevo código a tu correo.');
                setCooldown(60);
                setCode(['', '', '', '', '', '']);
                setAttemptsLeft(null);
                inputRefs.current[0]?.focus();
                setTimeout(() => setSuccess(null), 4000);
            } else {
                setError(result.error || result.message || 'Error al reenviar el código');
            }
        } catch {
            setError('Error de conexión con el servidor');
        } finally {
            setIsResending(false);
        }
    }, [email, cooldown]);

    // Auto-submit when all 6 digits are entered
    useEffect(() => {
        if (code.every(d => d !== '') && !isVerifying && !verified) {
            handleVerify();
        }
    }, [code, isVerifying, verified, handleVerify]);

    if (!email) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] dark:bg-[var(--bg-primary)] flex items-center justify-center p-4">
                <div className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 dark:text-[var(--text-primary)] mb-2">
                        Enlace inválido
                    </h2>
                    <p className="text-slate-500 dark:text-[var(--text-secondary)] mb-6">
                        No se encontró el email para verificar.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-3 bg-sky-500 text-white rounded-xl font-semibold hover:bg-sky-600 transition-colors"
                    >
                        Volver al registro
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[var(--bg-primary)] flex items-center justify-center p-4">
            <div className="w-full max-w-[500px] bg-white dark:bg-[var(--bg-secondary)] rounded-[30px] shadow-[0_40px_100px_rgba(0,0,0,0.1)] overflow-hidden animate-fade-in">
                {/* Header gradient */}
                <div className="bg-gradient-to-br from-sky-500 via-sky-400 to-lime-400 px-8 py-10 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="gridOtp" width="20" height="20" patternUnits="userSpaceOnUse">
                                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#gridOtp)"/>
                        </svg>
                    </div>
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                            {verified ? (
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            ) : (
                                <ShieldCheck className="w-10 h-10 text-white" />
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-white mb-2">
                            {verified ? '¡Verificación Exitosa!' : 'Verificación de Correo'}
                        </h1>
                        <p className="text-white/90 text-sm">
                            {verified ? '' : (
                                <>Ingresa el código de 6 dígitos enviado a</>
                            )}
                        </p>
                        {!verified && (
                            <p className="text-white font-semibold text-sm mt-1 flex items-center justify-center gap-2">
                                <Mail className="w-4 h-4" />
                                {email}
                            </p>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 py-8">
                    {/* Error message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3 animate-fade-in">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p>{error}</p>
                                {attemptsLeft !== null && attemptsLeft > 0 && (
                                    <p className="text-xs mt-1 opacity-80">
                                        Intentos restantes: {attemptsLeft}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start gap-3 animate-fade-in">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{success}</p>
                        </div>
                    )}

                    {!verified ? (
                        <>
                            {/* OTP Input */}
                            <div className="flex justify-center gap-3 mb-8">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={index === 0 ? handlePaste : undefined}
                                        className="w-14 h-16 text-center text-2xl font-bold border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl bg-slate-50 dark:bg-[var(--bg-primary)] text-slate-900 dark:text-[var(--text-primary)] focus:outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-[var(--bg-secondary)] focus:shadow-[0_0_0_4px_rgba(14,165,233,0.15)] transition-all duration-200"
                                        aria-label={`Dígito ${index + 1}`}
                                    />
                                ))}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerify}
                                disabled={isVerifying || code.some(d => d === '')}
                                className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-3 mb-6"
                            >
                                {isVerifying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Verificando...
                                    </>
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5" />
                                        Verificar Código
                                    </>
                                )}
                            </button>

                            {/* Resend */}
                            <div className="text-center">
                                <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm mb-3">
                                    ¿No recibiste el código?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={cooldown > 0 || isResending}
                                    className="inline-flex items-center gap-2 text-sky-500 hover:text-sky-600 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isResending ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    {cooldown > 0
                                        ? `Reenviar en ${cooldown}s`
                                        : 'Reenviar código'
                                    }
                                </button>
                            </div>
                        </>
                    ) : (
                        /* Post-verification actions */
                        <div className="text-center space-y-4">
                            {userType === 'seller' ? (
                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Volver al Inicio
                                </button>
                            ) : (
                                <button
                                    onClick={() => router.push('/login')}
                                    className="w-full py-4 bg-gradient-to-r from-sky-500 to-sky-400 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] hover:shadow-[0_15px_35px_rgba(14,165,233,0.4)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-3"
                                >
                                    Iniciar Sesión
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyOtpPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#F8F9FA] dark:bg-[var(--bg-primary)] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
            </div>
        }>
            <VerifyOtpContent />
        </Suspense>
    );
}
