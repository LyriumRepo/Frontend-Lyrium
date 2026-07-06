'use client';

import React, { useCallback } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useSellerInvoices } from '@/features/seller/invoices/hooks/useSellerInvoices';
import { exportInvoicesToExcel, exportInvoicesToPdf } from './export';

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

    const handleExportExcel = useCallback(() => {
        exportInvoicesToExcel(filteredVouchers, kpis).catch(console.error);
    }, [filteredVouchers, kpis]);

    const handleExportPDF = useCallback(() => {
        exportInvoicesToPdf(filteredVouchers, kpis).catch(console.error);
    }, [filteredVouchers, kpis]);

    if (isLoading && filteredVouchers.length === 0) {
        return <BaseLoading message="Cargando comprobantes electrónicos..." />;
    }

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            <ModuleHeader
                title="Mis Comprobantes"
                subtitle="Los comprobantes se generan automáticamente al confirmarse el pago"
                icon="Receipt"
            />

            <InvoiceKPIsDisplay kpis={kpis} />

            <InvoiceFilters
                search={filters.search}
                status={filters.status}
                type={filters.type}
                dateFrom={filters.dateFrom}
                dateTo={filters.dateTo}
                onFilterChange={setFilters}
                onClear={clearFilters}
                onExportExcel={handleExportExcel}
                onExportPDF={handleExportPDF}
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
