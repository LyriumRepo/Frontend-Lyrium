'use client';

import React from 'react';
import { ShopConfig } from '@/features/seller/store/types';
import Icon from '@/components/ui/Icon';
import { CategoryResource } from '@/shared/lib/api/categoryRepository';

interface StoreIdentityProps {
    config: ShopConfig;
    updateConfig: (updates: Partial<ShopConfig>) => void;
    categories?: CategoryResource[];
}

export default function StoreIdentity({ config, updateConfig, categories = [] }: StoreIdentityProps) {
    return (
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-4 sm:mb-6 md:mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-300 dark:from-[var(--brand-green)] dark:to-[#1A3A32] p-4 sm:p-6 md:p-8 flex flex-wrap items-center justify-between gap-y-3 relative overflow-hidden">
                <div className="flex items-center gap-3 sm:gap-5 text-white relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner flex-shrink-0">
                        <Icon name="Building" className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black tracking-tighter leading-none">Sobre Nosotros</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Identidad, historia y descripción de tu empresa
                        </p>
                    </div>
                </div>
                <div className="relative z-10">
                    <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-black/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                        Perfil Corporativo
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 sm:p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 md:gap-8">
                    {/* Left: Basic fields */}
                    <div className="lg:col-span-4 space-y-4 sm:space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="store-name" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Icon name="Building" className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" /> Nombre <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="store-name"
                                    type="text"
                                    value={config.name}
                                    onChange={e => updateConfig({ name: e.target.value })}
                                    className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="store-category" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Icon name="Tag" className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" /> Categoría <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    id="store-category"
                                    value={config.category || ''}
                                    onChange={e => updateConfig({ category: e.target.value })}
                                    className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="store-activity" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Icon name="Briefcase" className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" /> Actividad <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="store-activity"
                                    type="text"
                                    value={config.activity}
                                    onChange={e => updateConfig({ activity: e.target.value })}
                                    className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right: Description */}
                    <div className="lg:col-span-8 space-y-4 sm:space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="store-description" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                <Icon name="Building2" className="w-3 h-3 text-sky-500 dark:text-[var(--icons-green)]" />
                                Descripción de la Empresa <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                id="store-description"
                                rows={10}
                                value={config.description}
                                onChange={e => updateConfig({ description: e.target.value })}
                                className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 dark:focus:border-[var(--icons-green)] focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                placeholder="Escribe aquí la historia de tu empresa..."
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
