import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';

interface ServicesGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ServicesGuideModal({ isOpen, onClose }: ServicesGuideModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!isOpen || !mounted) return null;

    const modalRoot = document.getElementById('modal-root');
    if (!modalRoot) return null;

    return createPortal(
        <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[100000] flex justify-center items-center p-4 lg:p-6 animate-fadeIn"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-[var(--bg-secondary)] w-full max-w-2xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-[-40px_0_100px_rgba(0,0,0,0.1)] border border-white/20 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-300 dark:from-[#2A4A3A] dark:via-[#1A3A32] dark:to-[#2A4A3A] p-6 text-white relative flex-shrink-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                    <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-inner">
                                <Icon name="Image" className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tighter leading-none">Guía de Imágenes</h3>
                                <p className="text-[9px] font-bold text-emerald-100 uppercase tracking-[0.2em] mt-1">
                                    Buenas prácticas para tus servicios
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

                {/* ── Contenido ── */}
                <div className="p-6 lg:p-8 overflow-y-auto space-y-8">

                    {/* Sección 1: Qué hacer */}
                    <section className="space-y-4">
                        <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                            Qué hacer
                        </h4>
                        <div className="grid gap-3">
                            {[
                                {
                                    title: '1. Fondo blanco exclusivamente',
                                    desc: 'Usa fondo blanco puro (#FFFFFF). Sin grises claros, neutros ni fondos distractores. El servicio debe ser el centro visual.',
                                },
                                {
                                    title: '2. Muestra la acción del servicio',
                                    desc: 'La imagen debe representar el servicio en ejecución: el especialista trabajando, el proceso o el resultado final. Evita imágenes genéricas que no comuniquen claramente lo que se ofrece.',
                                },
                                {
                                    title: '3. Formato cuadrado 400×400 px',
                                    desc: 'La imagen principal del servicio se muestra en 400×400 píxeles. Usa imágenes de al menos 800×800 px para buena calidad en retina. Formatos: JPG, PNG o WebP (máx 2 MB).',
                                },
                                {
                                    title: '4. Recomendación: usa un diseñador gráfico',
                                    desc: 'Para resultados óptimos, trabaja con un diseñador profesional que pueda crear imágenes que comuniquen visualmente el valor de tu servicio sin generar confusión.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-4 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-muted)]/50"
                                >
                                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">{item.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Sección 2: Qué evitar */}
                    <section className="space-y-4">
                        <h4 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase tracking-widest">
                            Qué evitar
                        </h4>
                        <div className="grid gap-3">
                            {[
                                {
                                    title: 'Texto excesivo sobre la imagen',
                                    desc: 'No agregues marcas de agua, precios o promociones directamente en la foto. Esta información se gestiona desde los campos del formulario.',
                                },
                                {
                                    title: 'Imágenes borrosas o de baja calidad',
                                    desc: 'Las fotos pixeladas o desenfocadas generan desconfianza y reducen la intención de contratación del servicio.',
                                },
                                {
                                    title: 'Imágenes ambiguas o que no reflejan el servicio',
                                    desc: 'Evita fotos que puedan interpretarse de múltiples formas. La imagen debe comunicar de inmediato qué servicio se ofrece: la acción, el entorno o el resultado esperado.',
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="p-4 rounded-2xl border border-rose-100 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20"
                                >
                                    <p className="font-black text-gray-800 dark:text-[var(--text-primary)]">{item.title}</p>
                                    <p className="text-sm text-gray-600 dark:text-[var(--text-muted)] mt-1">{item.desc}</p>
                                </div>
                            ))}
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
        </div>,
        modalRoot,
    );
}