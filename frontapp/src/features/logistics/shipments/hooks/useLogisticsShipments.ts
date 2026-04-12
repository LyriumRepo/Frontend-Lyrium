'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shipment, ShipmentStatus, LogisticsKPI } from '@/lib/types/logistics';
import { mockShipments, shipmentStatusLabels } from '@/lib/mocks/logistics';

const STATUS_FLOW: ShipmentStatus[] = [
    'ASIGNADO',
    'RECOGIDO',
    'EN_TRÁNSITO',
    'EN_DESTINO',
    'ENTREGADO'
];

export function useLogisticsShipments() {
    const queryClient = useQueryClient();
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [filters, setFilters] = useState({
        search: '',
        status: 'ALL' as ShipmentStatus | 'ALL',
    });

    // --- Query: Fetch Shipments ---
    const { data: shipments = [], isLoading } = useQuery({
        queryKey: ['logistics', 'shipments'],
        queryFn: async () => {
            // Simulamos delay de red
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockShipments as Shipment[];
        },
        staleTime: 3 * 60 * 1000,
    });

    // --- Mutations ---
    const updateShipmentMutation = useMutation({
        mutationFn: async (updatedShipment: Shipment) => {
            console.log("Updating shipment:", updatedShipment.id);
            return updatedShipment;
        },
        onSuccess: (updatedShipment) => {
            queryClient.setQueryData(['logistics', 'shipments'], (old: Shipment[] | undefined) => {
                if (!old) return old;
                return old.map(s => s.id === updatedShipment.id ? updatedShipment : s);
            });
        }
    });

    const filteredShipments = useMemo(() => {
        return shipments.filter(s => {
            const matchesSearch = !filters.search ||
                s.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
                s.orderId.toLowerCase().includes(filters.search.toLowerCase());

            const matchesStatus = filters.status === 'ALL' || s.status === filters.status;

            return matchesSearch && matchesStatus;
        });
    }, [shipments, filters]);

    const kpis = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        const pending = shipments.filter(s => s.status === 'ASIGNADO').length;
        const inTransit = shipments.filter(s => s.status === 'EN_TRÁNSITO').length;
        const deliveredToday = shipments.filter(s =>
            s.status === 'ENTREGADO' && s.deliveredAt?.startsWith(today)
        ).length;
        const withIncidents = shipments.filter(s => s.status === 'INCIDENCIA' || s.status === 'REAGENDADO').length;

        return [
            { label: 'Pendientes', value: pending, icon: 'Package', color: 'amber' as const },
            { label: 'En Tránsito', value: inTransit, icon: 'Truck', color: 'sky' as const },
            { label: 'Entregados Hoy', value: deliveredToday, icon: 'CheckCircle', color: 'emerald' as const },
            { label: 'Con Incidencias', value: withIncidents, icon: 'AlertTriangle', color: 'rose' as const },
        ] as LogisticsKPI[];
    }, [shipments]);

    const advanceStatus = (shipmentId: string, note?: string) => {
        const s = shipments.find(s => s.id === shipmentId);
        if (!s) return;

        const currentIndex = STATUS_FLOW.indexOf(s.status);
        if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return;

        const nextStatus = STATUS_FLOW[currentIndex + 1];
        const updated: Shipment = {
            ...s,
            previousStatus: s.status,
            status: nextStatus,
            notes: note || s.notes,
            updatedAt: new Date().toISOString(),
            deliveredAt: nextStatus === 'ENTREGADO' ? new Date().toISOString() : undefined,
        };
        updateShipmentMutation.mutate(updated);
    };

    const reportIncident = (shipmentId: string, note: string) => {
        const s = shipments.find(s => s.id === shipmentId);
        if (!s) return;

        const updated: Shipment = {
            ...s,
            previousStatus: s.status,
            status: 'INCIDENCIA' as ShipmentStatus,
            notes: note,
            updatedAt: new Date().toISOString(),
        };
        updateShipmentMutation.mutate(updated);
    };

    const rescheduleDelivery = (shipmentId: string, note: string) => {
        const s = shipments.find(s => s.id === shipmentId);
        if (!s) return;

        const updated: Shipment = {
            ...s,
            previousStatus: s.status,
            status: 'REAGENDADO' as ShipmentStatus,
            notes: note,
            updatedAt: new Date().toISOString(),
        };
        updateShipmentMutation.mutate(updated);
    };

    return {
        shipments: filteredShipments,
        allShipments: shipments,
        selectedShipment,
        setSelectedShipment,
        filters,
        setFilters,
        kpis,
        isLoading,
        advanceStatus,
        reportIncident,
        rescheduleDelivery,
        shipmentStatusLabels,
    };
}
