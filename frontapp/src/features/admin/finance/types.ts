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
  proximoPago: number;
  csat: { promedio: number; total: number };
  roi: FinanceChartData;
  cuotaMercado: FinanceChartData;
  ltv: FinanceChartData;
  categories: FinanceChartData;
  leadTime: FinanceChartData;
  defectuosos: FinanceChartData;
  tiempoRespuesta: FinanceChartData;
  stockRotacion: FinanceChartData;
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
