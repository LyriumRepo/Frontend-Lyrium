'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseInputField from '@/components/ui/BaseInputField';
import { BaseDatePicker, LyriumSelect } from '@/components/ui';

interface AdminInvoiceFiltersProps {
    search: string;
    storeFilter: string;
    dateFrom: string;
    dateTo: string;
    allStores: string[];
    onSearch: (v: string) => void;
    onStoreFilter: (v: string) => void;
    onDateFrom: (v: string) => void;
    onDateTo: (v: string) => void;
    onClear: () => void;
    actions?: React.ReactNode;
}

export default function AdminInvoiceFilters({
    search, storeFilter, dateFrom, dateTo,
    allStores,
    onSearch, onStoreFilter, onDateFrom, onDateTo, onClear,
    actions,
}: AdminInvoiceFiltersProps) {
    return (
        <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)] animate-fadeIn">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                        <Icon name="Search" className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base sm:text-xl font-black text-[var(--text-primary)]">
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
                    name="admin-invoice-search"
                    value={search}
                    onChange={onSearch}
                    placeholder="Serie, Número, Cliente, RUC..."
                    icon="Search"
                    inputClassName="bg-[var(--bg-secondary)] text-sm font-mono focus:ring-[var(--icons-green)]/20"
                />
            </div>

            {/* Fila 2: Fechas + Tienda (si existe) — siempre llenan el ancho */}
            <div className={`grid gap-4 mb-0 ${allStores.length > 0 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Desde" value={dateFrom} onChange={onDateFrom} placeholder="dd/mm/aaaa" />
                </div>
                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Hasta" value={dateTo} onChange={onDateTo} placeholder="dd/mm/aaaa" />
                </div>
                {allStores.length > 0 && (
                    <div className="space-y-2">
                        <LyriumSelect
                            label="Tienda"
                            value={storeFilter}
                            onChange={onStoreFilter}
                            placeholder="Todas las Tiendas"
                            searchable
                            options={allStores.map(s => ({ value: s, label: s }))}
                        />
                    </div>
                )}
            </div>

            {/* Acciones (Sincronizar, Excel, PDF) en grid de 3 columnas iguales */}
            {actions && (
                <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-[var(--border-subtle)]">
                    {actions}
                </div>
            )}
        </div>
    );
}
