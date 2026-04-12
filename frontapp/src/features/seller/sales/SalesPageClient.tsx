'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import SalesKPIs from './components/SalesKPIs';
import SalesFilters from './components/SalesFilters';
import OrderCard from './components/OrderCard';
import OrderDetailModal from './components/OrderDetailModal';
import { Order, SalesKPI } from '@/features/seller/sales/types';
import { useToast } from '@/shared/lib/context/ToastContext';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseEmptyState from '@/components/ui/BaseEmptyState';
import { useSellerSales } from '@/features/seller/sales/hooks/useSellerSales';

interface SalesPageClientProps {
    // TODO Tarea 3: Estos datos vendrán del Server Component
    // Cuando se implemente la API real y el flag USE_MOCKS=false,
    // el hook useSellerSales recibirá estos datos como initialData
    initialOrders?: Awaited<ReturnType<typeof import('@/shared/lib/actions/dashboard').getRecentOrders>>;
    initialKPIs?: Awaited<ReturnType<typeof import('@/shared/lib/actions/dashboard').getSalesKPIs>>;
}

export function SalesPageClient(props: SalesPageClientProps) {
    // TODO Tarea 3: Pasar initialData al hook cuando se implemente
    // const { orders, kpis, ... } = useSellerSales({ initialData: props.initialOrders });
    // Por ahora el hook usa sus MOCK_DATA internos
    const {
        orders,
        kpis,
        isLoading,
        selectedOrder,
        setSelectedOrder,
        filters,
        updateFilters,
        clearFilters,
        advanceStep
    } = useSellerSales();

    const { showToast } = useToast();

    const handleExport = (type: 'excel' | 'pdf') => {
        showToast(`Generando reporte ${type.toUpperCase()}... El documento se descargará en breve.`, "info");
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-20 max-w-7xl mx-auto">
            <ModuleHeader
                title="Centro de Control de Ventas"
                subtitle="Toda la información y trazabilidad sobre tus ventas generadas."
                icon="Sales"
            />

            {isLoading ? (
                <BaseLoading message="Cargando Centro de Control de Ventas..." />
            ) : (
                <>
                    <SalesKPIs kpis={kpis} />

                    <SalesFilters
                        dateStart={filters.dateStart}
                        dateEnd={filters.dateEnd}
                        onDateChange={(type: 'dateStart' | 'dateEnd', value: string) => updateFilters({ [type]: value })}
                        onClear={clearFilters}
                        onExport={handleExport}
                    />

                    {/* Orders Grid */}
                    {orders.length === 0 ? (
                        <BaseEmptyState
                            title="No se encontraron pedidos"
                            description="No hay registros que coincidan con los filtros de fecha aplicados actualmente."
                            icon="ShoppingCart"
                            actionLabel="Limpiar Filtros"
                            onAction={clearFilters}
                            suggestion="Intenta ampliar el rango de fechas para ver pedidos históricos."
                        />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                            {orders.map((order: Order) => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    onClick={setSelectedOrder}
                                />
                            ))}
                        </div>
                    )}

                    {/* Modal */}
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
