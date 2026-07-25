'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import SalesKPIs from './components/SalesKPIs';
import SalesFilters from './components/SalesFilters';
import SalesTable from './components/SalesTable';
import dynamic from 'next/dynamic';
const OrderDetailModal = dynamic(() => import('./components/OrderDetailModal'), { ssr: false });
import BaseModal from '@/components/ui/BaseModal';
import BaseLoading from '@/components/ui/BaseLoading';
import { SalesKPI } from '@/features/seller/sales/types';
import { useToast } from '@/shared/lib/context/ToastContext';
import { useSellerSales } from '@/features/seller/sales/hooks/useSellerSales';
import { mapOrdersToExportRows } from '@/features/seller/sales/export/mappers';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';

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
        shipWithCarrier,
        cancelOrder,
        isAdvancing,
        isCancelling
    } = useSellerSales();

    const { showToast } = useToast();
    const { can } = usePlanCapabilities();
    const [selectedKpi, setSelectedKpi] = useState<SalesKPI | null>(null);

    const handleExport = async (type: 'excel' | 'pdf') => {
        if (!can(type === 'excel' ? 'can_export_excel' : 'can_export_pdf')) {
            showToast(`Tu plan actual no incluye exportar a ${type === 'excel' ? 'Excel' : 'PDF'}. Actualiza tu plan para desbloquear esta función.`, 'warning');
            return;
        }
        if (type === 'excel') {
            if (orders.length === 0) {
                showToast('No hay órdenes para exportar.', 'warning');
                return;
            }
            showToast(`Exportando ${orders.length} órdenes a Excel...`, 'info');
            try {
                const exportRows = mapOrdersToExportRows(orders);
                const { exportSalesRowsToExcel } = await import('@/features/seller/sales/export/excelExporter');
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
            const { generateSalesReportPdf } = await import('@/features/seller/sales/export/pdfExporter');
            await generateSalesReportPdf(orders);
            showToast('PDF descargado correctamente.', 'success');
        } catch (err) {
            console.error('PDF export error:', err);
            showToast('Error al generar el PDF.', 'error');
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-20 max-w-7xl mx-auto">
            {/* Wrapper que fuerza el texto largo del título a romper en móvil */}
            <div className="[&_h1]:!whitespace-normal [&_h1]:!break-words [&_h2]:!whitespace-normal [&_h2]:!break-words [&_p]:!whitespace-normal">
            <ModuleHeader
                title="Ventas"
                subtitle="Toda la información y trazabilidad sobre tus ventas generadas."
                icon="Sales"
            />
            </div>

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
                <BaseLoading message="Cargando Ventas..." />
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
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 dark:bg-gradient-to-br dark:from-emerald-950/50 dark:to-teal-950/50 dark:border dark:border-emerald-800/30 p-6 rounded-[2rem] text-center">
                                <p className="text-5xl font-black text-emerald-800 dark:text-emerald-200">
                                    {selectedKpi?.label === 'Ingresos Mensuales'
                                        ? `S/ ${(selectedKpi?.count ?? 0).toLocaleString()}`
                                        : selectedKpi?.count}
                                </p>
                                <p className="text-[10px] font-black text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-2">{selectedKpi?.label}</p>
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
                        onAdvanceStep={async (id, section, serviceItemId) => {
                            await advanceStep(id, section, serviceItemId);
                        }}
                        onShipWithCarrier={async (orderId, carrierCode, carrierData) => {
                            await shipWithCarrier(orderId, carrierCode, carrierData);
                        }}
                    />
                </>
            )}
        </div>
    );
}