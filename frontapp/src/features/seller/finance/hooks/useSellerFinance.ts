'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FinanceData, RecentInvoice } from '../types';
import { paymentApi, SellerPayment } from '@/shared/lib/api/paymentRepository';
import { shipmentApi, SellerShipment } from '@/shared/lib/api/shipmentRepository';
import { returnApi, SellerReturn } from '@/shared/lib/api/returnRepository';
import { invoiceApi } from '@/shared/lib/api/invoiceRepository';
import type { Voucher } from '@/shared/types/invoices';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from '@/shared/lib/api/token-store';

export interface FinanceFilters {
    startDate: string;
    endDate: string;
}

interface AnalyticsData {
    tiempoRespuesta: number[];
    csat: number;
    stockRotation: number[];
    cuotaMercado: number;
}

function computeFinanceData(
    allPayments: SellerPayment[],
    pendingPayments: SellerPayment[],
    completedPayments: SellerPayment[],
    pendingTotal: number,
    nextPaymentDateFormatted: string,
    shipments: SellerShipment[],
    returns: SellerReturn[],
    recentInvoices: RecentInvoice[],
    analytics: AnalyticsData | null,
): FinanceData {
    const now = new Date();
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

    // ROI: (Ingresos - Inversión) / Inversión × 100
    // Ingresos = amount, Inversión = commission_amount, Neto = amount - commission = Ingresos - Inversión
    // ROI = (Neto / Commission) × 100
    const totalCommissions = filteredAll.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0);
    const roiLabels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const roiData = roiLabels.map((_, i) => {
        const monthPayments = filteredAll.filter(p => {
            const pd = new Date(p.created_at);
            return pd.getMonth() === (now.getMonth() - 5 + i + 12) % 12;
        });
        const monthComm = monthPayments.reduce((sum, p) => sum + (Number(p.commission_amount) || 0), 0);
        const monthNet = monthPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
        return monthComm > 0 ? Math.round((monthNet / monthComm) * 100) : 0;
    });

    // Pending total for next payment card
    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
    const totalPendingAmountRaw = pendingPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // LTV: Ticket Promedio × Frecuencia de Compra (mensual)
    const ltvData = monthLabels.map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const monthPayments = filteredAll.filter(p => {
            const pd = new Date(p.created_at);
            return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        });
        const monthTotal = monthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const monthCount = monthPayments.length;
        const monthTicket = monthCount > 0 ? monthTotal / monthCount : 0;
        const monthCustomers = new Set(monthPayments.map(p => p.order?.userId).filter(Boolean));
        const monthOrders = new Set(monthPayments.map(p => p.order_id).filter(Boolean));
        const monthFreq = monthCustomers.size > 0 ? monthOrders.size / monthCustomers.size : 0;
        return Math.round(monthTicket * monthFreq);
    });

    // Lead Time: histograma con bins de frecuencia
    const shippedShipments = shipments.filter(s => s.shipped_at && s.order?.createdAt);
    const leadTimeValues = shippedShipments.map(s => {
        const created = new Date(s.order!.createdAt).getTime();
        const shipped = new Date(s.shipped_at!).getTime();
        return (shipped - created) / (1000 * 60 * 60);
    });
    const histogramBins = [
        { label: '0-12h', min: 0, max: 12 },
        { label: '12-24h', min: 12, max: 24 },
        { label: '24-48h', min: 24, max: 48 },
        { label: '48-72h', min: 48, max: 72 },
        { label: '72h+', min: 72, max: Infinity },
    ];
    const histogramLabels = histogramBins.map(b => b.label);
    const histogramData = histogramBins.map(bin =>
        leadTimeValues.filter(h => h >= bin.min && h < bin.max).length
    );

    // Defectuosos: (Productos Reclamados / Productos Vendidos) × 100 (Pie chart: [ok%, defect%])
    const defectReasons = ['defective', 'arrived_damaged', 'not_as_described'];
    const totalCompleted = completedPayments.length || 1;
    const defectCount = returns.filter(r => defectReasons.includes(r.reason)).length;
    const defectRate = Math.min((defectCount / totalCompleted) * 100, 100);

    // Desglose Financiero
    const totalConIgv = filteredAll.reduce((sum, p) => sum + (Number(p.total_con_igv) || Number(p.amount) * 1.18), 0);
    const totalIgv = filteredAll.reduce((sum, p) => sum + (Number(p.igv) || Number(p.amount) * 0.18), 0);
    const totalPending = pendingPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);
    const totalCompletedAmt = completedPayments.reduce((sum, p) => sum + (Number(p.net_amount) || 0), 0);

    // Meta de ingresos: mes anterior + 20%, y cuántas ventas faltan para alcanzarla
    // al ticket promedio actual (crecimiento vs. mejor mes reciente).
    const ingresoMesActual = monthDataIngresosNetos[monthDataIngresosNetos.length - 1] ?? 0;
    const ingresoMesAnterior = monthDataIngresosNetos[monthDataIngresosNetos.length - 2] ?? 0;
    const metaMensual = ingresoMesAnterior * 1.2;
    const faltanteSoles = Math.max(0, metaMensual - ingresoMesActual);
    const ventasFaltantes = avgTicket > 0 ? Math.ceil(faltanteSoles / avgTicket) : 0;

    const analyticsTiempo = analytics?.tiempoRespuesta ?? [0, 0, 0, 0];
    const analyticsStock = analytics?.stockRotation ?? [0, 0, 0, 0];
    const analyticsCuota = analytics?.cuotaMercado ?? 0;
    return {
        desgloseFinanciero: {
            totalConIgv,
            totalIgv,
            totalCommission: totalCommissions,
            totalNeto: totalNetos,
            totalPending,
            totalCompleted: totalCompletedAmt,
            pendingCount: pendingPayments.length,
            completedCount: completedPayments.length,
        },
        comprobantesRecientes: recentInvoices,
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
            data: roiData,
        },
        cuotaMercado: {
            labels: ['Tu Tienda', 'Otras Tiendas'],
            data: [analyticsCuota, Math.max(0, 100 - analyticsCuota)],
        },
        ltv: {
            labels: monthLabels,
            data: ltvData,
        },
        categories: {
            labels: ['Productos', 'Servicios'],
            data: [0, 0],
        },
        leadTime: {
            labels: histogramLabels,
            data: histogramData,
        },
        defectuosos: {
            labels: ['Sin Defectos', 'Defectuosos'],
            data: [100 - defectRate, defectRate],
        },
        tiempoRespuesta: {
            labels: weekLabels,
            data: analyticsTiempo,
        },
        stockRotacion: {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            data: analyticsStock,
        },
        csat: {
            labels: ['CSAT'],
            data: [analytics?.csat ?? 0],
        },
        metaIngresos: {
            ingresoMesAnterior,
            ingresoMesActual,
            metaMensual,
            faltanteSoles,
            ticketPromedio: avgTicket,
            ventasFaltantes,
            metaAlcanzada: ingresoMesAnterior > 0 && ingresoMesActual >= metaMensual,
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

    const { data: recentInvoices = [], isLoading: loading7 } = useQuery({
        queryKey: ['seller', 'finance', 'recent-invoices'],
        queryFn: async () => {
            const vouchers = await invoiceApi.list({ per_page: 5 });
            return (vouchers || []).map((v: Voucher) => ({
                id: v.id,
                series: v.series,
                number: v.number,
                type: v.type,
                sunat_status: v.sunat_status,
                total: v.amount,
                emission_date: v.emission_date,
            })) as RecentInvoice[];
        },
        staleTime: 5 * 60 * 1000,
    });

    const { data: analyticsData, isLoading: loading8 } = useQuery({
        queryKey: ['seller', 'finance', 'analytics'],
        queryFn: async (): Promise<AnalyticsData | null> => {
            try {
                const authHeaders = await getAuthHeaders();
                const res = await fetch(`${LARAVEL_API_URL}/seller/finance/analytics`, {
                    headers: { 'Accept': 'application/json', ...authHeaders as Record<string, string> },
                });
                if (!res.ok) return null;
                const json = await res.json();
                return json.data ?? null;
            } catch {
                return null;
            }
        },
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
            recentInvoices,
            analyticsData ?? null,
        );
    }, [allPayments, pendingPayments, completedPayments, pendingTotalData, shipments, returns, recentInvoices, analyticsData]);

    const isLoading = loading1 || loading2 || loading3 || loading4 || loading5 || loading6 || loading7 || loading8;

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
