'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useSellerInvoices } from '@/features/seller/invoices/hooks/useSellerInvoices';

import InvoiceKPIsDisplay from './components/InvoiceKPIs';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceTable from './components/InvoiceTable';
import InvoiceDrawer from './components/InvoiceDrawer';
import BaseLoading from '@/components/ui/BaseLoading';

export function InvoicesPageClient() {
    const {
        vouchers: filteredVouchers,
        kpis,
        isLoading,
        selectedVoucher,
        isDrawerOpen,
        filters,
        setFilters,
        clearFilters,
        handleViewDetail,
        handleCloseDrawer,
    } = useSellerInvoices();

    if (isLoading && filteredVouchers.length === 0) {
        return <BaseLoading message="Sincronizando con SUNAT vía NubeFact..." />;
    }

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            <ModuleHeader
                title="Mis Comprobantes"
                subtitle="Consulta de facturación electrónica — Los comprobantes se generan automáticamente al confirmarse el pago"
                icon="Receipt"
            />

            <InvoiceKPIsDisplay kpis={kpis} />

            <InvoiceFilters
                search={filters.search}
                status={filters.status}
                type={filters.type}
                onFilterChange={setFilters}
                onClear={clearFilters}
            />

            <InvoiceTable
                vouchers={filteredVouchers}
                onViewDetail={handleViewDetail}
            />

            <InvoiceDrawer
                voucher={selectedVoucher}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
            />
        </div>
    );
}
