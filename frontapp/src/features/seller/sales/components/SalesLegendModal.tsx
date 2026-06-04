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
                className="bg-white dark:bg-[var(--bg-secondary)] w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 dark:from-[#2A4A3A] dark:via-[#1A3A32] dark:to-[#2A4A3A] p-6 text-white relative flex-shrink-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Icon name="BookOpen" className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tighter leading-none">Leyenda</h3>
                                <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-[0.2em] mt-1">
                                    Tipos de envío, atención y estados
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all"
                        >
                            <Icon name="X" className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                <div className="p-6 lg:p-8 overflow-y-auto space-y-8">
                    {/* ── SECCIÓN 1: Tipos de envío para productos ── */}
                    <section className="space-y-4">
                        <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                            Tipos de envío para productos
                        </h4>

                        <div className="grid gap-4">
                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">1. Entrega a domicilio</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Si deseas que tu pedido llegue hasta la puerta de tu casa.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">2. Recojo en agencia</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Si deseas recoger tu pedido en la agencia del operador logístico designado por la tienda correspondiente.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">3. Recojo en sucursal</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Si deseas acudir presencialmente a la tienda correspondiente.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── SECCIÓN 2: Tipos de atención para servicios ── */}
                    <section className="space-y-4">
                        <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                            Tipos de atención para servicios
                        </h4>

                        <div className="grid gap-4">
                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">1. Atención a domicilio</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Si deseas que el especialista asignado para el servicio acuda a tu domicilio.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">2. Atención en sede</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Si deseas acudir presencialmente a recibir tu servicio.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── SECCIÓN 3: Estados ── */}
                    <section className="space-y-4">
                        <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                            Estados
                        </h4>

                        <div className="grid gap-4">
                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Validado por vendedor o centro de salud</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    El vendedor o centro de salud validó su pedido.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Despachado</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Su pedido de producto terminó su preparación.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">En transporte o en camino</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Su pedido de producto o servicio ya fue enviado o el especialista está en camino.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">En domicilio</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Su pedido de producto llegó al domicilio y espera confirmación.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Listo para recojo</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    Su pedido está listo para recojo en agencia o sucursal.
                                </p>
                            </div>

                            <div className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50">
                                <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">Confirmación cliente/paciente</p>
                                <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">
                                    El pedido o servicio espera confirmación final para completarse.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-[var(--bg-muted)] text-slate-700 dark:text-[var(--text-primary)] font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-[#2A3F33] transition-all"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
