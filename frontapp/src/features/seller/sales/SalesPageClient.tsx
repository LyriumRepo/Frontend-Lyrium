'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import SalesKPIs from './components/SalesKPIs';
import SalesFilters from './components/SalesFilters';
import SalesTable from './components/SalesTable';
import OrderDetailModal from './components/OrderDetailModal';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useSellerSales } from '@/features/seller/sales/hooks/useSellerSales';
import { mapOrdersToExportRows } from '@/features/seller/sales/export/mappers';
import { exportSalesRowsToExcel } from '@/features/seller/sales/export/excelExporter';
import { generateSalesReportPdf } from '@/features/seller/sales/export/pdfExporter';

interface SalesPageClientProps {
    initialOrders?: unknown;
    initialKPIs?: unknown;
}

export function SalesPageClient(_props?: SalesPageClientProps) {
    const {
        orders,
        kpis,
        isLoading,
        selectedOrder,
        setSelectedOrder,
        filters,
        updateFilters,
        clearFilters,
        advanceStep,
        cancelOrder,
        isAdvancing,
        isCancelling
    } = useSellerSales();

    const { showToast } = useToast();

    const handleExport = async (type: 'excel' | 'pdf') => {
        if (type === 'excel') {
            if (orders.length === 0) {
                showToast('No hay órdenes para exportar.', 'warning');
                return;
            }
            showToast(`Exportando ${orders.length} órdenes a Excel...`, 'info');
            try {
                const exportRows = mapOrdersToExportRows(orders);
                await exportSalesRowsToExcel(exportRows);
                showToast('Excel descargado correctamente.', 'success');
            } catch {
                showToast('Error al generar el Excel.', 'error');
            }
            return;
        }
        if (orders.length === 0) {
            showToast('No hay órdenes para exportar.', 'warning');
            return;
        }
        showToast(`Generando reporte PDF de ${orders.length} órdenes...`, 'info');
        try {
            await generateSalesReportPdf(orders);
            showToast('PDF descargado correctamente.', 'success');
        } catch (err) {
            console.error('PDF export error:', err);
            showToast('Error al generar el PDF.', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-20 max-w-7xl mx-auto">
            <ModuleHeader
                title="Centro de Control de Ventas"
                subtitle="Toda la información y trazabilidad sobre tus ventas generadas."
                icon="Sales"
            />

            <SalesKPIs kpis={kpis} />

            <SalesFilters
                dateStart={filters.dateStart}
                dateEnd={filters.dateEnd}
                orderType={filters.orderType ?? null}
                onDateChange={(type: 'dateStart' | 'dateEnd', value: string) => updateFilters({ [type]: value })}
                onOrderTypeChange={(value: string | null) => updateFilters({ orderType: value })}
                onClear={clearFilters}
                onExport={handleExport}
            />

            <SalesTable
                data={orders}
                loading={isLoading}
                onViewDetail={(order) => setSelectedOrder(order)}
                onConfirm={(orderId) => advanceStep(orderId)}
                onCancel={(orderId) => cancelOrder(orderId)}
                isAdvancing={isAdvancing}
                isCancelling={isCancelling}
            />

            <OrderDetailModal
                order={selectedOrder!}
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                onAdvanceStep={async (id) => {
                    await advanceStep(id);
                }}
            />
        </div>
    );
}
