'use client';

import React, { useState } from 'react';
import { ShopConfig } from '@/features/seller/store/types';
import StorePreviewModal from './StorePreviewModal';
import Icon from '@/components/ui/Icon';

const layouts = [
    {
        id: '1',
        name: 'Plantilla 1',
        desc: 'Bloques Alternos Verticales',
        preview: (
            <>
                <div className="w-full h-4 bg-rose-500 rounded flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Banner Principal
                </div>
                <div className="flex gap-0.5 h-4">
                    <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                    <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                    <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                </div>
                <div className="flex gap-0.5 h-8">
                    <div className="w-1/4 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center text-[6px] font-bold text-emerald-600 text-center leading-tight">
                        Scroll<br />Vertical
                    </div>
                    <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-center text-[7px] font-bold text-indigo-600">
                        Scroll Horizontal →
                    </div>
                </div>
                <div className="flex gap-0.5 h-8">
                    <div className="flex-1 bg-indigo-50 border border-indigo-100 rounded flex items-center justify-center text-[7px] font-bold text-indigo-600">
                        Scroll Horizontal →
                    </div>
                    <div className="w-1/5 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center text-[6px] font-bold text-emerald-600 text-center leading-tight">
                        Scroll<br />Vertical
                    </div>
                </div>
            </>
        )
    },
    {
        id: '2',
        name: 'Plantilla 2',
        desc: 'Banners Centrales',
        preview: (
            <>
                <div className="w-full h-4 bg-rose-500 rounded flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Banner Principal
                </div>
                <div className="flex gap-0.5 h-12">
                    <div className="w-1/5 flex flex-col gap-0.5">
                        <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                        <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                        <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                    </div>
                    <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center text-[7px] font-bold text-emerald-600 uppercase">
                        Scroll Productos (3 Filas) →
                    </div>
                </div>
                <div className="flex gap-0.5 h-4">
                    <div className="flex-1 bg-orange-100 border border-orange-200 rounded flex items-center justify-center text-[7px] font-bold text-orange-700">Publi 1</div>
                    <div className="flex-1 bg-orange-100 border border-orange-200 rounded flex items-center justify-center text-[7px] font-bold text-orange-700">Publi 2</div>
                </div>
            </>
        )
    },
    {
        id: '3',
        name: 'Plantilla 3',
        desc: 'Laterales + Bloques Inferiores',
        preview: (
            <>
                <div className="w-full h-4 bg-rose-500 rounded flex items-center justify-center text-[7px] font-bold text-white uppercase tracking-wider shadow-sm">
                    Banner Principal
                </div>
                <div className="flex gap-0.5 h-10">
                    <div className="w-1/5 flex flex-col gap-0.5">
                        <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                        <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                    </div>
                    <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center text-[7px] font-bold text-emerald-600 uppercase">
                        Scroll Productos →
                    </div>
                    <div className="w-1/5 flex flex-col gap-0.5">
                        <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                        <div className="flex-1 bg-amber-100 border border-amber-200 rounded flex items-center justify-center text-[7px] font-bold text-amber-600">P</div>
                    </div>
                </div>
                <div className="flex-1 bg-emerald-50 border border-emerald-100 rounded flex items-center justify-center text-[7px] font-bold text-emerald-600 uppercase">
                    Scroll Productos (Categoría Grande) →
                </div>
            </>
        )
    }
];

interface LayoutSelectorProps {
    config: ShopConfig;
    updateConfig: (updates: Partial<ShopConfig>) => void;
}

export default function LayoutSelector({ config, updateConfig }: LayoutSelectorProps) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-5 text-white relative z-10">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner">
                        <Icon name="Palette" className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none">Personalización Visual</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Define la estructura y estética de tu escaparate digital
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="relative z-10 flex items-center gap-3 px-6 py-3 rounded-2xl bg-[var(--bg-card)] backdrop-blur-md text-[var(--text-primary)] border border-[var(--border-subtle)] font-black text-[10px] uppercase tracking-widest hover:text-sky-500 transition-all shadow-lg active:scale-95"
                >
                    <Icon name="Eye" className="w-5 h-5" />
                    <span>Visualizar Tienda</span>
                </button>
            </div>

            <div className="p-8">
                <div className="space-y-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2 ml-1">
                            <Icon name="MousePointerClick" className="text-sky-500 w-4 h-4" />
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">Selecciona una estructura</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {layouts.map(layout => (
                                <label htmlFor={`layout-${layout.id}`} key={layout.id} className="cursor-pointer group" aria-label={`Seleccionar diseño ${layout.name}`}>
                                    <input
                                        id={`layout-${layout.id}`}
                                        type="radio"
                                        name="layout"
                                        value={layout.id}
                                        checked={config.layout === layout.id}
                                        onChange={e => updateConfig({ layout: e.target.value as any })}
                                        className="sr-only peer"
                                    />
                                    <div className="p-6 rounded-[2.5rem] border-2 border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-sky-500/30 hover:shadow-lg peer-checked:border-sky-500 peer-checked:shadow-2xl peer-checked:shadow-sky-500/20 peer-checked:-translate-y-1 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-bl-[4rem] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center pl-6 pb-6">
                                            <Icon name="Check" className="text-sky-500 w-6 h-6" />
                                        </div>
                                        <div className="w-full h-40 bg-[var(--bg-secondary)] rounded-xl p-1.5 mb-4 border border-[var(--border-subtle)] flex flex-col gap-0.5">
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
            />
        </div>
    );
}
