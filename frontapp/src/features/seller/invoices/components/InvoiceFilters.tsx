'use client';

import React from 'react';
import { VoucherStatus, VoucherType } from '@/features/seller/invoices/types';
import Icon from '@/components/ui/Icon';
import BaseInputField from '@/components/ui/BaseInputField';
import { BaseDatePicker } from '@/components/ui';

interface InvoiceFiltersProps {
    search: string;
    status: VoucherStatus | 'ALL';
    type: VoucherType | 'ALL';
    dateFrom: string;
    dateTo: string;
    onFilterChange: (filters: Partial<{ search: string; status: VoucherStatus | 'ALL'; type: VoucherType | 'ALL'; dateFrom: string; dateTo: string }>) => void;
    onClear: () => void;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
}

export default function InvoiceFilters({ search, status, type, dateFrom, dateTo, onFilterChange, onClear, onExportExcel, onExportPDF }: InvoiceFiltersProps) {
    return (
        <div className="glass-card p-6 border-[var(--border-subtle)] animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-end flex-wrap">
                <div className="flex-1 space-y-2 w-full md:w-auto min-w-[200px]">
                    <BaseInputField
                        label="Búsqueda"
                        name="invoice-search"
                        value={search}
                        onChange={(value) => onFilterChange({ search: value })}
                        placeholder="Serie, Número o Cliente..."
                        icon="Search"
                        inputClassName="bg-[var(--bg-secondary)] text-sm font-mono focus:ring-emerald-500/20"
                    />
                </div>

                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Desde" value={dateFrom}
                        onChange={(v) => onFilterChange({ dateFrom: v })} placeholder="dd/mm/aaaa" />
                </div>
                <div className="space-y-2">
                    <BaseDatePicker label="Fecha Hasta" value={dateTo}
                        onChange={(v) => onFilterChange({ dateTo: v })} placeholder="dd/mm/aaaa" />
                </div>

                <div className="w-full md:w-40 space-y-2">
                    <label htmlFor="invoice-status" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Estado</label>
                    <select id="invoice-status" value={status}
                        onChange={(e) => onFilterChange({ status: e.target.value as VoucherStatus | 'ALL' })}
                        className="w-full p-3 bg-[var(--bg-secondary)] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer outline-none">
                        <option value="ALL">Todos los Estados</option>
                        <option value="DRAFT">Borrador</option>
                        <option value="SENT_WAIT_CDR">Enviado</option>
                        <option value="ACCEPTED">Aceptado</option>
                        <option value="OBSERVED">Observado</option>
                        <option value="REJECTED">Rechazado</option>
                    </select>
                </div>

                <div className="w-full md:w-40 space-y-2">
                    <label htmlFor="invoice-type" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tipo</label>
                    <select id="invoice-type" value={type}
                        onChange={(e) => onFilterChange({ type: e.target.value as VoucherType | 'ALL' })}
                        className="w-full p-3 bg-[var(--bg-secondary)] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer outline-none">
                        <option value="ALL">Todos</option>
                        <option value="BOLETA">Boleta</option>
                        <option value="FACTURA">Factura</option>
                        <option value="NOTA_CREDITO">Nota de Crédito</option>
                    </select>
                </div>

                <button onClick={onClear}
                    className="p-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-2xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center min-w-[3rem]"
                    title="Limpiar filtros">
                    <Icon name="Trash2" className="text-xl" />
                </button>
                <div className="flex gap-2">
                    {onExportExcel && (
                        <button onClick={onExportExcel}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
                            title="Exportar Excel">
                            <Icon name="FileSpreadsheet" className="text-xl" />
                            <span className="hidden sm:inline">Excel</span>
                        </button>
                    )}
                    {onExportPDF && (
                        <button onClick={onExportPDF}
                            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[#5AAFE6] hover:border-[#69BEEB]/30 transition-all shadow-sm"
                            title="Exportar PDF">
                            <Icon name="FileText" className="text-xl" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
