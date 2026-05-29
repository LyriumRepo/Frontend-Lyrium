'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FinanceData } from '../types';
import { paymentApi, SellerPayment } from '@/shared/lib/api/paymentRepository';
import { shipmentApi, SellerShipment } from '@/shared/lib/api/shipmentRepository';
import { returnApi, SellerReturn } from '@/shared/lib/api/returnRepository';

export interface FinanceFilters {
    startDate: string;
    endDate: string;
}

function computeFinanceData(
    allPayments: SellerPayment[],
    pendingPayments: SellerPayment[],
    completedPayments: SellerPayment[],
    pendingTotal: number,
    nextPaymentDateFormatted: string,
    shipments: SellerShipment[],
    returns: SellerReturn[],
): FinanceData {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Filter by date range if payments exist
    const filteredAll = allPayments.length > 0 ? allPayments : [];

    // Monthly aggregation (last 6 months)
    const monthLabels: string[] = [];
    const monthDataIngresosBrutos: number[] = [];
    const monthDataIngresosNetos: number[] = [];
    const monthDataIngresosReales: number[] = [];

    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = d.toLocaleDateString('es-PE', { month: 'short', year: '2-digit' });
        monthLabels.push(monthKey);

        const monthPayments = filteredAll.filter(p => {
            const pd = new Date(p.created_at);
            return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        });

        const brutos = monthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const netos = monthPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
        const reales = monthPayments
            .filter(p => p.status === 'completed')
            .reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);

        monthDataIngresosBrutos.push(brutos);
        monthDataIngresosNetos.push(netos);
        monthDataIngresosReales.push(reales);
    }

    // Weekly aggregation for ventasTotales
    const weekLabels: string[] = [];
    const weekData: number[] = [];
    for (let w = 3; w >= 0; w--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - w * 7);
        const weekKey = `Sem ${d.getDate()}/${d.getMonth() + 1}`;
        weekLabels.push(weekKey);

        const weekStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

        const count = filteredAll.filter(p => {
            const pd = new Date(p.created_at);
            return pd >= weekStart && pd < weekEnd;
        }).length;

        weekData.push(count);
    }

    // Total numbers
    const totalBrutos = filteredAll.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalNetos = filteredAll.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
    const totalReales = completedPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
    const totalCount = filteredAll.length;
    const avgTicket = totalCount > 0 ? totalBrutos / totalCount : 0;

    // Ticket promedio daily (last 7 days)
    const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const ticketData = dayLabels.map((_, idx) => {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - idx));
        const dayPayments = filteredAll.filter(p => {
            const pd = new Date(p.created_at);
            return pd.toDateString() === d.toDateString();
        });
        const dayTotal = dayPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        return dayPayments.length > 0 ? dayTotal / dayPayments.length : avgTicket;
    });

    // ROI: calculate from commission data
    const totalCommissions = filteredAll.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0);
    const roiValue = totalCommissions > 0
        ? ((totalNetos - totalCommissions) / totalCommissions) * 100
        : 0;

    const roiLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const roiData = roiLabels.map((_, i) => {
        const monthPayments = filteredAll.filter(p => {
            const pd = new Date(p.created_at);
            return pd.getMonth() === (now.getMonth() - 5 + i + 12) % 12;
        });
        const monthComm = monthPayments.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0);
        const monthNet = monthPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
        return monthComm > 0 ? ((monthNet - monthComm) / monthComm) * 100 : 0;
    });

    // Pending total for next payment card
    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
    const totalPendingAmountRaw = pendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // LTV approximation from repeat payments
    const uniqueOrders = new Set(filteredAll.map(p => p.order_id).filter(Boolean));
    const ltvValue = uniqueOrders.size > 0 ? totalBrutos / uniqueOrders.size : 0;

    // Lead Time: avg hours from shipment creation to shipped_at
    const shippedShipments = shipments.filter(s => s.shipped_at && s.created_at);
    const leadHours = shippedShipments.length > 0
        ? shippedShipments.reduce((sum, s) => {
            const created = new Date(s.created_at!).getTime();
            const shipped = new Date(s.shipped_at!).getTime();
            return sum + (shipped - created) / (1000 * 60 * 60);
        }, 0) / shippedShipments.length
        : 0;
    const leadTimeData = weekLabels.map(() => Math.round(leadHours * 10) / 10);
    const finalLeadData = leadHours > 0
        ? leadTimeData
        : weekLabels.map(() => 0);

    // Defectuosos: count returns with defect reasons / total completed payments
    const defectReasons = ['defective', 'arrived_damaged', 'not_as_described'];
    const totalCompleted = completedPayments.length || 1;
    const defectCount = returns.filter(r => defectReasons.includes(r.reason)).length;
    const defectRate = Math.round((defectCount / totalCompleted) * 100 * 10) / 10;
    const defectLabels = monthLabels.slice(-3);

    // Metrics below have no available backend data source:
    // - stockRotacion: no inventory history system
    // - cuotaMercado: no marketplace-wide aggregation
    // - tiempoRespuesta: no seller-accessible ticket response-time endpoint
    // - categories: no product/service breakdown in payment data

    return {
        ingresosBrutos: {
            labels: monthLabels,
            data: monthDataIngresosBrutos,
            trend: monthDataIngresosBrutos.length >= 2
                ? `${(((monthDataIngresosBrutos[monthDataIngresosBrutos.length - 1] - monthDataIngresosBrutos[0]) / (monthDataIngresosBrutos[0] || 1)) * 100).toFixed(0)}%`
                : '0%',
        },
        ingresosNetos: {
            labels: monthLabels,
            data: monthDataIngresosNetos,
            trend: monthDataIngresosNetos.length >= 2
                ? `${(((monthDataIngresosNetos[monthDataIngresosNetos.length - 1] - monthDataIngresosNetos[0]) / (monthDataIngresosNetos[0] || 1)) * 100).toFixed(0)}%`
                : '0%',
        },
        ingresosReales: {
            labels: monthLabels,
            data: monthDataIngresosReales,
            trend: monthDataIngresosReales.length >= 2
                ? `${(((monthDataIngresosReales[monthDataIngresosReales.length - 1] - monthDataIngresosReales[0]) / (monthDataIngresosReales[0] || 1)) * 100).toFixed(0)}%`
                : '0%',
        },
        ventasTotales: {
            labels: weekLabels,
            data: weekData,
            trend: weekData.length >= 2 && weekData[0] > 0
                ? `${(((weekData[weekData.length - 1] - weekData[0]) / weekData[0]) * 100).toFixed(0)}%`
                : '0%',
        },
        ticketPromedio: {
            labels: dayLabels,
            data: ticketData.map(v => Math.round(v)),
            trend: ticketData.length >= 2
                ? `${(((ticketData[ticketData.length - 1] - ticketData[0]) / (ticketData[0] || 1)) * 100).toFixed(0)}%`
                : '0%',
        },
        chartProxPago: {
            labels: ['Recaudado', 'Restante'],
            data: [totalPendingAmount, Math.max(0, totalPendingAmountRaw - totalPendingAmount)],
        },
        roi: {
            labels: roiLabels,
            data: roiData.map(v => Math.round(v)),
        },
        cuotaMercado: {
            labels: ['Tu Tienda', 'Competencia A', 'Competencia B', 'Otros'],
            data: [0, 0, 0, 0],
        },
        ltv: {
            labels: ['Últimos 6 meses'],
            data: [Math.round(ltvValue)],
        },
        categories: {
            labels: ['Productos', 'Servicios'],
            data: [0, 0],
        },
        leadTime: {
            labels: weekLabels,
            data: finalLeadData,
        },
        defectuosos: {
            labels: defectLabels,
            data: defectLabels.map(() => defectRate),
        },
        tiempoRespuesta: {
            labels: weekLabels,
            data: weekLabels.map(() => 0),
        },
        stockRotacion: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            data: [0, 0, 0, 0],
        },
    };
}

export function useSellerFinance() {
    const [activeTab, setActiveTab] = useState('all');
    const [filters, setFiltersState] = useState<FinanceFilters>({
        startDate: '',
        endDate: ''
    });

    const dateFilter = filters.startDate && filters.endDate ? filters : undefined;

    const { data: allPayments = [], isLoading: loading1, refetch: refetch1 } = useQuery({
        queryKey: ['seller', 'finance', 'payments', filters],
        queryFn: () => paymentApi.list(dateFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: pendingPayments = [], isLoading: loading2, refetch: refetch2 } = useQuery({
        queryKey: ['seller', 'finance', 'pending', filters],
        queryFn: () => paymentApi.pendingPayments(dateFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: completedPayments = [], isLoading: loading3, refetch: refetch3 } = useQuery({
        queryKey: ['seller', 'finance', 'completed', filters],
        queryFn: () => paymentApi.completedPayments(dateFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: pendingTotalData, isLoading: loading4, refetch: refetch4 } = useQuery({
        queryKey: ['seller', 'finance', 'pending-total', filters],
        queryFn: () => paymentApi.pendingTotal(dateFilter),
        staleTime: 5 * 60 * 1000,
    });

    const { data: shipments = [], isLoading: loading5 } = useQuery({
        queryKey: ['seller', 'shipments'],
        queryFn: () => shipmentApi.list(),
        staleTime: 5 * 60 * 1000,
    });

    const { data: returns = [], isLoading: loading6 } = useQuery({
        queryKey: ['seller', 'returns'],
        queryFn: () => returnApi.list(),
        staleTime: 5 * 60 * 1000,
    });

    const data = useMemo<FinanceData | null>(() => {
        if (!allPayments) return null;
        return computeFinanceData(
            allPayments,
            pendingPayments,
            completedPayments,
            pendingTotalData?.data?.total_pending ?? 0,
            pendingTotalData?.data?.next_payment_date_formatted ?? '',
            shipments,
            returns,
        );
    }, [allPayments, pendingPayments, completedPayments, pendingTotalData, shipments, returns]);

    const isLoading = loading1 || loading2 || loading3 || loading4 || loading5 || loading6;

    const setFilters = (startDate: string, endDate: string) => {
        setFiltersState({ startDate, endDate });
    };

    const isVisible = (tabId: string) => activeTab === 'all' || activeTab === tabId;

    const [isRefreshing, setIsRefreshing] = useState(false);

    const applyFilters = async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([refetch1(), refetch2(), refetch3(), refetch4()]);
        } finally {
            setIsRefreshing(false);
        }
        return true;
    };

    return {
        data,
        isLoading,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        applyFilters,
        isVisible,
        isRefreshing,
    };
}
