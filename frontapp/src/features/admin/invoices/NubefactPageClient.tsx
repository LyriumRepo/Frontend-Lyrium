'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import BaseLoading from '@/components/ui/BaseLoading';
import Icon from '@/components/ui/Icon';
import { useAdminInvoices } from './hooks/useAdminInvoices';
import AdminInvoiceKPIsDisplay from './components/AdminInvoiceKPIs';
import AdminInvoiceFilters from './components/AdminInvoiceFilters';
import AdminInvoiceTable from './components/AdminInvoiceTable';
import AdminInvoiceDrawer from './components/AdminInvoiceDrawer';

interface NubefactPageClientProps {}

export function NubefactPageClient(_props: NubefactPageClientProps) {
    const {
        invoices,
        kpis,
        isLoading,
        error,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        storeFilter,
        setStoreFilter,
        dateFrom,
        setDateFrom,
        dateTo,
        setDateTo,
        allStores,
        allTypes,
        selectedInvoice,
        isDrawerOpen,
        handleViewDetail,
        handleCloseDrawer,
        clearFilters,
        refresh,
    } = useAdminInvoices();

    const handleExportCSV = () => {
        const headers = ['ID', 'Tienda', 'Tipo', 'Serie', 'Número', 'Cliente', 'RUC', 'Base Imponible', 'IGV', 'Monto', 'Estado', 'Fecha'];
        const rows = invoices.map(i => [
            i.id,
            i.stores.map(s => s.name).join(', ') || '—',
            i.type,
            i.series,
            i.number,
            i.customer_name,
            i.customer_ruc,
            (i.subtotal_sin_igv ?? (i.amount / 1.18)).toFixed(2),
            (i.igv_amount ?? (i.amount - (i.amount / 1.18))).toFixed(2),
            i.amount.toFixed(2),
            i.sunat_status,
            new Date(i.emission_date).toLocaleDateString('es-PE'),
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `comprobantes-nubefact-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (isLoading) return <BaseLoading message="Cargando comprobantes electrónicos..." />;

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            <ModuleHeader
                title="Facturación Electrónica"
                subtitle="Registro centralizado de comprobantes electrónicos SUNAT"
                icon="Receipt"
            />

            {error && (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-6 rounded-[2rem] flex items-center gap-4 text-rose-700 dark:text-rose-400 font-bold shadow-sm">
                    <Icon name="AlertCircle" className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="text-xs uppercase tracking-widest text-rose-500 mb-1">Error de Sincronización</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            <AdminInvoiceKPIsDisplay kpis={kpis} />

            <div className="flex justify-end gap-3">
                <BaseButton onClick={refresh} variant="ghost" leftIcon="RefreshCw" size="md">
                    Sincronizar
                </BaseButton>
                <BaseButton
                    onClick={handleExportCSV}
                    variant="primary"
                    leftIcon="Download"
                    size="md"
                    className="from-transparent to-transparent bg-[var(--brand-sky)] hover:bg-[var(--brand-sky-hover)] shadow-[var(--brand-sky)]/25 dark:bg-[var(--brand-green)] dark:hover:bg-[var(--brand-green-hover)]"
                >
                    Exportar CSV
                </BaseButton>
            </div>

            <AdminInvoiceFilters
                search={search}
                statusFilter={statusFilter}
                typeFilter={typeFilter}
                storeFilter={storeFilter}
                dateFrom={dateFrom}
                dateTo={dateTo}
                allStores={allStores}
                allTypes={allTypes}
                onSearch={setSearch}
                onStatusFilter={setStatusFilter}
                onTypeFilter={setTypeFilter}
                onStoreFilter={setStoreFilter}
                onDateFrom={setDateFrom}
                onDateTo={setDateTo}
                onClear={clearFilters}
            />

            <AdminInvoiceTable
                invoices={invoices}
                onViewDetail={handleViewDetail}
            />

            <AdminInvoiceDrawer
                invoice={selectedInvoice}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
            />
        </div>
    );
}
