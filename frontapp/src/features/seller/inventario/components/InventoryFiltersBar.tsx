'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import { InventoryFilters } from '../types';

const STATUS_OPTIONS: { value: InventoryFilters['status']; label: string }[] = [
    { value: 'all',      label: 'Todos'      },
    { value: 'ok',       label: 'Disponible' },
    { value: 'low',      label: 'Bajo'       },
    { value: 'critical', label: 'Crítico'    },
    { value: 'out',      label: 'Agotado'    },
];

interface Props {
    filters: InventoryFilters;
    categories: string[];
    onSearch: (v: string) => void;
    onStatus: (v: InventoryFilters['status']) => void;
    onCategory: (v: string) => void;
    actions?: React.ReactNode;
}

export function InventoryFiltersBar({ filters, categories, onSearch, onStatus, onCategory, actions }: Props) {
    return (
        <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] animate-fadeIn">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                        <Icon name="Package" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-[var(--text-primary)]">
                            Filtros de Inventario
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wide">
                            Busca y filtra por estado o categoría
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => { onSearch(''); onStatus('all'); onCategory('all'); }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    title="Limpiar Filtros"
                >
                    <Icon name="RotateCcw" className="w-4 h-4" />
                    <span className="hidden sm:inline">Limpiar</span>
                </button>
            </div>

            {/* Search — fila completa */}
            <div className="mb-4">
                <div className="relative">
                    <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)] pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU…"
                        value={filters.search}
                        onChange={(e) => onSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-sky-500/50 dark:focus:border-[#8FC3A1]/50 transition-colors"
                    />
                </div>
            </div>

            {/* Status + Categoría + Acciones */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 ${actions ? 'xl:grid-cols-3' : ''} gap-4`}>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Estado de Stock</label>
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-subtle)]">
                        {STATUS_OPTIONS.map(({ value, label }) => (
                            <button
                                key={value}
                                onClick={() => onStatus(value)}
                                className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    filters.status === value
                                        ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Categoría</label>
                    <div className="relative">
                        <select
                            value={filters.category}
                            onChange={(e) => onCategory(e.target.value)}
                            className="appearance-none w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] rounded-2xl text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--icons-green)]/20 cursor-pointer outline-none"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'Todas las categorías' : cat}
                                </option>
                            ))}
                        </select>
                        <Icon name="ChevronDown" className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-secondary)] pointer-events-none" />
                    </div>
                </div>

                {/* Acciones (Alertas, Excel, PDF) */}
                {actions && (
                    <div className="space-y-2 sm:col-span-2 xl:col-span-1">
                        <label className="hidden xl:block text-[10px] font-black text-transparent uppercase tracking-widest ml-1 select-none">.</label>
                        <div className="flex flex-wrap items-center justify-center xl:justify-end gap-3">
                            {actions}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}