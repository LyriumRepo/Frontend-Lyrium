'use client';

import { X, Check } from 'lucide-react';
import { useState } from 'react';

interface Props {
    isOpen: boolean;
    email: string;
    onClose: () => void;
    onSync: () => void;
    onOpenRegistro: () => void;
}

export default function ModalPostCompra({ isOpen, email, onClose, onSync, onOpenRegistro }: Props) {
    const [phase, setPhase] = useState<1 | 2>(1);

    if (!isOpen) return null;

    const handleSync = () => {
        onSync();
        setPhase(2);
    };

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-sm z-[20000] animate-fade-in" />

            {/* Modal */}
            <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white dark:bg-[var(--bg-card)] w-full max-w-sm shadow-2xl relative flex flex-col rounded-[2rem] overflow-hidden animate-modal-pop">

                    {/* Header */}
                    <div className="relative h-40 shrink-0 flex flex-col items-center justify-center bg-gradient-to-br from-sky-500 to-blue-700 p-6 text-center">
                        <div className="relative z-20 flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-2xl animate-bounce-slow">
                                <Check className="w-8 h-8 text-white drop-shadow-lg" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="text-2xl font-black tracking-tight text-white uppercase leading-none">
                                    {phase === 1 ? '¡Listo!' : 'Casi listo'}
                                </h3>
                                <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.3em] opacity-80">
                                    {phase === 1 ? 'Compra Exitosa' : 'Sincronización al 80%'}
                                </p>
                            </div>
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-400/20 rounded-full -ml-12 -mb-12 blur-2xl" />

                        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-white hover:bg-black/20 hover:scale-110 transition-all z-30">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="bg-white dark:bg-[var(--bg-card)] p-6">
                        {phase === 1 ? (
                            <div className="space-y-6">
                                <div className="text-center space-y-3">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest">Bóveda de Seguridad Lyrium</span>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight leading-tight">Tu compra está blindada.</h2>
                                    <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] font-medium leading-relaxed">
                                        Sincroniza tus datos ahora para activar tu panel de usuario y centralizar todos tus comprobantes digitales.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="p-3 bg-slate-50 dark:bg-[var(--bg-muted)] rounded-2xl border border-slate-100 dark:border-[var(--border-subtle)] text-center group transition-colors hover:bg-slate-100 dark:hover:bg-[var(--bg-secondary)]">
                                        <span className="text-[10px] font-bold text-slate-400 dark:text-[var(--text-muted)] uppercase tracking-widest block mb-1">Email de confirmación</span>
                                        <span className="text-sm text-gray-900 dark:text-[var(--text-primary)] font-black truncate block">{email}</span>
                                    </div>

                                    <div className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-100 dark:border-purple-800/30 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white dark:bg-[var(--bg-card)] rounded-xl flex items-center justify-center text-xl shadow-sm">💬</div>
                                        <div className="text-left">
                                            <p className="text-[10px] font-black text-gray-900 dark:text-[var(--text-primary)] uppercase">Soporte VIP 24/7</p>
                                            <p className="text-[9px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Atención prioritaria activa</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        onClick={handleSync}
                                        className="w-full py-4 rounded-2xl bg-gray-900 dark:bg-[var(--bg-secondary)] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-xl shadow-gray-200 dark:shadow-gray-900/20 hover:shadow-sky-200 dark:hover:shadow-sky-900/20 hover:-translate-y-0.5"
                                    >
                                        Sincronizar y Proteger
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="py-2 text-[10px] font-bold text-gray-400 dark:text-[var(--text-muted)] hover:text-rose-500 uppercase tracking-widest transition-all text-center"
                                    >
                                        Continuar sin proteger perfil
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-fade-in">
                                <div className="flex flex-col items-center gap-6">
                                    <div className="relative w-24 h-24">
                                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#0ea5e9" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset="56.5" className="transition-all duration-1000 ease-out" />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-4xl">⚡</span>
                                        </div>
                                        <div className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">80%</div>
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h4 className="text-2xl font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight leading-tight">¡Casi terminamos!</h4>
                                        <p className="text-sm text-gray-500 dark:text-[var(--text-muted)] font-medium leading-relaxed">
                                            Tu identidad está sincronizada al 80%. <br />
                                            <span className="text-sky-600 dark:text-[var(--brand-sky)] font-bold">Activa tu panel</span> para finalizar el proceso.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <button
                                        onClick={() => { onClose(); onOpenRegistro(); }}
                                        className="w-full py-4 rounded-2xl bg-sky-500 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-sky-600 transition-all shadow-xl shadow-sky-200 dark:shadow-sky-900/20 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                    >
                                        🪪 Reclamar mi panel de usuario
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="py-2 text-[10px] font-bold text-gray-400 dark:text-[var(--text-muted)] hover:text-gray-900 dark:hover:text-[var(--text-primary)] uppercase tracking-widest transition-all text-center"
                                    >
                                        Ir al sitio directamente
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
