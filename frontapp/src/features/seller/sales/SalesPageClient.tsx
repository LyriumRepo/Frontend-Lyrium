'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import SalesKPIs from './components/SalesKPIs';
import SalesFilters from './components/SalesFilters';
import SalesTable from './components/SalesTable';
import OrderDetailModal from './components/OrderDetailModal';
import BaseModal from '@/components/ui/BaseModal';
import BaseLoading from '@/components/ui/BaseLoading';
import { SalesKPI } from '@/features/seller/sales/types';
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
        isFetching,
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
    const [selectedKpi, setSelectedKpi] = useState<SalesKPI | null>(null);

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

            <SalesKPIs kpis={kpis} onKpiClick={setSelectedKpi} />

            <SalesFilters
                dateStart={filters.dateStart}
                dateEnd={filters.dateEnd}
                orderType={filters.orderType ?? null}
                onDateChange={(type: 'dateStart' | 'dateEnd', value: string) => updateFilters({ [type]: value })}
                onOrderTypeChange={(value: string | null) => updateFilters({ orderType: value })}
                onClear={clearFilters}
                onExport={handleExport}
            />

            {isLoading && orders.length === 0 ? (
                <BaseLoading message="Cargando Centro de Control de Ventas..." />
            ) : (
                <>
            <div className="relative">
              {isFetching && orders.length > 0 && (
                <div className="absolute inset-0 bg-[var(--bg-card)]/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                  <div className="flex items-center gap-3 px-5 py-3 bg-[var(--bg-card)] rounded-2xl shadow-lg border border-[var(--border-subtle)]">
                    <div className="w-4 h-4 border-2 border-[#69BEEB] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-[var(--text-secondary)]">Actualizando datos...</span>
                  </div>
                </div>
              )}
              <SalesTable
                  data={orders}
                  loading={false}
                  onViewDetail={(order) => setSelectedOrder(order)}
                  onConfirm={(orderId) => advanceStep(orderId)}
                  onCancel={(orderId) => cancelOrder(orderId)}
                  isAdvancing={isAdvancing}
                  isCancelling={isCancelling}
              />
            </div>

                    {/* KPI Modal */}
                    <BaseModal isOpen={!!selectedKpi} onClose={() => setSelectedKpi(null)}
                        title={selectedKpi?.label ?? ''} subtitle={selectedKpi?.status ?? ''} size="md">
                        <div className="space-y-6">
                            <div className="bg-gray-900 p-6 rounded-[2rem] text-center">
                                <p className="text-5xl font-black text-white">
                                    {selectedKpi?.label === 'Ingresos Mensuales'
                                        ? `S/ ${(selectedKpi?.count ?? 0).toLocaleString()}`
                                        : selectedKpi?.count}
                                </p>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">{selectedKpi?.label}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-[var(--bg-secondary)]">
                                <p className="text-xs font-bold text-[var(--text-secondary)] text-center">{selectedKpi?.status}</p>
                            </div>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] text-center">
                                Este indicador resume el rendimiento de tus ventas. Los datos se actualizan en tiempo real conforme se procesan nuevos pedidos.
                            </p>
                        </div>
                    </BaseModal>

                    {/* Order Modal */}
                    <OrderDetailModal
                        order={selectedOrder!}
                        isOpen={!!selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onAdvanceStep={async (id) => {
                            await advanceStep(id);
                        }}
                    />
                </>
            )}
        </div>
    );
}
