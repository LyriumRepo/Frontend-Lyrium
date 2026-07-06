'use client';

import React, { useCallback, useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Icon from '@/components/ui/Icon';
import { FileSpreadsheet, FileText } from 'lucide-react';
import BaseLoading from '@/components/ui/BaseLoading';
import { useAdminInvoices } from './hooks/useAdminInvoices';
import { usePlanInvoices } from './hooks/usePlanInvoices';
import AdminInvoiceKPIsDisplay from './components/AdminInvoiceKPIs';
import AdminInvoiceFilters from './components/AdminInvoiceFilters';
import AdminInvoiceTable from './components/AdminInvoiceTable';
import AdminInvoiceDrawer from './components/AdminInvoiceDrawer';
import PlanInvoiceTable from './components/PlanInvoiceTable';
import { exportAdminInvoicesToPdf, exportAdminInvoicesToExcel } from './export';

type Tab = 'orders' | 'plans';

interface NubefactPageClientProps {}

export function NubefactPageClient(_props: NubefactPageClientProps) {
    const [activeTab, setActiveTab] = useState<Tab>('orders');

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

    const {
        rows: planRows,
        isLoading: planLoading,
        error: planError,
        total: planTotal,
        refresh: planRefresh,
    } = usePlanInvoices();

    const handleExportPDF = useCallback(() => {
        exportAdminInvoicesToPdf(invoices, kpis).catch(console.error);
    }, [invoices, kpis]);

    const handleExportExcel = useCallback(() => {
        exportAdminInvoicesToExcel(invoices, kpis).catch(console.error);
    }, [invoices, kpis]);

    const tabs: Array<{ key: Tab; label: string; icon: string; count?: number }> = [
        { key: 'orders', label: 'Facturas de Vendedores', icon: 'ShoppingCart', count: invoices.length },
        { key: 'plans', label: 'Facturas de Suscripciones', icon: 'CreditCard', count: planTotal },
    ];

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            <ModuleHeader
                title="Facturación Electrónica"
                subtitle="Registro centralizado de comprobantes electrónicos SUNAT"
                icon="Receipt"
            />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border-subtle)] pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-t-xl border-b-2 transition-all ${
                            activeTab === tab.key
                                ? 'border-[var(--icons-green)] text-[var(--icons-green)] bg-[var(--icons-green)]/5'
                                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                        }`}
                    >
                        <Icon name={tab.icon} className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                activeTab === tab.key
                                    ? 'bg-[var(--icons-green)]/15 text-[var(--icons-green)]'
                                    : 'bg-[var(--border-subtle)] text-[var(--text-secondary)]'
                            }`}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab: Facturas de Vendedores */}
            {activeTab === 'orders' && (
                <>
                    {isLoading ? (
                        <BaseLoading message="Cargando comprobantes electrónicos..." />
                    ) : (
                        <>
                            {error && (
                                <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-6 rounded-[2rem] flex items-center gap-4 text-[var(--color-error)] font-bold shadow-sm">
                                    <Icon name="AlertCircle" className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-[var(--color-error)] mb-1">Error de Sincronización</p>
                                        <p>{error}</p>
                                    </div>
                                </div>
                            )}

                            <AdminInvoiceKPIsDisplay kpis={kpis} />

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
                                actions={
                                    <>
                                        <BaseButton onClick={refresh} variant="primary" leftIcon="RefreshCw" size="sm" className="w-full justify-center">
                                            Sincronizar
                                        </BaseButton>
                                        <button
                                            onClick={handleExportExcel}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm w-full"
                                        >
                                            <FileSpreadsheet className="w-4 h-4" />
                                            Excel
                                        </button>
                                        <button
                                            onClick={handleExportPDF}
                                            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--icons-green)] hover:border-[var(--icons-green)]/30 transition-all shadow-sm w-full"
                                        >
                                            <FileText className="w-4 h-4" />
                                            PDF
                                        </button>
                                    </>
                                }
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
                        </>
                    )}
                </>
            )}

            {/* Tab: Facturas de Suscripciones */}
            {activeTab === 'plans' && (
                <>
                    {planLoading ? (
                        <BaseLoading message="Cargando facturas de suscripciones..." />
                    ) : (
                        <>
                            {planError && (
                                <div className="bg-[var(--color-error)]/10 border border-[var(--color-error)]/20 p-6 rounded-[2rem] flex items-center gap-4 text-[var(--color-error)] font-bold shadow-sm">
                                    <Icon name="AlertCircle" className="w-6 h-6 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs uppercase tracking-widest text-[var(--color-error)] mb-1">Error</p>
                                        <p>{planError}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {planTotal} factura{planTotal !== 1 ? 's' : ''} de suscripción registrada{planTotal !== 1 ? 's' : ''}
                                </p>
                                <BaseButton onClick={planRefresh} variant="primary" leftIcon="RefreshCw" size="sm">
                                    Actualizar
                                </BaseButton>
                            </div>

                            <PlanInvoiceTable rows={planRows} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}
