'use client';

import React, { useState } from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import dynamic from 'next/dynamic';
import type { FinanceChartProps, FinanceChartDataset } from './components/FinanceChart';
const FinanceChart = dynamic<FinanceChartProps>(
  () => import('./components/FinanceChart'),
  { ssr: false }
);
import CardProxPago from './components/CardProxPago';
import FinancialBreakdownCard from './components/FinancialBreakdownCard';
import ComprobantesSection from './components/ComprobantesSection';
import KpiDetailModal, { getKpiDetail } from './components/KpiDetailModal';
import { useToast } from '@/shared/lib/context/ToastContext';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseStatCard from '@/components/ui/BaseStatCard';
import { BaseDatePicker } from '@/components/ui';
import Icon from '@/components/ui/Icon';
import { useFinanceAnalytics } from '@/features/admin/finance/hooks/useFinanceAnalytics';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import { companyColors, chartColorMap } from '@/features/admin/finance/colors';
import type { FinanceData } from '@/features/admin/finance/types';

interface KpiConfig {
  label: string;
  value: string;
  description: string;
  icon: string;
  color: string;
  chartType: 'line' | 'bar' | 'doughnut' | 'radar';
  chartLabels: string[];
  chartData: number[];
  chartColor: string;
  suffix?: string;
  extraInfo: string;
  chartDatasets?: FinanceChartDataset[];
}

function buildKpiConfig(
  label: string,
  value: string,
  description: string,
  icon: string,
  color: string,
  chartType: 'line' | 'bar' | 'doughnut' | 'radar',
  chartLabels: string[],
  chartData: number[],
  chartColor: string,
  suffix?: string,
  chartDatasets?: FinanceChartDataset[],
): KpiConfig {
  return {
    label,
    value,
    description,
    icon,
    color,
    chartType,
    chartLabels,
    chartData,
    chartColor,
    suffix,
    extraInfo: getKpiDetail(label),
    chartDatasets,
  };
}

function trendOf(arr: number[]): { value: number; isPositive: boolean } | undefined {
  if (arr.length < 2) return undefined;
  const last = arr[arr.length - 1] ?? 0;
  const prev = arr[arr.length - 2] ?? 0;
  if (prev === 0) return undefined;
  const pct = Math.abs(((last - prev) / prev) * 100);
  return { value: parseFloat(pct.toFixed(1)), isPositive: last >= prev };
}

export function FinancePageClient() {
  const {
    data,
    isLoading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    applyFilters: hookApplyFilters,
    isVisible,
    isRefreshing,
  } = useFinanceAnalytics();

  const { showToast } = useToast();
  const [selectedKpi, setSelectedKpi] = useState<KpiConfig | null>(null);

  const handleApplyFilters = async () => {
    if (!filters.startDate || !filters.endDate) {
      showToast('Selecciona un rango de fechas completo', 'info');
      return;
    }
    const success = await hookApplyFilters();
    if (success) {
      showToast('Datos sincronizados según el periodo seleccionado', 'success');
    } else {
      showToast('Error al sincronizar datos. Intenta nuevamente.', 'error');
    }
  };


  if (isLoading && !data) {
    return <BaseLoading message="Sincronizando Finanzas..." />;
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--turquesa-100)' }}>
          <Icon name="AlertCircle" className="w-10 h-10" style={{ color: 'var(--turquesa-500)' }} />
        </div>
        <p className="text-lg font-bold text-[var(--text-primary)]">No pudimos cargar los datos financieros</p>
        <p className="text-sm text-[var(--text-muted)]">Verifica tu conexión e intenta nuevamente</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all hover:brightness-110" style={{ backgroundColor: 'var(--celeste-500)' }}>Reintentar</button>
      </div>
    );
  }

  const tabs = [
    { id: 'all', label: 'Todos', icon: 'LayoutGrid' },
    { id: 'monetario', label: 'Monetario', icon: 'Banknote' },
    { id: 'logistica', label: 'Logística', icon: 'Truck' },
    { id: 'calidad', label: 'Calidad', icon: 'CheckCircle2' },
    { id: 'fidelizacion', label: 'Fidelización', icon: 'Users' },
    { id: 'servicio', label: 'Servicio', icon: 'MessageCircle' },
    { id: 'crecimiento', label: 'Crecimiento', icon: 'TrendingUp' },
    { id: 'inventario', label: 'Inventario', icon: 'Package' },
    { id: 'satisfaccion', label: 'Satisfacción', icon: 'Smile' },
  ];

  const openKpi = (
    label: string,
    value: string,
    description: string,
    icon: string,
    color: string,
    chartType: 'line' | 'bar' | 'doughnut' | 'radar',
    chartLabels: string[],
    chartData: number[],
    chartColor: string,
    suffix?: string,
  ) => {
    setSelectedKpi(buildKpiConfig(label, value, description, icon, color, chartType, chartLabels, chartData, chartColor, suffix));
  };

  // Helper to open a stat card with chart data from a data field
  const openStatCard = (
    label: string,
    dataField: keyof FinanceData,
    d: FinanceData,
    chartType: 'line' | 'bar' | 'doughnut' | 'radar',
    colorKey: string,
  ) => {
    const field = d[dataField] as { labels: string[]; data: number[] } | undefined;
    if (!field) return;
    const chartColor = chartColorMap[dataField] || companyColors.azulCeleste;
    const chartLabels = field.labels;
    const chartData = field.data;
    const total = chartData.reduce((a, b) => a + b, 0);
    const val = dataField === 'ventasTotales'
      ? total.toString()
      : dataField === 'roi'
        ? `${chartData[chartData.length - 1] ?? 0}%`
        : dataField === 'leadTime'
          ? (chartData.length > 0 && total > 0 ? `${Math.round(total / chartData.length)}h` : '0h')
          : dataField === 'stockRotacion'
            ? `${chartData[chartData.length - 1] ?? 0}`
            : dataField === 'ltv'
              ? `S/ ${chartData[chartData.length - 1] ?? 0}`
              : formatCurrency(total);
    const suff = dataField === 'ventasTotales' ? 'Ord.' : undefined;
    openKpi(label, val, field.labels.join(', '), '', '', chartType, chartLabels, chartData, chartColor, suff);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <ModuleHeader
        title="Centro de Finanzas y Estadísticas"
        subtitle="Monitoreo en tiempo real de tus KPIs estratégicos"
        icon="PieChart"
      />

      {/* Card de filtros — mismo estilo que Facturación y Pagos */}
      <div className="bg-[var(--bg-card)] p-6 sm:p-8 rounded-[2.5rem] shadow-xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-[var(--brand-green)] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <Icon name="CalendarDays" className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)]">
            Periodo de Análisis
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <BaseDatePicker
              label="Desde"
              value={filters.startDate}
              onChange={(v) => setFilters(v, filters.endDate)}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <div className="space-y-2">
            <BaseDatePicker
              label="Hasta"
              value={filters.endDate}
              onChange={(v) => setFilters(filters.startDate, v)}
              placeholder="dd/mm/aaaa"
            />
          </div>
          <button
            onClick={handleApplyFilters}
            disabled={isRefreshing}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 w-full sm:w-auto"
          >
            {isRefreshing ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Icon name="Search" className="w-4 h-4" />
            )}
            Aplicar
          </button>
        </div>
      </div>

      <div className="relative border-b border-[var(--border-subtle)] pb-1">
        <div className="flex flex-nowrap overflow-x-auto gap-2 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-6 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 active:scale-[0.98] ${activeTab === tab.id
                ? 'bg-gradient-to-r from-sky-500 to-sky-400 dark:from-emerald-700 dark:to-teal-600 text-white shadow-lg shadow-sky-500/25 dark:shadow-emerald-900/25'
                : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                }`}
            >
              <Icon name={tab.icon as unknown as 'LayoutGrid'} className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
        {/* Fade derecho — indica scroll disponible */}
        <div className="absolute right-0 top-0 bottom-1 w-12 bg-gradient-to-l from-[var(--bg-canvas)] to-transparent pointer-events-none" />
      </div>

      <div className="space-y-12">
        {/* 1. MONETARIO */}
        {isVisible('monetario') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.lima }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">MONETARIO</h2>
            </div>

            <FinancialBreakdownCard data={data.desgloseFinanciero} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              {/* Tarjeta multi-serie: Brutos + Netos + Reales */}
              <div className="col-span-1 md:col-span-2 lg:col-span-3">
                <BaseStatCard
                  label="Evolución de Ingresos"
                  value={formatCurrency(data.ingresosBrutos.data.reduce((a, b) => a + b, 0))}
                  description="Comparativa mensual: Bruto, Neto y Real"
                  icon="TrendingUp"
                  color="lima"
                  chart={
                    <FinanceChart
                      type="line"
                      labels={data.ingresosBrutos.labels}
                      data={data.ingresosBrutos.data}
                      datasets={[
                        { label: 'Brutos', data: data.ingresosBrutos.data, color: chartColorMap.ingresosBrutos },
                        { label: 'Netos', data: data.ingresosNetos.data, color: chartColorMap.ingresosNetos },
                        { label: 'Reales', data: data.ingresosReales.data, color: chartColorMap.ingresosReales },
                      ]}
                      height="360px"
                    />
                  }
                  onClick={() => setSelectedKpi(buildKpiConfig(
                    'Evolución de Ingresos',
                    formatCurrency(data.ingresosBrutos.data.reduce((a, b) => a + b, 0)),
                    'Comparativa mensual de ingresos: Bruto (sin deducciones), Neto (tras comisión Lyrium) y Real (efectivamente cobrado).',
                    'TrendingUp',
                    companyColors.lima,
                    'line',
                    data.ingresosBrutos.labels,
                    data.ingresosBrutos.data,
                    chartColorMap.ingresosBrutos,
                    undefined,
                    [
                      { label: 'Brutos', data: data.ingresosBrutos.data, color: chartColorMap.ingresosBrutos },
                      { label: 'Netos', data: data.ingresosNetos.data, color: chartColorMap.ingresosNetos },
                      { label: 'Reales', data: data.ingresosReales.data, color: chartColorMap.ingresosReales },
                    ],
                  ))}
                />
              </div>

              <CardProxPago data={data.chartProxPago} formatCurrency={formatCurrency} />

              <BaseStatCard
                label="ROI de Ventas"
                value={`${data.roi.data[data.roi.data.length - 1] ?? 0}%`}
                description="Retorno sobre inversión en comisiones"
                icon="TrendingUp"
                color="turquesaClaro"
                trend={trendOf(data.roi.data)}
                chart={<FinanceChart type="bar" labels={data.roi.labels} data={data.roi.data} color={chartColorMap.roi} />}
                onClick={() => openStatCard('ROI de Ventas', 'roi', data, 'bar', 'turquesaClaro')}
              />
              <BaseStatCard
                label="Ticket Promedio"
                value={(() => {
                  const totalVentas = data.ventasTotales.data.reduce((a, b) => a + b, 0);
                  const totalBrutos = data.ingresosBrutos.data.reduce((a, b) => a + b, 0);
                  return totalVentas > 0 ? formatCurrency(totalBrutos / totalVentas) : formatCurrency(0);
                })()}
                description="Valor medio por pedido (sin IGV)"
                icon="Tag"
                color="turquesa"
                trend={trendOf(data.ticketPromedio.data)}
                chart={<FinanceChart type="bar" labels={data.ticketPromedio.labels} data={data.ticketPromedio.data} color={chartColorMap.ticketPromedio} />}
                onClick={() => openStatCard('Ticket Promedio', 'ticketPromedio', data, 'bar', 'turquesa')}
              />
              <BaseStatCard
                label="Ventas Totales"
                value={data.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                description="Número de transacciones"
                icon="ShoppingCart"
                color="azulCeleste"
                suffix="Ord."
                trend={trendOf(data.ventasTotales.data)}
                chart={<FinanceChart type="bar" labels={data.ventasTotales.labels} data={data.ventasTotales.data} color={chartColorMap.ventasTotales} />}
                onClick={() => openStatCard('Ventas Totales', 'ventasTotales', data, 'bar', 'azulCeleste')}
              />
            </div>

            <ComprobantesSection invoices={data.comprobantesRecientes} />
          </div>
        )}

        {/* 2. LOGÍSTICA */}
        {isVisible('logistica') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.turquesaClaro }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Rendimiento Logístico</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              <BaseStatCard
                label="Lead Time de Despacho"
                value={(() => {
                  const total = data.leadTime.data.reduce((a, b) => a + b, 0);
                  const count = data.leadTime.data.length;
                  return count > 0 && total > 0 ? `${Math.round(total / count)}h` : '0h';
                })()}
                description="Distribución de frecuencias (histograma)"
                icon="Timer"
                color="turquesaClaro"
                chart={<FinanceChart type="bar" labels={data.leadTime.labels} data={data.leadTime.data} color={chartColorMap.leadTime} />}
                onClick={() => openStatCard('Lead Time de Despacho', 'leadTime', data, 'bar', 'turquesaClaro')}
              />
            </div>
          </div>
        )}

        {/* 3. CALIDAD */}
        {isVisible('calidad') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.turquesa }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Control de Calidad</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              <button
                onClick={() => openKpi(
                  'Tasa de Productos Defectuosos',
                  `${data.defectuosos.data[1] ?? 0}%`,
                  'Productos con reportes de fallas',
                  'AlertOctagon',
                  companyColors.turquesa,
                  'doughnut',
                  data.defectuosos.labels,
                  data.defectuosos.data,
                  chartColorMap.defectuosos,
                )}
                className="group text-left bg-[var(--bg-card)] p-4 sm:p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-4 sm:mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: companyColors.turquesa }}>Tasa de Productos Defectuosos</span>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${companyColors.turquesa}1A`, color: companyColors.turquesa }}>
                    <Icon name="AlertOctagon" className="w-5 h-5" />
                  </div>
                </div>
                <div className="w-full h-[200px]">
                  <FinanceChart type="doughnut" labels={data.defectuosos.labels} data={data.defectuosos.data} color={chartColorMap.defectuosos} />
                </div>
                <p className="text-2xl font-black mt-6" style={{ color: companyColors.turquesa }}>{data.defectuosos.data[1] ?? 0}%</p>
                <p className="text-xs text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest">Productos con reportes de fallas</p>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
                    <Icon name="ArrowRight" className="w-3 h-3" />
                    Ver detalle
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* 4. FIDELIZACIÓN */}
        {isVisible('fidelizacion') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.celeste }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Fidelización de Clientes</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              <BaseStatCard
                label="LTV (Lifetime Value)"
                value={`S/ ${data.ltv.data[data.ltv.data.length - 1] ?? 0}`}
                description="Ticket Promedio × Frecuencia de Compra"
                icon="Coins"
                color="celeste"
                chart={<FinanceChart type="line" labels={data.ltv.labels} data={data.ltv.data} color={chartColorMap.ltv} fill={true} />}
                onClick={() => openStatCard('LTV (Lifetime Value)', 'ltv', data, 'line', 'celeste')}
              />
            </div>
          </div>
        )}

        {/* 5. SERVICIO */}
        {isVisible('servicio') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.turquesaClaro }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Servicio al Cliente</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              <button
                onClick={() => openKpi(
                  'Tiempo de Respuesta (Chat)',
                  `${data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1] ?? 0} min`,
                  'Tiempo promedio de respuesta en chat',
                  'Clock',
                  companyColors.turquesaClaro,
                  'bar',
                  data.tiempoRespuesta.labels,
                  data.tiempoRespuesta.data,
                  chartColorMap.tiempoRespuesta,
                )}
                className="group text-left bg-[var(--bg-card)] p-4 sm:p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-4 sm:mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: companyColors.turquesaClaro }}>Tiempo de Respuesta (Chat)</span>
                  <div className="p-2 rounded-lg" style={{ backgroundColor: `${companyColors.turquesaClaro}1A`, color: companyColors.turquesaClaro }}>
                    <Icon name="Clock" className="w-5 h-5" />
                  </div>
                </div>
                <div className="relative w-40 h-40 mx-auto mb-4">
                  <svg viewBox="0 0 120 120" className="w-full h-full">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-[var(--border-subtle)]" />
                    <circle cx="60" cy="60" r="54" fill="none" stroke={chartColorMap.tiempoRespuesta} strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={`${(data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1] ?? 0) / 60 * 339.292} 339.292`}
                      transform="rotate(-90 60 60)" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black" style={{ color: companyColors.turquesaClaro }}>
                      {data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1] ?? 0}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-widest text-center">minutos promedio</p>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
                    <Icon name="ArrowRight" className="w-3 h-3" />
                    Ver detalle
                  </span>
                </div>
              </button>
              <BaseStatCard
                label="Tasa de Resolución"
                value="N/A"
                description="Próximamente"
                icon="CheckCircle"
                color="turquesa"
              />
            </div>
          </div>
        )}

        {/* 6. CRECIMIENTO */}
        {isVisible('crecimiento') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.azulCeleste }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Estrategia de Crecimiento</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              <BaseStatCard
                label="Cuota de Mercado Interna"
                value={`${data.cuotaMercado.data[0] ?? 0}%`}
                description="(Ventas del Vendedor / Ventas Totales) × 100"
                icon="PieChart"
                color="azulCeleste"
                chart={<FinanceChart type="radar" labels={data.cuotaMercado.labels} data={data.cuotaMercado.data} color={chartColorMap.cuotaMercado} />}
                onClick={() => openStatCard('Cuota de Mercado Interna', 'cuotaMercado', data, 'radar', 'azulCeleste')}
              />
            </div>
          </div>
        )}

        {/* 7. INVENTARIO */}
        {isVisible('inventario') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.verde }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Control de Inventario</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              <BaseStatCard
                label="Rotación de Stock"
                value={`${data.stockRotacion.data[data.stockRotacion.data.length - 1] ?? 0}`}
                description="Costo de Ventas / Inventario Promedio"
                icon="RefreshCw"
                color="verde"
                chart={<FinanceChart type="bar" labels={data.stockRotacion.labels} data={data.stockRotacion.data} color={chartColorMap.stockRotacion} />}
                onClick={() => openStatCard('Rotación de Stock', 'stockRotacion', data, 'bar', 'verde')}
              />
              <BaseStatCard
                label="Ventas Totales"
                value={data.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                description="Unidades vendidas en el período"
                icon="Package"
                color="azulCeleste"
                chart={<FinanceChart type="bar" labels={data.ventasTotales.labels} data={data.ventasTotales.data} color={chartColorMap.ventasTotales} />}
                onClick={() => openStatCard('Ventas Totales', 'ventasTotales', data, 'bar', 'azulCeleste')}
              />
            </div>
          </div>
        )}

        {/* 8. SATISFACCIÓN */}
        {isVisible('satisfaccion') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2 animate-section-reveal">
              <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: companyColors.turquesa }} />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Experiencia del Cliente</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-grid">
              <button
                onClick={() => openKpi(
                  'CSAT - Satisfacción del Cliente',
                  data.csat.data[0] > 0 ? `${data.csat.data[0]}%` : 'N/A',
                  'Porcentaje de clientes satisfechos',
                  'Star',
                  companyColors.turquesa,
                  'bar',
                  data.csat.labels,
                  data.csat.data,
                  chartColorMap.csat,
                )}
                className="group text-left bg-[var(--bg-card)] p-4 sm:p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between w-full mb-4 sm:mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: companyColors.turquesa }}>CSAT - Satisfacción del Cliente</span>
                  <Icon name="Star" className="w-5 h-5" style={{ color: companyColors.turquesa }} />
                </div>
                <div className="flex gap-1 mb-4 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Icon
                      key={star}
                      name="Star"
                      className="w-8 h-8"
                      style={{ color: companyColors.turquesa, fill: star <= Math.round(4.5) ? companyColors.turquesa : undefined }}
                    />
                  ))}
                </div>
                <p className="text-xl font-black text-center" style={{ color: companyColors.turquesa }}>{data.csat.data[0] > 0 ? `${data.csat.data[0]}%` : 'N/A'}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold uppercase tracking-widest text-center">Calificaciones positivas</p>
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
                    <Icon name="ArrowRight" className="w-3 h-3" />
                    Ver detalle
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalle de KPI */}
      <KpiDetailModal
        isOpen={!!selectedKpi}
        onClose={() => setSelectedKpi(null)}
        kpi={selectedKpi}
      />
    </div>
  );
}
