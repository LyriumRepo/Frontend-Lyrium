'use client';

import React from 'react';
import { VoucherStatus, VoucherType } from '@/features/seller/invoices/types';
import Icon from '@/components/ui/Icon';
import BaseInputField from '@/components/ui/BaseInputField';
import BaseSelectField from '@/components/ui/BaseSelectField';

interface InvoiceFilters {
    search?: string;
    status?: VoucherStatus | 'ALL';
    type?: VoucherType | 'ALL';
}

interface InvoiceFiltersProps {
    search: string;
    status: VoucherStatus | 'ALL';
    type: VoucherType | 'ALL';
    onFilterChange: (filters: Partial<InvoiceFilters>) => void;
    onClear: () => void;
}

export default function InvoiceFilters({ search, status, type, onFilterChange, onClear }: InvoiceFiltersProps) {
    return (
        <div className="glass-card p-6 border-[var(--border-subtle)] animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2 w-full">
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

                <div className="w-full md:w-48 space-y-2">
                    <label htmlFor="invoice-status" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Estado SUNAT</label>
                    <select
                        id="invoice-status"
                        value={status}
                        onChange={(e) => onFilterChange({ status: e.target.value as VoucherStatus | 'ALL' })}
                        className="w-full p-3 bg-[var(--bg-secondary)] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer outline-none"
                    >
                        <option value="ALL">Todos los Estados</option>
                        <option value="DRAFT">Borrador</option>
                        <option value="SENT_WAIT_CDR">Enviado</option>
                        <option value="ACCEPTED">Aceptado</option>
                        <option value="OBSERVED">Observado</option>
                        <option value="REJECTED">Rechazado</option>
                    </select>
                </div>

                <div className="w-full md:w-48 space-y-2">
                    <label htmlFor="invoice-type" className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest ml-1">Tipo de Comprobante</label>
                    <select
                        id="invoice-type"
                        value={type}
                        onChange={(e) => onFilterChange({ type: e.target.value as VoucherType | 'ALL' })}
                        className="w-full p-3 bg-[var(--bg-secondary)] border-none rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:ring-2 focus:ring-emerald-500/20 cursor-pointer outline-none"
                    >
                        <option value="ALL">Todos los Tipos</option>
                        <option value="BOLETA">Boleta</option>
                        <option value="FACTURA">Factura</option>
                        <option value="NOTA_CREDITO">Nota de Crédito</option>
                    </select>
                </div>

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
