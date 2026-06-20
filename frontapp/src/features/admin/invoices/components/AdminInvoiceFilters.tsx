'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import BaseInputField from '@/components/ui/BaseInputField';
import { BaseDatePicker } from '@/components/ui';

interface AdminInvoiceFiltersProps {
    search: string;
    statusFilter: string;
    typeFilter: string;
    storeFilter: string;
    dateFrom: string;
    dateTo: string;
    allStores: string[];
    allTypes: string[];
    onSearch: (v: string) => void;
    onStatusFilter: (v: string) => void;
    onTypeFilter: (v: string) => void;
    onStoreFilter: (v: string) => void;
    onDateFrom: (v: string) => void;
    onDateTo: (v: string) => void;
    onClear: () => void;
}

const selectClass = 'w-full p-3 bg-[var(--bg-secondary)] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer outline-none';

export default function AdminInvoiceFilters({
    search, statusFilter, typeFilter, storeFilter, dateFrom, dateTo,
    allStores, allTypes,
    onSearch, onStatusFilter, onTypeFilter, onStoreFilter, onDateFrom, onDateTo, onClear,
}: AdminInvoiceFiltersProps) {
    return (
        <div className="glass-card p-6 border-[var(--border-subtle)] animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
                <div className="flex-1 space-y-2 w-full md:w-auto min-w-[200px]">
                    <BaseInputField
                        label="Búsqueda"
                        name="admin-invoice-search"
                        value={search}
                        onChange={onSearch}
                        placeholder="Serie, Número, Cliente, RUC..."
                        icon="Search"
                        inputClassName="bg-[var(--bg-secondary)] text-sm font-mono focus:ring-emerald-500/20"
                    />
                </div>

                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Desde" value={dateFrom} onChange={onDateFrom} placeholder="dd/mm/aaaa" />
                </div>
                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Hasta" value={dateTo} onChange={onDateTo} placeholder="dd/mm/aaaa" />
                </div>

                <div className="w-full md:w-44 space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Estado</label>
                    <select value={statusFilter} onChange={e => onStatusFilter(e.target.value)} className={selectClass}>
                        <option value="">Todos los Estados</option>
                        <option value="ACCEPTED">Aceptado</option>
                        <option value="SENT_WAIT_CDR">Pendiente CDR</option>
                        <option value="OBSERVED">Observado</option>
                        <option value="REJECTED">Rechazado</option>
                        <option value="DRAFT">Borrador</option>
                    </select>
                </div>

                <div className="w-full md:w-40 space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tipo</label>
                    <select value={typeFilter} onChange={e => onTypeFilter(e.target.value)} className={selectClass}>
                        <option value="">Todos</option>
                        {allTypes.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {allStores.length > 0 && (
                    <div className="w-full md:w-48 space-y-2">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tienda</label>
                        <select value={storeFilter} onChange={e => onStoreFilter(e.target.value)} className={selectClass}>
                            <option value="">Todas las Tiendas</option>
                            {allStores.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}

                <button
                    onClick={onClear}
                    className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-[var(--bg-hover)] transition-all shadow-sm active:scale-95 border border-[var(--border-subtle)]"
                    title="Limpiar Filtros"
                >
                    <Icon name="RotateCcw" className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
