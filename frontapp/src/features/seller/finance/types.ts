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

export interface MetaIngresos {
    /** Ingreso neto del mes anterior (base de la meta). */
    ingresoMesAnterior: number;
    /** Ingreso neto acumulado en el mes actual. */
    ingresoMesActual: number;
    /** Meta = ingreso del mes anterior + 20%. */
    metaMensual: number;
    /** Cuánto falta en soles para alcanzar la meta (0 si ya se alcanzó). */
    faltanteSoles: number;
    /** Ticket promedio usado para la proyección. */
    ticketPromedio: number;
    /** Ventas adicionales estimadas (redondeadas hacia arriba) para alcanzar la meta. */
    ventasFaltantes: number;
    /** true si ya se alcanzó o superó la meta este mes. */
    metaAlcanzada: boolean;
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
    metaIngresos: MetaIngresos;
}

export interface CustomerKPI {
    name: string;
    initials: string;
    category: string;
    metric: string;
    progress: number;
}
