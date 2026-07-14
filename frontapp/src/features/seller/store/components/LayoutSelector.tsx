'use client';

import React, { useState } from 'react';
import { ShopConfig } from '@/features/seller/store/types';
import StorePreviewModal from './StorePreviewModal';
import Icon from '@/components/ui/Icon';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import PlanUpgradeMessage from './PlanUpgradeMessage';

const layouts = [
    {
        id: '1',
        name: 'Plantilla 1',
        desc: 'Columna única • Ancho completo',
        preview: (
            <>
                <div className="flex gap-0.5 h-4">
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                <div className="text-[6px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Productos</div>
                <div className="flex-1 grid grid-cols-5 gap-0.5">
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                </div>
                <div className="flex-1 grid grid-cols-5 gap-0.5">
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                </div>
                <div className="flex gap-0.5 h-4">
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                <div className="text-[6px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Servicios</div>
                <div className="flex-1 grid grid-cols-5 gap-0.5">
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                </div>
                <div className="flex-1 grid grid-cols-5 gap-0.5">
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                </div>
            </>
        )
    },
    {
        id: '2',
        name: 'Plantilla 2',
        desc: 'Laterales alternados • Simétrico',
        preview: (
            <>
                <div className="flex gap-0.5 h-4">
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: '18% 1fr', gridTemplateRows: '1fr 1fr' }}>
                    <div className="grid grid-rows-2 gap-0.5" style={{ gridRow: '1 / span 2', gridColumn: '1' }}>
                        <div className="w-full h-full bg-sky-500/60 dark:bg-emerald-700/60 rounded flex items-center justify-center text-[6px] font-bold text-white overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Banner
                        </div>
                        <div className="w-full h-full bg-sky-500/60 dark:bg-emerald-700/60 rounded flex items-center justify-center text-[6px] font-bold text-white overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Banner
                        </div>
                    </div>
                    <div className="grid grid-cols-4 gap-0.5" style={{ gridRow: '1', gridColumn: '2' }}>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    </div>
                    <div className="grid grid-cols-4 gap-0.5" style={{ gridRow: '2', gridColumn: '2' }}>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    </div>
                </div>
                <div className="flex gap-0.5 h-4">
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: '1fr 18%' }}>
                    <div className="grid grid-rows-2 gap-0.5">
                      <div className="grid grid-cols-4 gap-0.5">
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                      </div>
                      <div className="grid grid-cols-4 gap-0.5">
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                          <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                      </div>
                    </div>
                    <div className="w-full h-full bg-sky-500/60 dark:bg-emerald-700/60 rounded flex items-center justify-center text-[6px] font-bold text-white overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                        Banner
                    </div>
                </div>
            </>
        )
    },
    {
        id: '3',
        name: 'Plantilla 3',
        desc: 'Banners extremos • Simétrico horizontal',
        preview: (
            <>
                <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: '18% 1fr 18%', gridTemplateRows: '1fr 1fr' }}>
                    <div className="grid grid-rows-2 gap-0.5" style={{ gridRow: '1 / span 2', gridColumn: '1' }}>
                        <div className="w-full h-full bg-sky-500/60 dark:bg-emerald-700/60 rounded flex items-center justify-center text-[6px] font-bold text-white overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Banner
                        </div>
                        <div className="w-full h-full bg-sky-500/60 dark:bg-emerald-700/60 rounded flex items-center justify-center text-[6px] font-bold text-white overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Banner
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-0.5" style={{ gridRow: '1', gridColumn: '2' }}>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    </div>
                    <div className="grid grid-rows-2 gap-0.5" style={{ gridRow: '1 / span 2', gridColumn: '3' }}>
                        <div className="w-full h-full bg-sky-500/60 dark:bg-emerald-700/60 rounded flex items-center justify-center text-[6px] font-bold text-white overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Banner
                        </div>
                        <div className="w-full h-full bg-sky-500/60 dark:bg-emerald-700/60 rounded flex items-center justify-center text-[6px] font-bold text-white overflow-hidden" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                            Banner
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-0.5" style={{ gridRow: '2', gridColumn: '2' }}>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                        <div className="w-full h-full bg-teal-400/60 dark:bg-teal-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">P</div>
                    </div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                <div className="flex gap-0.5 h-4">
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                    <div className="flex-1 bg-sky-500/80 dark:bg-emerald-700/80 rounded flex items-center justify-center text-[6px] font-bold text-white">Banner</div>
                </div>
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                <div className="flex-1 grid grid-rows-2 gap-0.5">
                    <div className="grid grid-cols-5 gap-0.5">
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    </div>
                    <div className="grid grid-cols-5 gap-0.5">
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                        <div className="w-full h-full bg-rose-400/60 dark:bg-rose-600/60 rounded flex items-center justify-center text-[6px] font-bold text-white">S</div>
                    </div>
                </div>
            </>
        )
    }
];

interface LayoutSelectorProps {
    config: ShopConfig;
    updateConfig: (updates: Partial<ShopConfig>) => void;
    storeId?: number | null;
}

export default function LayoutSelector({ config, updateConfig, storeId }: LayoutSelectorProps) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { planSlug } = usePlanCapabilities();
    const isEmprende = planSlug === 'emprende';

    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-4 sm:mb-6 md:mb-8 animate-fadeIn">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 md:p-8 flex flex-wrap items-center justify-between gap-y-3 relative overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-5 text-white relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner flex-shrink-0">
                        <Icon name="Palette" className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Personalización Visual</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Define la estructura y estética de tu escaparate digital
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="relative z-10 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-[var(--bg-card)] backdrop-blur-md text-[var(--text-primary)] border border-[var(--border-subtle)] font-black text-[10px] uppercase tracking-widest hover:text-sky-500 dark:hover:text-[var(--icons-green)] transition-all shadow-lg active:scale-95"
                >
                    <Icon name="Eye" className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Visualizar Tienda</span>
                    <span className="sm:hidden">Preview</span>
                </button>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-8">
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                    {isEmprende && (
                        <PlanUpgradeMessage
                            message="Tu plan Emprende incluye un diseño exclusivo no personalizable. Actualiza tu plan para acceder a más opciones de personalización."
                        />
                    )}

                    <div className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 mb-2 ml-1">
                            <Icon name="MousePointerClick" className="text-sky-500 dark:text-[var(--icons-green)] w-4 h-4" />
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                Selecciona una estructura
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
                            {layouts.map(layout => (
                                <label
                                    htmlFor={`layout-${layout.id}`}
                                    key={layout.id}
                                    className={isEmprende ? 'cursor-not-allowed group' : 'cursor-pointer group'}
                                    aria-label={`Seleccionar diseño ${layout.name}`}
                                >
                                    <input
                                        id={`layout-${layout.id}`}
                                        type="radio"
                                        name="layout"
                                        value={layout.id}
                                        checked={config.layout === layout.id}
                                        onChange={e => updateConfig({ layout: e.target.value as any })}
                                        className="sr-only peer"
                                        disabled={isEmprende}
                                    />
                                    <div className={`p-4 sm:p-5 md:p-6 rounded-[2rem] sm:rounded-[2.5rem] border-2 bg-[var(--bg-card)] transition-all relative overflow-hidden ${
                                        isEmprende
                                            ? 'border-[var(--border-subtle)] opacity-40'
                                            : 'border-[var(--border-subtle)] hover:border-sky-500/30 dark:hover:border-emerald-500/30 hover:shadow-lg peer-checked:border-sky-500 dark:peer-checked:border-[var(--icons-green)] peer-checked:shadow-2xl peer-checked:shadow-sky-500/20 dark:peer-checked:shadow-emerald-500/30 peer-checked:-translate-y-1'
                                    }`}>
                                        {isEmprende && (
                                            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[1px]">
                                                <img src="/img/LyriumEspecial.png" alt="Bloqueado" className="w-16 h-16 mb-2 object-contain" />
                                                <span className="text-[9px] font-black text-[var(--lima-500)] uppercase tracking-widest text-center px-4">
                                                    Disponible en planes superiores
                                                </span>
                                            </div>
                                        )}
                                        <div className="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/10 rounded-bl-[3rem] sm:rounded-bl-[4rem] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center pl-4 pb-4 sm:pl-6 sm:pb-6">
                                            <Icon name="Check" className="text-sky-500 w-5 h-5 sm:w-6 sm:h-6" />
                                        </div>
                                        <div className="w-full h-32 sm:h-36 md:h-40 bg-[var(--bg-secondary)] rounded-xl p-1.5 mb-3 sm:mb-4 border border-[var(--border-subtle)] flex flex-col gap-0.5">
                                            {layout.preview}
                                        </div>
                                        <p className="text-[11px] font-black uppercase text-[var(--text-secondary)] peer-checked:text-[var(--text-primary)] tracking-tight text-center transition-colors">
                                            {layout.name}
                                        </p>
                                        <p className="text-[9px] font-bold text-[var(--text-secondary)] uppercase mt-1 text-center transition-colors">
                                            {layout.desc}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <StorePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                layoutId={config.layout}
                config={config}
                storeId={storeId ?? null}
            />
        </div>
    );
}