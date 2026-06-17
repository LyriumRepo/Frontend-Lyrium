'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, XCircle, Mail, Loader2 } from 'lucide-react';
import type { RpaResultado } from '../types/auth';

interface ResultadoRegistroProps {
    resultado: RpaResultado;
    correo: string;
    onVolver: () => void;
}

const RPA_API = process.env.NEXT_PUBLIC_RPA_API_URL || 'http://localhost:3001';

const CONFIG: Record<RpaResultado['estado'], {
    icon: React.ElementType;
    color: string;
    bg: string;
    titulo: string;
    comentario: string;
}> = {
    ACEPTADO: {
        icon: CheckCircle2,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
        titulo: '¡Tu tienda fue aprobada!',
        comentario: 'Cumples con los requisitos del marketplace. Tu tienda ya está registrada y será revisada por nuestro equipo antes de publicarse.',
    },
    REVISION: {
        icon: Clock,
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
        titulo: 'Tu solicitud está en revisión',
        comentario: 'Algunos datos requieren validación manual por nuestro equipo. Te notificaremos por correo cuando tengamos una respuesta.',
    },
    RECHAZADO: {
        icon: XCircle,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
        titulo: 'Tu solicitud no fue aprobada',
        comentario: 'No cumples con uno o más requisitos del marketplace para la categoría de bienestar y salud. Puedes corregir los datos y volver a intentarlo.',
    },
};

export function ResultadoRegistro({ resultado, correo, onVolver }: ResultadoRegistroProps) {
    const [enviando, setEnviando] = useState(false);
    const [enviado, setEnviado] = useState(false);
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

    const cfg = CONFIG[resultado.estado];
    const Icon = cfg.icon;

    const handleEnviarDiagnostico = async () => {
        if (!resultado.application_id) return;
        setEnviando(true);
        setErrorEnvio(null);

        try {
            const response = await fetch(`${RPA_API}/enviar-diagnostico`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ application_id: resultado.application_id, correo }),
            });
            const data = await response.json();

            if (!response.ok) {
                setErrorEnvio(data.error || 'No se pudo enviar el diagnóstico.');
            } else {
                setEnviado(true);
            }
        } catch {
            setErrorEnvio('No se pudo conectar con el servicio. Intenta más tarde.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full w-[90%] mx-auto text-center">
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 border-2 ${cfg.bg}`}>
                <Icon className={`w-10 h-10 ${cfg.color}`} />
            </div>

            <h3 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)] mb-2">
                {cfg.titulo}
            </h3>

            <p className="text-slate-500 dark:text-[var(--text-secondary)] text-sm mb-6 max-w-md">
                {cfg.comentario}
            </p>

            {/* Sin diagnóstico detallado a propósito — solo el comentario general */}

            <div className="w-full max-w-sm space-y-3">
                {!enviado ? (
                    <button
                        type="button"
                        onClick={handleEnviarDiagnostico}
                        disabled={enviando}
                        className="w-full py-3.5 flex items-center justify-center gap-2 border-2 border-slate-200 dark:border-[var(--border-subtle)] rounded-xl text-sm font-semibold text-slate-700 dark:text-[var(--text-primary)] hover:border-sky-500 dark:hover:border-[var(--icons-green)] transition-all disabled:opacity-60"
                    >
                        {enviando ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Mail className="w-4 h-4" />
                                Enviar diagnóstico completo a mi correo
                            </>
                        )}
                    </button>
                ) : (
                    <div className="w-full py-3.5 flex items-center justify-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm font-semibold text-green-600 dark:text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Diagnóstico enviado a {correo}
                    </div>
                )}

                {errorEnvio && (
                    <p className="text-xs text-red-500 font-medium">{errorEnvio}</p>
                )}

                <button
                    type="button"
                    onClick={onVolver}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-400 dark:from-[#1A3A32] dark:to-[var(--brand-green)] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-[0_10px_25px_rgba(14,165,233,0.3)] dark:shadow-[0_10px_25px_rgba(74,124,89,0.3)] transition-all duration-300"
                >
                    Volver al inicio
                </button>
            </div>
        </div>
    );
}
