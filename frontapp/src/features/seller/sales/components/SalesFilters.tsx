'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

interface SalesFiltersProps {
    dateStart: string | null;
    dateEnd: string | null;
    onDateChange: (type: 'dateStart' | 'dateEnd', value: string) => void;
    onClear: () => void;
    onExport: (type: 'excel' | 'pdf') => void;
}

export default function SalesFilters({ dateStart, dateEnd, onDateChange, onClear, onExport }: SalesFiltersProps) {
    return (
        <div className="glass-card p-6">
            <div className="flex flex-col lg:flex-row items-end gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 w-full">
                    <div className="space-y-2">
                        <label htmlFor="date-start" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Fecha Inicio</label>
                        <div className="relative">
                            <Icon name="Calendar" className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 text-lg" />
                            <input
                                id="date-start"
                                type="date"
                                value={dateStart || ''}
                                onChange={(e) => onDateChange('dateStart', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)]/50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500/20 transition-all font-bold text-[var(--text-primary)]"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="date-end" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Fecha Fin</label>
                        <div className="relative">
                            <Icon name="Calendar" className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-500 text-lg" />
                            <input
                                id="date-end"
                                type="date"
                                value={dateEnd || ''}
                                onChange={(e) => onDateChange('dateEnd', e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)]/50 border-none rounded-2xl focus:ring-2 focus:ring-sky-500/20 transition-all font-bold text-[var(--text-primary)]"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                    <button
                        onClick={onClear}
                        className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--bg-danger)] hover:text-[var(--text-danger)] transition-all flex items-center justify-center min-w-[3rem]"
                        title="Limpiar filtros"
                    >
                        <Icon name="Trash2" className="text-xl" />
                    </button>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onExport('excel')}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-sky-600 transition-all shadow-sm"
                        >
                            <Icon name="FileSpreadsheet" className="text-xl" />
                            <span className="hidden sm:inline">Excel</span>
                        </button>
                        <button
                            onClick={() => onExport('pdf')}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-sky-600 transition-all shadow-sm"
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
