import React from 'react';
import Icon from '@/components/ui/Icon';

interface SalesLegendModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SalesLegendModal({ isOpen, onClose }: SalesLegendModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[100000] flex justify-center items-center p-4 lg:p-6 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[var(--bg-secondary)] w-full max-w-xl max-h-[88vh] rounded-3xl overflow-hidden shadow-2xl border border-white/20 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-[#1A3A2A] dark:to-[#2A4A3A] px-5 py-4 text-white flex-shrink-0 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                            <Icon name="BookOpen" className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black leading-none">Leyenda</h3>
                            <p className="text-[9px] font-semibold text-emerald-100 uppercase tracking-widest mt-0.5">
                                Tipos de envío, atención y estados
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all"
                    >
                        <Icon name="X" className="w-4 h-4 text-white" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto space-y-6">
                    {/* Sección 1 + 2 en dos columnas */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Tipos de envío */}
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                                Envío · Productos
                            </h4>
                            <div className="space-y-2">
                                <div className="p-3 rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                    <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">1. Entrega a domicilio</p>
                                    <p className="text-[11px] text-gray-500 dark:text-[var(--text-muted)] mt-0.5 leading-snug">
                                        El pedido llega hasta la puerta de tu casa.
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                    <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">2. Recojo en agencia</p>
                                    <p className="text-[11px] text-gray-500 dark:text-[var(--text-muted)] mt-0.5 leading-snug">
                                        Recoge en la agencia del operador logístico.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Tipos de atención */}
                        <section className="space-y-3">
                            <h4 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                                Atención · Servicios
                            </h4>
                            <div className="space-y-2">
                                <div className="p-3 rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                    <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">1. A domicilio</p>
                                    <p className="text-[11px] text-gray-500 dark:text-[var(--text-muted)] mt-0.5 leading-snug">
                                        El especialista acude a tu domicilio.
                                    </p>
                                </div>
                                <div className="p-3 rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                    <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">2. En sede</p>
                                    <p className="text-[11px] text-gray-500 dark:text-[var(--text-muted)] mt-0.5 leading-snug">
                                        Acudes presencialmente a recibir el servicio.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Estados en 2 columnas */}
                    <section className="space-y-3">
                        <h4 className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">
                            Estados
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { title: 'Validado', desc: 'El vendedor o centro de salud validó el pedido.' },
                                { title: 'Despachado', desc: 'El pedido terminó su preparación.' },
                                { title: 'En transporte / en camino', desc: 'El pedido fue enviado o el especialista está en camino.' },
                                { title: 'En domicilio', desc: 'El pedido llegó al domicilio y espera confirmación.' },
                                { title: 'Listo para recojo', desc: 'El pedido está listo para recoger en agencia.' },
                                { title: 'Confirmación pendiente', desc: 'Espera confirmación final del cliente o paciente.' },
                            ].map(({ title, desc }) => (
                                <div key={title} className="p-3 rounded-xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                    <p className="text-xs font-bold text-gray-800 dark:text-[var(--text-primary)]">{title}</p>
                                    <p className="text-[11px] text-gray-500 dark:text-[var(--text-muted)] mt-0.5 leading-snug">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="flex justify-center pt-1">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-[var(--bg-muted)] text-slate-700 dark:text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-[#2A3F33] transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
