'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseInputField from '@/components/ui/BaseInputField';
import { BaseDatePicker } from '@/components/ui';

interface InvoiceFiltersProps {
    search: string;
    dateFrom: string;
    dateTo: string;
    onFilterChange: (filters: Partial<{ search: string; dateFrom: string; dateTo: string }>) => void;
    onClear: () => void;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
}

export default function InvoiceFilters({ search, dateFrom, dateTo, onFilterChange, onClear, onExportExcel, onExportPDF }: InvoiceFiltersProps) {
    return (
        <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] animate-fadeIn">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                        <Icon name="Search" className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)]">
                        Filtros de Búsqueda
                    </h3>
                </div>

                <button
                    onClick={onClear}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    title="Limpiar Filtros"
                >
                    <Icon name="RotateCcw" className="w-4 h-4" />
                    <span className="hidden sm:inline">Limpiar</span>
                </button>
            </div>

            {/* Fila 1: Búsqueda ocupa todo el ancho */}
            <div className="mb-4">
                <BaseInputField
                    label="Búsqueda"
                    name="invoice-search"
                    value={search}
                    onChange={(value) => onFilterChange({ search: value })}
                    placeholder="Serie, Número o Cliente..."
                    icon="Search"
                    inputClassName="bg-[var(--bg-secondary)] text-sm font-mono focus:ring-[var(--icons-green)]/20"
                />
            </div>

            {/* Fila 2: Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-0">
                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Desde" value={dateFrom}
                        onChange={(v) => onFilterChange({ dateFrom: v })} placeholder="dd/mm/aaaa" />
                </div>
                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Hasta" value={dateTo}
                        onChange={(v) => onFilterChange({ dateTo: v })} placeholder="dd/mm/aaaa" />
                </div>
            </div>

            {/* Acciones: Excel + PDF */}
            {(onExportExcel || onExportPDF) && (
                <div className="flex gap-3 mt-6 pt-5 border-t border-[var(--border-subtle)]">
                    {onExportExcel && (
                        <button onClick={onExportExcel}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm"
                            title="Exportar Excel">
                            <Icon name="FileSpreadsheet" className="w-4 h-4" />
                            Excel
                        </button>
                    )}
                    {onExportPDF && (
                        <button onClick={onExportPDF}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm"
                            title="Exportar PDF">
                            <Icon name="FileText" className="w-4 h-4" />
                            PDF
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
