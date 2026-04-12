'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import { useSellerInvoices } from '@/features/seller/invoices/hooks/useSellerInvoices';
import { VoucherStatus, VoucherType } from '@/features/seller/invoices/types';

import InvoiceKPIsDisplay from './components/InvoiceKPIs';
import InvoiceFilters from './components/InvoiceFilters';
import InvoiceTable from './components/InvoiceTable';
import InvoiceDrawer from './components/InvoiceDrawer';
import EmitInvoiceModal from './components/EmitInvoiceModal';
import Icon from '@/components/ui/Icon';
import BaseButton from '@/components/ui/BaseButton';
import BaseLoading from '@/components/ui/BaseLoading';

interface InvoicesPageClientProps {
    // TODO Tarea 3: Recibir datos iniciales del Server Component
}

export function InvoicesPageClient(_props: InvoicesPageClientProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
        handleRetryInvoice,
        emitNewInvoice,
    } = useSellerInvoices();

    if (isLoading && filteredVouchers.length === 0) {
        return <BaseLoading message="Sincronizando con SUNAT vía Rapifac..." />;
    }

    return (
        <div className="space-y-8 pb-20 animate-fadeIn">
            <ModuleHeader
                title="Mis Comprobantes"
                subtitle="Gestión de facturación electrónica y sincronización SUNAT vía Rapifac"
                icon="Receipt"
                actions={
                    <BaseButton
                        variant="action"
                        leftIcon="PlusCircle"
                        onClick={() => setIsModalOpen(true)}
                    >
                        Nueva Factura
                    </BaseButton>
                }
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
                onRetry={handleRetryInvoice}
            />

            <EmitInvoiceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onEmit={emitNewInvoice}
            />
        </div>
    );
}
