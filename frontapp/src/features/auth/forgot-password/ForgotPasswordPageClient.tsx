'use client';

import { useState, useRef, useCallback } from 'react';
import {
    Mail, ArrowLeft, CheckCircle, Lock,
    ShieldCheck, Eye, EyeOff, RefreshCw, Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useForgotPassword } from './hooks/useForgotPassword';
import type { ForgotStep } from './types';

// ─── Constantes ───────────────────────────────────────────────────────────────
const OTP_DIGITS = 6;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: Indicador de progreso
// ─────────────────────────────────────────────────────────────────────────────
const PROGRESS_STEPS: { key: ForgotStep; label: string }[] = [
    { key: 'email',    label: 'Email' },
    { key: 'otp',      label: 'Código' },
    { key: 'password', label: 'Contraseña' },
];

function ProgressIndicator({ current }: { current: ForgotStep }) {
    if (current === 'done') return null;
    const idx = PROGRESS_STEPS.findIndex((s) => s.key === current);

    return (
        <div className="fp-progress">
            {PROGRESS_STEPS.map((s, i) => (
                <div key={s.key} className="fp-progress__item">
                    <div className={`fp-progress__dot fp-progress__dot--${
                        i < idx ? 'done' : i === idx ? 'active' : 'pending'
                    }`}>
                        {i < idx ? <CheckCircle className="fp-progress__check" /> : i + 1}
                    </div>
                    <span className={`fp-progress__label ${i === idx ? 'fp-progress__label--active' : ''}`}>
                        {s.label}
                    </span>
                    {i < PROGRESS_STEPS.length - 1 && (
                        <div className={`fp-progress__line ${i < idx ? 'fp-progress__line--done' : ''}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 1: Formulario de email
// ─────────────────────────────────────────────────────────────────────────────
function StepEmail({
    isLoading,
    error,
    onSubmit,
    onClearError,
}: {
    isLoading: boolean;
    error: string | null;
    onSubmit: (email: string) => void;
    onClearError: () => void;
}) {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        onSubmit(email.trim());
    };

    return (
        <div className="fp-card fp-card--animate">
            <div className="fp-card__header">
                <div className="fp-icon-wrap fp-icon-wrap--mail">
                    <Mail className="fp-icon" />
                </div>
                <h1 className="fp-title">¿Olvidaste tu contraseña?</h1>
                <p className="fp-desc">
                    Ingresa tu email y te enviaremos un código de 6 dígitos para restablecerla.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="fp-form">
                <div className="fp-field">
                    <label htmlFor="fp-email" className="fp-label">Correo electrónico</label>
                    <div className="fp-input-wrap">
                        <Mail className="fp-input-icon" aria-hidden="true" />
                        <input
                            id="fp-email"
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); onClearError(); }}
                            placeholder="tu@email.com"
                            required
                            autoComplete="email"
                            autoFocus
                            className="fp-input"
                        />
                    </div>
                    {error && <p className="fp-error">{error}</p>}
                </div>

                <button type="submit" disabled={isLoading || !email.trim()} className="fp-btn-primary">
                    {isLoading
                        ? <><span className="fp-spinner" /> Enviando...</>
                        : 'Enviar código'}
                </button>
            </form>

            <div className="fp-footer">
                <Link href="/login" className="fp-back-link">
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio de sesión
                </Link>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 2: Verificación OTP
// ─────────────────────────────────────────────────────────────────────────────
function StepOtp({
    email,
    isLoading,
    error,
    resendCooldown,
    isResending,
    onSubmit,
    onResend,
    onBack,
    onClearError,
}: {
    email: string;
    isLoading: boolean;
    error: string | null;
    resendCooldown: number;
    isResending: boolean;
    onSubmit: (code: string) => void;
    onResend: () => void;
    onBack: () => void;
    onClearError: () => void;
}) {
    const [digits, setDigits] = useState<string[]>(Array(OTP_DIGITS).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const code = digits.join('');
    const isComplete = digits.every(Boolean);

    const handleChange = (idx: number, val: string) => {
        const clean = val.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[idx] = clean;
        setDigits(next);
        onClearError();
        if (clean && idx < OTP_DIGITS - 1) inputRefs.current[idx + 1]?.focus();
    };

    const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
        if (e.key === 'ArrowLeft'  && idx > 0)              inputRefs.current[idx - 1]?.focus();
        if (e.key === 'ArrowRight' && idx < OTP_DIGITS - 1) inputRefs.current[idx + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_DIGITS);
        const next = [...digits];
        pasted.split('').forEach((ch, i) => { next[i] = ch; });
        setDigits(next);
        const focusIdx = Math.min(pasted.length, OTP_DIGITS - 1);
        inputRefs.current[focusIdx]?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isComplete) return;
        onSubmit(code);
    };

    // Limpiar campos cuando hay error para que el usuario vuelva a escribir
    const handleResend = () => {
        setDigits(Array(OTP_DIGITS).fill(''));
        inputRefs.current[0]?.focus();
        onResend();
    };

    return (
        <div className="fp-card fp-card--animate">
            <div className="fp-card__header">
                <div className="fp-icon-wrap fp-icon-wrap--shield">
                    <ShieldCheck className="fp-icon" />
                </div>
                <h1 className="fp-title">Código de verificación</h1>
                <p className="fp-desc">
                    Ingresa el código de 6 dígitos enviado a{' '}
                    <strong className="fp-email-highlight">{email}</strong>
                </p>
            </div>

            <form onSubmit={handleSubmit} className="fp-form">
                {/* OTP inputs */}
                <div
                    className="fp-otp-row"
                    onPaste={handlePaste}
                    aria-label={`Código de ${OTP_DIGITS} dígitos`}
                >
                    {digits.map((d, i) => (
                        <input
                            key={i}
                            ref={(el) => { inputRefs.current[i] = el; }}
                            type="text"
                            inputMode="numeric"
                            pattern="\d*"
                            maxLength={1}
                            value={d}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            aria-label={`Dígito ${i + 1}`}
                            className={[
                                'fp-otp-input',
                                d       ? 'fp-otp-input--filled' : '',
                                error   ? 'fp-otp-input--error'  : '',
                            ].join(' ')}
                        />
                    ))}
                </div>

                {error && <p className="fp-error fp-error--center">{error}</p>}

                {/* Reenviar */}
                <div className="fp-resend">
                    {resendCooldown > 0 ? (
                        <span className="fp-resend__timer">
                            <Clock className="w-3.5 h-3.5" />
                            Reenviar en {resendCooldown}s
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending}
                            className="fp-resend__btn"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'fp-spin' : ''}`} />
                            {isResending ? 'Reenviando...' : 'Reenviar código'}
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!isComplete || isLoading}
                    className="fp-btn-primary"
                >
                    {isLoading
                        ? <><span className="fp-spinner" /> Verificando...</>
                        : 'Verificar código'}
                </button>
            </form>

            <div className="fp-footer">
                <button onClick={onBack} className="fp-back-link">
                    <ArrowLeft className="w-4 h-4" />
                    Cambiar email
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 3: Nueva contraseña
// ─────────────────────────────────────────────────────────────────────────────
function usePasswordStrength(password: string) {
    let score = 0;
    if (password.length >= 8)         score++;
    if (/[A-Z]/.test(password))       score++;
    if (/[0-9]/.test(password))       score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
    const colors = ['', '#ef4444', '#f97316', '#22c55e', 'var(--pd-accent)'];
    return { score, label: labels[score], color: colors[score] };
}

function StepPassword({
    isLoading,
    error,
    onSubmit,
    onClearError,
}: {
    isLoading: boolean;
    error: string | null;
    onSubmit: (password: string, passwordConfirmation: string) => void;
    onClearError: () => void;
}) {
    const [password, setPassword]         = useState('');
    const [confirm, setConfirm]           = useState('');
    const [showPass, setShowPass]         = useState(false);
    const [showConfirm, setShowConfirm]   = useState(false);
    const [localError, setLocalError]     = useState('');

    const strength = usePasswordStrength(password);
    const passwordsMatch = confirm.length > 0 && password === confirm;
    const passwordsMismatch = confirm.length > 0 && password !== confirm;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setLocalError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (password !== confirm) {
            setLocalError('Las contraseñas no coinciden');
            return;
        }
        setLocalError('');
        onSubmit(password, confirm);
    };

    const displayError = error || localError;

    return (
        <div className="fp-card fp-card--animate">
            <div className="fp-card__header">
                <div className="fp-icon-wrap fp-icon-wrap--lock">
                    <Lock className="fp-icon" />
                </div>
                <h1 className="fp-title">Nueva contraseña</h1>
                <p className="fp-desc">Elige una contraseña segura para tu cuenta.</p>
            </div>

            <form onSubmit={handleSubmit} className="fp-form">
                {/* Campo nueva contraseña */}
                <div className="fp-field">
                    <label htmlFor="fp-password" className="fp-label">Nueva contraseña</label>
                    <div className="fp-input-wrap">
                        <Lock className="fp-input-icon" aria-hidden="true" />
                        <input
                            id="fp-password"
                            type={showPass ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); onClearError(); setLocalError(''); }}
                            placeholder="Mínimo 6 caracteres"
                            required
                            minLength={6}
                            autoComplete="new-password"
                            className="fp-input fp-input--padded-right"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPass((v) => !v)}
                            className="fp-eye-btn"
                            aria-label={showPass ? 'Ocultar' : 'Mostrar'}
                        >
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Barra de fortaleza */}
                    {password && (
                        <div className="fp-strength">
                            <div className="fp-strength__bars">
                                {[1, 2, 3, 4].map((n) => (
                                    <div
                                        key={n}
                                        className="fp-strength__segment"
                                        style={{
                                            background: strength.score >= n
                                                ? strength.color
                                                : 'color-mix(in srgb, var(--text-primary) 8%, transparent)',
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="fp-strength__label" style={{ color: strength.color }}>
                                {strength.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Campo confirmar contraseña */}
                <div className="fp-field">
                    <label htmlFor="fp-confirm" className="fp-label">Confirmar contraseña</label>
                    <div className="fp-input-wrap">
                        <Lock className="fp-input-icon" aria-hidden="true" />
                        <input
                            id="fp-confirm"
                            type={showConfirm ? 'text' : 'password'}
                            value={confirm}
                            onChange={(e) => { setConfirm(e.target.value); onClearError(); setLocalError(''); }}
                            placeholder="Repite la contraseña"
                            required
                            autoComplete="new-password"
                            className={[
                                'fp-input fp-input--padded-right',
                                passwordsMismatch ? 'fp-input--mismatch' : '',
                                passwordsMatch    ? 'fp-input--match'    : '',
                            ].join(' ')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm((v) => !v)}
                            className="fp-eye-btn"
                            aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}
                        >
                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {passwordsMismatch && <p className="fp-error">Las contraseñas no coinciden</p>}
                    {passwordsMatch    && <p className="fp-ok">✓ Las contraseñas coinciden</p>}
                </div>

                {displayError && <p className="fp-error fp-error--center">{displayError}</p>}

                <button
                    type="submit"
                    disabled={isLoading || !password || !confirm || password !== confirm}
                    className="fp-btn-primary"
                >
                    {isLoading
                        ? <><span className="fp-spinner" /> Guardando...</>
                        : 'Cambiar contraseña'}
                </button>
            </form>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PASO 4: Éxito final
// ─────────────────────────────────────────────────────────────────────────────
function StepDone() {
    return (
        <div className="fp-card fp-card--animate fp-card--center">
            <div className="fp-done-circle">
                <CheckCircle className="fp-done-icon" />
            </div>
            <h1 className="fp-title" style={{ marginTop: '1.5rem' }}>¡Contraseña actualizada!</h1>
            <p className="fp-desc" style={{ marginTop: '0.5rem' }}>
                Tu contraseña ha sido cambiada correctamente. Ya puedes iniciar sesión.
            </p>
            <Link href="/login" className="fp-btn-primary" style={{ marginTop: '2rem' }}>
                Ir a iniciar sesión
            </Link>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL — ForgotPasswordPageClient
// Orquesta los pasos usando useForgotPassword()
// ─────────────────────────────────────────────────────────────────────────────
export function ForgotPasswordPageClient() {
    const {
        step,
        email,
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
    } = useForgotPassword();

    return (
        <>
            <style>{`
                /* ══ Tokens Lyrium ══════════════════════════════════════════════ */
                .fp-root {
                    --fp-bg:        var(--bg-primary);
                    --fp-card:      var(--bg-card);
                    --fp-border:    var(--border-default);
                    --fp-accent:    var(--pd-accent);
                    --fp-accent2:   var(--pd-accent2);
                    --fp-text:      var(--text-primary);
                    --fp-muted:     var(--text-secondary);
                    --fp-error:     #ef4444;
                    --fp-ok:        var(--pd-accent);

                    min-height: 100vh;
                    background: var(--fp-bg);
                    background-image:
                        radial-gradient(ellipse 60% 50% at 15% 20%, color-mix(in srgb, var(--pd-accent) 7%, transparent) 0%, transparent 65%),
                        radial-gradient(ellipse 45% 40% at 85% 80%, color-mix(in srgb, var(--pd-accent2) 5%, transparent) 0%, transparent 65%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem 1rem;
                    font-family: 'Segoe UI', system-ui, sans-serif;
                }

                /* ══ Card ═══════════════════════════════════════════════════════ */
                .fp-card {
                    background: var(--fp-card);
                    border: 1px solid var(--fp-border);
                    border-radius: 24px;
                    box-shadow:
                        0 0 0 1px var(--fp-border),
                        0 24px 60px color-mix(in srgb, var(--text-primary) 14%, transparent),
                        0 0 80px color-mix(in srgb, var(--pd-accent) 4%, transparent);
                    padding: 2.5rem 2rem;
                    width: 100%;
                    max-width: 420px;
                    position: relative;
                    overflow: hidden;
                }
                .fp-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 24px;
                    background: linear-gradient(135deg, color-mix(in srgb, var(--pd-accent) 4%, transparent) 0%, transparent 60%);
                    pointer-events: none;
                }
                .fp-card--center { text-align: center; }
                .fp-card--animate { animation: fpSlideUp .35s ease both; }

                /* ══ Card header ════════════════════════════════════════════════ */
                .fp-card__header { text-align: center; margin-bottom: 2rem; }
                .fp-icon-wrap {
                    width: 64px; height: 64px; border-radius: 18px;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 1.25rem;
                }
                .fp-icon { width: 28px; height: 28px; }
                .fp-icon-wrap--mail   { background: rgba(0,188,212,.12); color: #00bcd4; }
                .fp-icon-wrap--mail .fp-icon { color: #00bcd4; }
                .fp-icon-wrap--shield { background: rgba(0,229,160,.12); color: var(--fp-accent); }
                .fp-icon-wrap--shield .fp-icon { color: var(--fp-accent); }
                .fp-icon-wrap--lock   { background: rgba(0,229,160,.10); color: var(--fp-accent); }
                .fp-icon-wrap--lock .fp-icon   { color: var(--fp-accent); }

                .fp-title {
                    font-size: 1.4rem; font-weight: 800;
                    color: var(--fp-text); letter-spacing: -.02em; margin: 0 0 .5rem;
                }
                .fp-desc { font-size: .875rem; color: var(--fp-muted); line-height: 1.6; }
                .fp-email-highlight { color: var(--fp-accent); font-weight: 600; }

                /* ══ Form ═══════════════════════════════════════════════════════ */
                .fp-form { display: flex; flex-direction: column; gap: 1.25rem; }
                .fp-field { display: flex; flex-direction: column; gap: .4rem; }
                .fp-label {
                    font-size: .75rem; font-weight: 600; color: var(--fp-muted);
                    text-transform: uppercase; letter-spacing: .06em;
                }
                .fp-input-wrap { position: relative; }
                .fp-input-icon {
                    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
                    width: 16px; height: 16px; color: var(--fp-muted); pointer-events: none;
                }
                .fp-input {
                    width: 100%; padding: 13px 14px 13px 42px;
                    background: color-mix(in srgb, var(--text-primary) 4%, transparent);
                    border: 1.5px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
                    border-radius: 12px;
                    color: var(--fp-text); font-size: .9rem;
                    outline: none; box-sizing: border-box;
                    transition: border-color .2s, box-shadow .2s, background .2s;
                }
                .fp-input::placeholder { color: color-mix(in srgb, var(--text-primary) 20%, transparent); }
                .fp-input:focus {
                    border-color: var(--fp-accent);
                    background: color-mix(in srgb, var(--pd-accent) 5%, transparent);
                    box-shadow: 0 0 0 3px color-mix(in srgb, var(--pd-accent) 12%, transparent);
                }
                .fp-input--padded-right { padding-right: 44px; }
                .fp-input--mismatch { border-color: var(--fp-error) !important; }
                .fp-input--match    { border-color: var(--fp-ok)    !important; }

                .fp-eye-btn {
                    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
                    color: var(--fp-muted); background: none; border: none; cursor: pointer;
                    padding: 4px; display: flex; align-items: center; transition: color .2s;
                }
                .fp-eye-btn:hover { color: var(--fp-accent); }

                .fp-error { font-size: .78rem; color: var(--fp-error); }
                .fp-error--center { text-align: center; }
                .fp-ok    { font-size: .78rem; color: var(--fp-ok); }

                /* ══ Strength bar ═══════════════════════════════════════════════ */
                .fp-strength {
                    display: flex; align-items: center; gap: 8px; margin-top: 6px;
                }
                .fp-strength__bars { display: flex; gap: 4px; flex: 1; }
                .fp-strength__segment {
                    height: 4px; flex: 1; border-radius: 99px; transition: background .3s;
                }
                .fp-strength__label {
                    font-size: .72rem; font-weight: 600; min-width: 46px; text-align: right;
                }

                /* ══ OTP ════════════════════════════════════════════════════════ */
                .fp-otp-row {
                    display: flex; gap: 8px; justify-content: center; margin: .5rem 0;
                }
                .fp-otp-input {
                    width: 48px; height: 56px; text-align: center;
                    font-size: 1.3rem; font-weight: 700;
                    background: color-mix(in srgb, var(--text-primary) 4%, transparent);
                    border: 1.5px solid color-mix(in srgb, var(--text-primary) 8%, transparent);
                    border-radius: 12px; color: var(--fp-text);
                    outline: none; caret-color: var(--fp-accent);
                    transition: border-color .15s, box-shadow .15s, background .15s;
                }
                /* 6 inputs × 48px + 5 × 8px gap = 328px mínimo; en viewports angostos
                   (<420px) no cabe junto al padding del card, así que se reduce. */
                @media (max-width: 420px) {
                    .fp-card { padding: 2rem 1rem; }
                    .fp-otp-row { gap: 6px; }
                    .fp-otp-input { width: 40px; height: 48px; font-size: 1.1rem; }
                }
                @media (max-width: 340px) {
                    .fp-otp-input { width: 36px; height: 44px; font-size: 1rem; }
                }
                .fp-otp-input:focus {
                    border-color: var(--fp-accent);
                    background: color-mix(in srgb, var(--pd-accent) 5%, transparent);
                    box-shadow: 0 0 0 3px color-mix(in srgb, var(--pd-accent) 12%, transparent);
                }
                .fp-otp-input--filled {
                    border-color: color-mix(in srgb, var(--pd-accent) 35%, transparent);
                    background: color-mix(in srgb, var(--pd-accent) 6%, transparent);
                }
                .fp-otp-input--error { border-color: var(--fp-error) !important; }

                /* ══ Resend ═════════════════════════════════════════════════════ */
                .fp-resend {
                    display: flex; justify-content: center;
                    align-items: center; margin: -.25rem 0;
                }
                .fp-resend__timer {
                    display: flex; align-items: center; gap: 4px;
                    font-size: .78rem; color: var(--fp-muted);
                }
                .fp-resend__btn {
                    display: flex; align-items: center; gap: 4px;
                    font-size: .78rem; font-weight: 500; color: var(--fp-accent);
                    background: none; border: none; cursor: pointer;
                    transition: opacity .2s;
                }
                .fp-resend__btn:hover:not(:disabled) { opacity: .8; }
                .fp-resend__btn:disabled { opacity: .4; cursor: not-allowed; }

                /* ══ Botón principal ════════════════════════════════════════════ */
                .fp-btn-primary {
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    width: 100%; padding: 14px;
                    background: linear-gradient(135deg, var(--fp-accent) 0%, var(--fp-accent2) 100%);
                    color: var(--pd-accent-fg); font-size: .85rem; font-weight: 800;
                    text-transform: uppercase; letter-spacing: .08em;
                    border: none; border-radius: 12px; cursor: pointer;
                    text-decoration: none;
                    box-shadow: 0 8px 24px color-mix(in srgb, var(--pd-accent) 25%, transparent);
                    transition: transform .15s, box-shadow .15s, opacity .15s;
                }
                .fp-btn-primary:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 12px 32px color-mix(in srgb, var(--pd-accent) 35%, transparent);
                }
                .fp-btn-primary:active:not(:disabled) { transform: translateY(0); }
                .fp-btn-primary:disabled {
                    opacity: .4; cursor: not-allowed; transform: none;
                }

                /* ══ Spinner ════════════════════════════════════════════════════ */
                .fp-spinner {
                    display: inline-block;
                    width: 16px; height: 16px;
                    border: 2px solid color-mix(in srgb, var(--text-primary) 15%, transparent);
                    border-top-color: color-mix(in srgb, var(--text-primary) 50%, transparent);
                    border-radius: 50%;
                    animation: fpSpin .7s linear infinite;
                }

                /* ══ Footer ═════════════════════════════════════════════════════ */
                .fp-footer { margin-top: 1.5rem; text-align: center; }
                .fp-back-link {
                    display: inline-flex; align-items: center; gap: 6px;
                    font-size: .82rem; color: var(--fp-muted);
                    text-decoration: none; transition: color .15s;
                    background: none; border: none; cursor: pointer;
                }
                .fp-back-link:hover { color: var(--fp-accent); }

                /* ══ Done ═══════════════════════════════════════════════════════ */
                .fp-done-circle {
                    width: 80px; height: 80px;
                    background: color-mix(in srgb, var(--pd-accent) 12%, transparent); border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto;
                    animation: fpPulse 2s ease-in-out infinite;
                }
                .fp-done-icon { width: 40px; height: 40px; color: var(--fp-accent); }

                /* ══ Progress bar ═══════════════════════════════════════════════ */
                .fp-progress {
                    display: flex; align-items: flex-start; justify-content: center;
                    margin-bottom: 1.75rem;
                }
                .fp-progress__item {
                    display: flex; align-items: center; position: relative;
                    padding-bottom: 22px;
                }
                .fp-progress__dot {
                    width: 38px; height: 38px; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: .85rem; font-weight: 700; flex-shrink: 0;
                    transition: all .35s ease;
                }
                .fp-progress__check { width: 16px; height: 16px; }
                .fp-progress__dot--done {
                    background: var(--fp-accent); color: var(--pd-accent-fg);
                }
                .fp-progress__dot--active {
                    background: color-mix(in srgb, var(--pd-accent) 15%, transparent);
                    border: 2px solid var(--fp-accent); color: var(--fp-accent);
                    box-shadow: 0 0 16px color-mix(in srgb, var(--pd-accent) 30%, transparent);
                    animation: fpStepPulse .5s ease;
                }
                .fp-progress__dot--pending {
                    background: color-mix(in srgb, var(--text-primary) 5%, transparent);
                    border: 2px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
                    color: var(--fp-muted);
                }
                .fp-progress__label {
                    font-size: .7rem; color: var(--fp-muted); white-space: nowrap;
                    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
                }
                .fp-progress__label--active { color: var(--fp-accent); font-weight: 600; }
                .fp-progress__line {
                    width: 60px; height: 2.5px;
                    background: color-mix(in srgb, var(--text-primary) 8%, transparent);
                    margin: 0 4px;
                    transition: background .4s ease;
                }
                .fp-progress__line--done { background: var(--fp-accent); }

                /* ══ Animaciones ════════════════════════════════════════════════ */
                @keyframes fpSlideUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes fpSpin { to { transform: rotate(360deg); } }
                @keyframes fpPulse {
                    0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--pd-accent) 20%, transparent); }
                    50%      { box-shadow: 0 0 0 14px color-mix(in srgb, var(--pd-accent) 0%, transparent); }
                }
                @keyframes fpStepPulse {
                    0%   { transform: scale(.85); }
                    50%  { transform: scale(1.15); }
                    100% { transform: scale(1); }
                }
                .fp-spin { animation: fpSpin 1s linear infinite; }
            `}</style>

            <div className="fp-root">
                <ProgressIndicator current={step} />

                {step === 'email' && (
                    <StepEmail
                        isLoading={isLoading}
                        error={error}
                        onSubmit={sendCode}
                        onClearError={clearError}
                    />
                )}

                {step === 'otp' && (
                    <StepOtp
                        email={email}
                        isLoading={isLoading}
                        error={error}
                        resendCooldown={resendCooldown}
                        isResending={isResending}
                        onSubmit={verifyCode}
                        onResend={resendCode}
                        onBack={goBack}
                        onClearError={clearError}
                    />
                )}

                {step === 'password' && (
                    <StepPassword
                        isLoading={isLoading}
                        error={error}
                        onSubmit={changePassword}
                        onClearError={clearError}
                    />
                )}

                {step === 'done' && <StepDone />}
            </div>
        </>
    );
}