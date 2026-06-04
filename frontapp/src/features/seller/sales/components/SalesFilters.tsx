'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface SalesFiltersProps {
    dateStart: string | null;
    dateEnd: string | null;
    orderType: string | null;
    onDateChange: (type: 'dateStart' | 'dateEnd', value: string) => void;
    onOrderTypeChange: (value: string | null) => void;
    onClear: () => void;
    onExport: (type: 'excel' | 'pdf') => void;
}

const ORDER_TYPE_OPTIONS: { value: string | null; label: string; icon: string }[] = [
    { value: null, label: 'Todas', icon: 'LayoutGrid' },
    { value: 'product', label: 'Productos', icon: 'Package' },
    { value: 'service', label: 'Servicios', icon: 'Briefcase' },
    { value: 'mixed', label: 'Mixtas', icon: 'Layers' },
];

export default function SalesFilters({ dateStart, dateEnd, orderType, onDateChange, onOrderTypeChange, onClear, onExport }: SalesFiltersProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex flex-col lg:flex-row items-end gap-6">
                <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 w-full">
                        <div className="space-y-2">
                            <label htmlFor="date-start" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Fecha Inicio</label>
                            <div className="relative">
                                <Icon name="Calendar" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#69BEEB] text-lg" />
                                <input
                                    id="date-start"
                                    type="date"
                                    value={dateStart || ''}
                                    onChange={(e) => onDateChange('dateStart', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)]/50 border-none rounded-2xl focus:ring-2 focus:ring-[#69BEEB]/20 transition-all font-bold text-[var(--text-primary)]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="date-end" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Fecha Fin</label>
                            <div className="relative">
                                <Icon name="Calendar" className="absolute left-4 top-1/2 -translate-y-1/2 text-[#69BEEB] text-lg" />
                                <input
                                    id="date-end"
                                    type="date"
                                    value={dateEnd || ''}
                                    onChange={(e) => onDateChange('dateEnd', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)]/50 border-none rounded-2xl focus:ring-2 focus:ring-[#69BEEB]/20 transition-all font-bold text-[var(--text-primary)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end pb-0 sm:pb-0">
                        <div className="flex bg-[var(--bg-secondary)]/40 rounded-2xl p-1 gap-0.5 border border-[var(--border-subtle)]/50">
                            {ORDER_TYPE_OPTIONS.map(opt => {
                                const isActive = orderType === opt.value;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => onOrderTypeChange(opt.value)}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                                            isActive
                                                ? 'bg-[var(--bg-card)] text-[#5AAFE6] shadow-sm border border-[#69BEEB]/20'
                                                : 'text-[var(--text-secondary)]/60 hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
                                        }`}
                                    >
                                        <Icon name={opt.icon} className="w-3.5 h-3.5" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full lg:w-auto shrink-0">
                    <button
                        onClick={onClear}
                        className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center min-w-[3rem]"
                        title="Limpiar filtros"
                    >
                        <Icon name="Trash2" className="text-xl" />
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onExport('excel')}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
                        >
                            <Icon name="FileSpreadsheet" className="text-xl" />
                            <span className="hidden sm:inline">Excel</span>
                        </button>
                        <button
                            onClick={() => onExport('pdf')}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
                        >
                            <Icon name="FileText" className="text-xl" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
