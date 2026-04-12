'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import BaseStatsGrid, { StatItem } from '@/components/ui/BaseStatsGrid';
import DataTable, { Column } from '@/components/ui/DataTable';
import BaseStatusBadge from '@/components/ui/BaseStatusBadge';
import BaseDrawer from '@/components/ui/BaseDrawer';
import Icon from '@/components/ui/Icon';
import { useLogisticsShipments } from '@/features/logistics/shipments/hooks/useLogisticsShipments';
import { Shipment, ShipmentStatus } from '@/features/logistics/types';

const SHIPMENT_STATUS_MAPPINGS = [
    { status: 'ASIGNADO', label: 'Asignado', class: 'bg-gray-100 text-gray-600', icon: 'Circle' },
    { status: 'RECOGIDO', label: 'Recogido', class: 'bg-sky-100 text-sky-600', icon: 'Package' },
    { status: 'EN_TRÁNSITO', label: 'En Tránsito', class: 'bg-amber-100 text-amber-600', icon: 'Truck' },
    { status: 'EN_DESTINO', label: 'En Destino', class: 'bg-indigo-100 text-indigo-600', icon: 'MapPin' },
    { status: 'ENTREGADO', label: 'Entregado', class: 'bg-emerald-100 text-emerald-600', icon: 'CheckCircle' },
    { status: 'INCIDENCIA', label: 'Incidencia', class: 'bg-rose-100 text-rose-600', icon: 'AlertTriangle' },
    { status: 'REAGENDADO', label: 'Reagendado', class: 'bg-orange-100 text-orange-600', icon: 'Calendar' },
];

const statusOptions = [
    { value: 'ALL', label: 'Todos los Estados' },
    { value: 'ASIGNADO', label: 'Asignado' },
    { value: 'RECOGIDO', label: 'Recogido' },
    { value: 'EN_TRÁNSITO', label: 'En Tránsito' },
    { value: 'EN_DESTINO', label: 'En Destino' },
    { value: 'ENTREGADO', label: 'Entregado' },
    { value: 'INCIDENCIA', label: 'Incidencia' },
    { value: 'REAGENDADO', label: 'Reagendado' },
];

export function LogisticsPageClient() {
    const { shipments, isLoading, filters, setFilters, kpis, selectedShipment, setSelectedShipment, advanceStatus, reportIncident, rescheduleDelivery } = useLogisticsShipments();

    const stats: StatItem[] = kpis.map(kpi => ({
        label: kpi.label,
        value: kpi.value,
        icon: kpi.icon,
        color: kpi.color,
    }));

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const columns: Column<Shipment>[] = [
        {
            key: 'id',
            header: 'Envío',
            render: (item) => (
                <div>
                    <span className="text-xs font-black text-sky-500 block">{item.id}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{item.orderId}</span>
                </div>
            ),
        },
        {
            key: 'customerName',
            header: 'Cliente',
            render: (item) => (
                <div>
                    <span className="text-xs font-bold text-[var(--text-primary)] block">{item.customerName}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{item.customerPhone}</span>
                </div>
            ),
        },
        {
            key: 'vendorName',
            header: 'Vendedor',
            render: (item) => (
                <span className="text-xs font-medium text-[var(--text-primary)]">{item.vendorName}</span>
            ),
        },
        {
            key: 'status',
            header: 'Estado',
            render: (item) => (
                <BaseStatusBadge
                    status={item.status}
                    mappings={SHIPMENT_STATUS_MAPPINGS}
                    variant="large"
                />
            ),
        },
        {
            key: 'assignedAt',
            header: 'Fecha',
            render: (item) => (
                <span className="text-[10px] text-[var(--text-secondary)]">
                    {formatDate(item.assignedAt)}
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Acciones',
            align: 'right',
            render: (item) => (
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedShipment(item); }}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
                        title="Ver Detalle"
                    >
                        <Icon name="Eye" className="w-4 h-4 text-[var(--text-secondary)]" />
                    </button>
                    {item.status !== 'ENTREGADO' && item.status !== 'INCIDENCIA' && (
                        <button
                            onClick={(e) => { e.stopPropagation(); advanceStatus(item.id); }}
                            className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Avanzar Estado"
                        >
                            <Icon name="ChevronRight" className="w-4 h-4 text-emerald-500" />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6 animate-fadeIn pb-20 max-w-7xl mx-auto">
            <ModuleHeader title="Panel de Logística" subtitle="Gestión de envíos y entregas" icon="Truck" />

            <BaseStatsGrid stats={stats} columns={4} isLoading={isLoading} />

            <div className="glass-card p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
                <div className="flex flex-col md:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            placeholder="Buscar por ID, cliente o pedido..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-[var(--bg-secondary)]/50 border-none rounded-xl text-xs font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-sky-500/20"
                        />
                    </div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value as ShipmentStatus | 'ALL' })}
                        className="px-4 py-3 bg-[var(--bg-secondary)]/50 border-none rounded-xl text-xs font-medium text-[var(--text-primary)] focus:ring-2 focus:ring-sky-500/20"
                    >
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <DataTable
                    data={shipments}
                    columns={columns}
                    keyField="id"
                    loading={isLoading}
                    loadingMessage="Cargando envíos..."
                    emptyTitle="Sin envíos"
                    emptyDescription="No se encontraron envíos con los filtros aplicados"
                    emptyIcon="Truck"
                    onRowClick={(item) => setSelectedShipment(item)}
                    countLabel="envíos"
                />
            </div>

            <BaseDrawer
                isOpen={!!selectedShipment}
                onClose={() => setSelectedShipment(null)}
                title="Detalle del Envío"
                subtitle={selectedShipment?.id}
                width="md:w-[600px]"
            >
                {selectedShipment && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-primary)]">{selectedShipment.customerName}</h3>
                                <p className="text-xs text-[var(--text-secondary)]">{selectedShipment.customerPhone}</p>
                            </div>
                            <BaseStatusBadge
                                status={selectedShipment.status}
                                mappings={SHIPMENT_STATUS_MAPPINGS}
                                variant="large"
                            />
                        </div>

                        <div className="p-4 bg-[var(--bg-secondary)]/50 rounded-2xl space-y-3">
                            <div className="flex justify-between">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Dirección</span>
                                <span className="text-xs font-medium text-[var(--text-primary)]">{selectedShipment.address}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Distrito</span>
                                <span className="text-xs font-medium text-[var(--text-primary)]">{selectedShipment.district}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Vendedor</span>
                                <span className="text-xs font-medium text-[var(--text-primary)]">{selectedShipment.vendorName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Pedido</span>
                                <span className="text-xs font-medium text-[var(--text-primary)]">{selectedShipment.orderId}</span>
                            </div>
                        </div>

                        {selectedShipment.notes && (
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                <span className="text-[10px] font-black text-amber-600 uppercase block mb-1">Notas</span>
                                <p className="text-xs text-amber-800">{selectedShipment.notes}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 pt-4">
                            {selectedShipment.status !== 'ENTREGADO' && selectedShipment.status !== 'INCIDENCIA' && (
                                <>
                                    <BaseButton
                                        variant="primary"
                                        size="sm"
                                        onClick={() => advanceStatus(selectedShipment.id)}
                                        leftIcon="ChevronRight"
                                    >
                                        Avanzar Estado
                                    </BaseButton>
                                    <BaseButton
                                        variant="danger"
                                        size="sm"
                                        onClick={() => reportIncident(selectedShipment.id, 'Incidencia reportada')}
                                        leftIcon="AlertTriangle"
                                    >
                                        Reportar Incidencia
                                    </BaseButton>
                                </>
                            )}
                            {selectedShipment.status !== 'ENTREGADO' && (
                                <BaseButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => rescheduleDelivery(selectedShipment.id, 'Entrega reagendada')}
                                    leftIcon="Calendar"
                                >
                                    Reagendar Entrega
                                </BaseButton>
                            )}
                        </div>
                    </div>
                )}
            </BaseDrawer>
        </div>
    );
}
