export interface FinanceChartData {
    labels: string[];
    data: number[];
    trend?: string;
}

export interface FinancialBreakdown {
    totalConIgv: number;
    totalIgv: number;
    totalCommission: number;
    totalNeto: number;
    totalPending: number;
    totalCompleted: number;
    pendingCount: number;
    completedCount: number;
}

export interface RecentInvoice {
    id: string;
    series: string;
    number: string;
    type: string;
    sunat_status: string;
    total: number;
    emission_date: string;
}

export interface TopBuyer {
    id: string;
    name: string;
    clv: number;
    purchases: number;
    lastPurchase: string;
    avatar?: string;
}

export interface HeatmapData {
    day: string;
    hour: number;
    value: number;
}

export interface FinanceData {
    ingresosBrutos: FinanceChartData;
    ingresosNetos: FinanceChartData;
    ingresosReales: FinanceChartData;
    ventasTotales: FinanceChartData;
    ticketPromedio: FinanceChartData;
    chartProxPago: FinanceChartData;
    roi: FinanceChartData;
    cuotaMercado: FinanceChartData;
    ltv: FinanceChartData;
    categories: FinanceChartData;
    leadTime: FinanceChartData;
    defectuosos: FinanceChartData;
    tiempoRespuesta: FinanceChartData;
    stockRotacion: FinanceChartData;
    csat: FinanceChartData;
    desgloseFinanciero: FinancialBreakdown;
    comprobantesRecientes: RecentInvoice[];
    heatmap: HeatmapData[];
    topBuyers: TopBuyer[];
}

export interface CustomerKPI {
    name: string;
    initials: string;
    category: string;
    metric: string;
    progress: number;
}
