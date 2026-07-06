'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/Icon';
import CalendarPopover from './CalendarPopover';
import { Info } from 'lucide-react';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';

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
    { value: null,      label: 'Todas',     icon: 'LayoutGrid' },
    { value: 'product', label: 'Productos', icon: 'Package'    },
    { value: 'service', label: 'Servicios', icon: 'Briefcase'  },
    { value: 'mixed',   label: 'Mixtas',    icon: 'Layers'     },
];

function formatDisplayDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SalesFilters({ dateStart, dateEnd, orderType, onDateChange, onOrderTypeChange, onClear, onExport }: SalesFiltersProps) {
    const { can } = usePlanCapabilities();
    const canExportExcel = can('can_export_excel');
    const canExportPdf = can('can_export_pdf');
    const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
    const startRef = useRef<HTMLDivElement | null>(null);
    const endRef   = useRef<HTMLDivElement | null>(null);

    const [showExportHint, setShowExportHint] = useState(false);
    const prevDateEndRef = useRef(dateEnd);
    useEffect(() => {
        if (dateEnd && prevDateEndRef.current !== dateEnd) {
            setShowExportHint(true);
            const timer = setTimeout(() => setShowExportHint(false), 4500);
            return () => clearTimeout(timer);
        }
        prevDateEndRef.current = dateEnd;
    }, [dateEnd]);

    const closePicker = useCallback(() => setActivePicker(null), []);

    return (
        <div className="glass-card p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">

                {/* ── Fechas + Segmented ── */}
                <div className="flex flex-col gap-4 flex-1 w-full">

                    {/* Fechas — 2 columnas */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Fecha Inicio</label>
                            <div className="relative group">
                                <Icon name="Calendar" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#69BEEB] dark:text-[#66D6A8] transition-colors text-lg pointer-events-none z-10" />
                                <div
                                    ref={startRef}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setActivePicker(activePicker === 'start' ? null : 'start')}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActivePicker(activePicker === 'start' ? null : 'start'); }}
                                    className={'w-full pl-8 sm:pl-12 pr-2 sm:pr-4 py-3 bg-[var(--bg-secondary)]/50 border-2 rounded-2xl transition-all font-bold text-[var(--text-primary)] cursor-pointer flex items-center text-xs sm:text-sm ' + (activePicker === 'start' ? 'border-[#69BEEB] dark:border-[#66D6A8] ring-2 ring-[#69BEEB]/15 dark:ring-[#66D6A8]/15' : 'border-transparent')}
                                >
                                    <span className={dateStart ? 'text-[var(--text-primary)] truncate' : 'text-gray-400 dark:text-gray-600'}>
                                        {dateStart ? formatDisplayDate(dateStart) : 'Seleccionar'}
                                    </span>
                                </div>
                                {activePicker === 'start' && (
                                    <CalendarPopover
                                        value={dateStart || ''}
                                        onChange={(v) => onDateChange('dateStart', v)}
                                        onClose={closePicker}
                                        triggerRef={startRef}
                                        rangeStart={null}
                                        rangeEnd={dateEnd}
                                    />
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Fecha Fin</label>
                            <div className="relative group">
                                <Icon name="Calendar" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-[#69BEEB] dark:text-[#66D6A8] transition-colors text-lg pointer-events-none z-10" />
                                <div
                                    ref={endRef}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setActivePicker(activePicker === 'end' ? null : 'end')}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActivePicker(activePicker === 'end' ? null : 'end'); }}
                                    className={'w-full pl-8 sm:pl-12 pr-2 sm:pr-4 py-3 bg-[var(--bg-secondary)]/50 border-2 rounded-2xl transition-all font-bold text-[var(--text-primary)] cursor-pointer flex items-center text-xs sm:text-sm ' + (activePicker === 'end' ? 'border-[#69BEEB] dark:border-[#66D6A8] ring-2 ring-[#69BEEB]/15 dark:ring-[#66D6A8]/15' : 'border-transparent')}
                                >
                                    <span className={dateEnd ? 'text-[var(--text-primary)] truncate' : 'text-gray-400 dark:text-gray-600'}>
                                        {dateEnd ? formatDisplayDate(dateEnd) : 'Seleccionar'}
                                    </span>
                                </div>
                                {activePicker === 'end' && (
                                    <CalendarPopover
                                        value={dateEnd || ''}
                                        onChange={(v) => onDateChange('dateEnd', v)}
                                        onClose={closePicker}
                                        triggerRef={endRef}
                                        rangeStart={dateStart}
                                        rangeEnd={null}
                                    />
                                )}
                                {showExportHint && (
                                    <div className="absolute top-0 -translate-y-full -mt-2 z-50 animate-fadeIn translate-x-20">
                                        <div className="bg-white dark:bg-[#182420] rounded-2xl shadow-lg border border-[#4EC7B8]/20 dark:border-[#4EC7B8]/10 px-4 py-2.5 flex items-center gap-2.5 whitespace-nowrap">
                                            <Info className="w-4 h-4 text-[#66D6A8] shrink-0" />
                                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 leading-snug">
                                                Las exportaciones reflejan los filtros aplicados.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Segmented control — centrado en móvil, compacto para que los 4 quepan desde 320 px */}
                    <div className="flex justify-center lg:justify-start w-full">
                        <div className="flex bg-[var(--bg-secondary)]/40 rounded-2xl p-1 gap-0.5 border border-[var(--border-subtle)]/50">
                            {ORDER_TYPE_OPTIONS.map(opt => {
                                const isActive = orderType === opt.value;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={() => onOrderTypeChange(opt.value)}
                                        className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap ${
                                            isActive
                                                ? 'bg-[var(--bg-card)] text-[#5AAFE6] shadow-sm border border-[#69BEEB]/20'
                                                : 'text-[var(--text-secondary)]/60 hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50'
                                        }`}
                                    >
                                        <Icon name={opt.icon} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        {opt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>{/* /flex-col gap-4 */}

                {/* ── Acciones: Limpiar + Exportar — centradas en móvil ── */}
                <div className="flex gap-2 justify-center lg:justify-start lg:w-auto shrink-0">
                    <button
                        onClick={onClear}
                        className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center min-w-[3rem]"
                        title="Limpiar filtros"
                    >
                        <Icon name="Trash2" className="text-xl" />
                    </button>

                    <button
                        onClick={() => onExport('excel')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] font-bold text-xs border transition-all shadow-sm ${
                            canExportExcel
                                ? 'text-[var(--text-primary)] border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30'
                                : 'text-[var(--text-secondary)]/50 border-dashed border-[var(--border-subtle)]'
                        }`}
                        title={canExportExcel ? undefined : 'Disponible en planes superiores'}
                    >
                        {canExportExcel ? <Icon name="FileSpreadsheet" className="text-xl" /> : <Icon name="Lock" className="text-base" />}
                        <span className="hidden sm:inline">Excel</span>
                    </button>
                    <button
                        onClick={() => onExport('pdf')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] font-bold text-xs border transition-all shadow-sm ${
                            canExportPdf
                                ? 'text-[var(--text-primary)] border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30'
                                : 'text-[var(--text-secondary)]/50 border-dashed border-[var(--border-subtle)]'
                        }`}
                        title={canExportPdf ? undefined : 'Disponible en planes superiores'}
                    >
                        {canExportPdf ? <Icon name="FileText" className="text-xl" /> : <Icon name="Lock" className="text-base" />}
                        <span className="hidden sm:inline">PDF</span>
                    </button>
                </div>
            </div>
        </div>
    );
}