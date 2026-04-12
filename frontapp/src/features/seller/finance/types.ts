export interface FinanceChartData {
    labels: string[];
    data: number[];
    trend?: string;
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
}

export interface CustomerKPI {
    name: string;
    initials: string;
    category: string;
    metric: string;
    progress: number;
}
