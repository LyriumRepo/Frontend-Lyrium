'use client';

import { useState, useEffect } from 'react';
import { Loader2, FileSearch, ShieldCheck, Sparkles } from 'lucide-react';

interface RegistroLoadingModalProps {
    open: boolean;
}

interface Fase {
    icon: React.ElementType;
    titulo: string;
    mensajes: string[];
}

// ─── Fases del proceso ────────────────────────────────────────────────────────
// Fase 1 (0–6s):  inicio — validando datos y consultando SUNAT
// Fase 2 (6–16s): intermedio — analizando evidencia comercial
// Fase 3 (16s+):  cierre — casi listo, generando resultado
const FASES: Fase[] = [
    {
        icon: FileSearch,
        titulo: 'Verificando tu información',
        mensajes: [
            'Estamos validando tu información, solo toma un momento...',
            'Verificando que tus datos estén correctos...',
            'Confirmando el estado de tu empresa, por favor espera...',
        ],
    },
    {
        icon: ShieldCheck,
        titulo: 'Analizando tu evidencia comercial',
        mensajes: [
            'Esto puede tomar unos segundos, gracias por tu paciencia 🙂',
            'Estamos revisando que todo encaje con el rubro de bienestar y salud...',
            'Estamos evaluando tu empresa...',
        ],
    },
    {
        icon: Sparkles,
        titulo: 'Ya casi terminamos',
        mensajes: [
            'Estamos preparando el resultado de tu solicitud...',
            'Un poco más, ya falta poco...',
            'Gracias por confiar en nosotros, esto no demora mucho más.',
        ],
    },
];

const TIEMPOS_FASE = [6000, 10000]; // ms: cuándo pasar de fase 1→2 y 2→3
const INTERVALO_MENSAJE = 3500;     // ms: cada cuánto cambia el mensaje dentro de una fase

export function RegistroLoadingModal({ open }: RegistroLoadingModalProps) {
    const [faseIdx, setFaseIdx] = useState(0);
    const [mensajeIdx, setMensajeIdx] = useState(0);

    useEffect(() => {
        if (!open) {
            setFaseIdx(0);
            setMensajeIdx(0);
            return;
        }

        const timers: ReturnType<typeof setTimeout>[] = [];

        // Avanzar de fase según los tiempos definidos
        TIEMPOS_FASE.forEach((tiempo, i) => {
            timers.push(setTimeout(() => {
                setFaseIdx(i + 1);
                setMensajeIdx(0);
            }, tiempo));
        });

        // Rotar mensajes dentro de cada fase
        const interval = setInterval(() => {
            setMensajeIdx(prev => (prev + 1) % 3);
        }, INTERVALO_MENSAJE);

        return () => {
            timers.forEach(clearTimeout);
            clearInterval(interval);
        };
    }, [open]);

    if (!open) return null;

    const fase = FASES[faseIdx];
    const Icon = fase.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-3xl shadow-2xl max-w-sm w-[90%] mx-4 p-8 flex flex-col items-center text-center">

                {/* Ícono animado */}
                <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-sky-100 dark:bg-[var(--bg-primary)] animate-ping opacity-50" />
                    <div className="relative w-20 h-20 rounded-full bg-sky-50 dark:bg-[var(--bg-primary)] flex items-center justify-center text-sky-500 dark:text-[var(--icons-green)] border-2 border-sky-100 dark:border-[var(--border-subtle)]">
                        <Icon className="w-9 h-9" />
                    </div>
                </div>

                {/* Título de la fase */}
                <h3 className="text-lg font-black text-slate-900 dark:text-[var(--text-primary)] mb-2 transition-all duration-300">
                    {fase.titulo}
                </h3>

                {/* Mensaje rotativo */}
                <p key={`${faseIdx}-${mensajeIdx}`} className="text-sm text-slate-500 dark:text-[var(--text-secondary)] min-h-[40px] animate-in fade-in duration-300">
                    {fase.mensajes[mensajeIdx]}
                </p>

                {/* Indicador de progreso por fases */}
                <div className="flex items-center gap-2 mt-6">
                    {FASES.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                                i === faseIdx
                                    ? 'w-8 bg-sky-500 dark:bg-[var(--icons-green)]'
                                    : i < faseIdx
                                        ? 'w-4 bg-sky-300 dark:bg-[var(--icons-green)]/50'
                                        : 'w-4 bg-slate-200 dark:bg-[var(--border-subtle)]'
                            }`}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-2 mt-5 text-xs text-slate-400 dark:text-[var(--text-secondary)]">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    No cierres ni recargues esta ventana
                </div>
            </div>
        </div>
    );
}
