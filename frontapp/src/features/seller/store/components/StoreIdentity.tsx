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
        <div className="glass-card p-0 overflow-hidden border-none rounded-[2.5rem] shadow-2xl bg-[var(--bg-card)] mb-8">
            <div className="bg-gradient-to-r from-sky-500 via-sky-500 to-sky-400 p-8 flex items-center justify-between relative overflow-hidden">
                <div className="flex items-center gap-5 text-white relative z-10">
                    <div className="w-12 h-12 bg-white/20 dark:bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 dark:border-white/20 shadow-inner">
                        <Icon name="Building" className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter leading-none">Sobre Nosotros</h3>
                        <p className="text-[10px] font-bold text-sky-100 uppercase tracking-[0.2em] mt-1 opacity-80">
                            Identidad, historia y descripción de tu empresa
                        </p>
                    </div>
                </div>
                <div className="relative z-10">
                    <span className="px-4 py-2 bg-black/10 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-white border border-white/10">
                        Perfil Corporativo
                    </span>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label htmlFor="store-name" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Icon name="Building" className="w-3 h-3 text-sky-500" /> Nombre <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="store-name"
                                    type="text"
                                    value={config.name}
                                    onChange={e => updateConfig({ name: e.target.value })}
                                    className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="store-category" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Icon name="Tag" className="w-3 h-3 text-purple-500" /> Categoría <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    id="store-category"
                                    value={config.category || ''}
                                    onChange={e => updateConfig({ category: e.target.value })}
                                    className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="store-activity" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                    <Icon name="Briefcase" className="w-3 h-3 text-emerald-500" /> Actividad <span className="text-red-500 ml-1">*</span>
                                </label>
                                <input
                                    id="store-activity"
                                    type="text"
                                    value={config.activity}
                                    onChange={e => updateConfig({ activity: e.target.value })}
                                    className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="store-description" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1 flex items-center gap-1">
                                <Icon name="Building2" className="w-3 h-3 text-sky-500" />
                                Descripción de la Empresa <span className="text-red-500 ml-1">*</span>
                            </label>
                            <textarea
                                id="store-description"
                                rows={10}
                                value={config.description}
                                onChange={e => updateConfig({ description: e.target.value })}
                                className="w-full text-sm font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] p-3 border-2 border-[var(--border-subtle)] rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all duration-300"
                                placeholder="Escribe aquí la historia de tu empresa..."
                            ></textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
