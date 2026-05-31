import React from 'react';
import {
    KpiCard,
    ScatterPerformanceChart,
    RetentionLineChart,
    CatalogPerformanceList,
    SellerLeaderboard,
    GeographicMapBars,
    FrequencyBars
} from './AnalyticsCharts';
import { AnalyticsKPI } from '@/features/admin/analytics/types';
import { Store, Users } from 'lucide-react';
import { SalesHeatmap } from '@/components/admin/finance/FinanceCharts';
import { MOCK_FINANCE_DATA } from '@/lib/mocks/financeData';
import Skeleton from '@/components/ui/Skeleton';
import FinanceChart from '@/features/seller/finance/components/FinanceChart';
import CardProxPago from '@/features/seller/finance/components/CardProxPago';
import { useSellerFinance } from '@/features/seller/finance/hooks/useSellerFinance';
import { formatCurrency } from '@/shared/lib/utils/formatters';
import BaseStatCard from '@/components/ui/BaseStatCard';
import Icon from '@/components/ui/Icon';
import { Banknote } from 'lucide-react';
interface AnalyticsModuleProps {
    state: {
        data: any;
        loading: boolean;
        filters: Record<string, any>;
        activeTab: string;
        kpis: AnalyticsKPI[];
        topSellers: any[];
    };
    actions: Record<string, unknown>;
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({ state, actions }) => {
    const { data, loading, filters, activeTab, kpis, topSellers } = state;
       const {
        data: financeData,
        isLoading: isFinanceLoading,
        activeTab: financeActiveTab,
        setActiveTab: setFinanceActiveTab,
        isVisible: isFinanceVisible
    } = useSellerFinance();

    if (loading || !data) {
        return (
            <div className="space-y-8 animate-fadeIn pb-20 font-industrial">
                {/* FILTROS SKELETON */}
                <Skeleton className="w-full h-32 rounded-[2.5rem]" />

                {/* KPI SKELETONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={`analytics-skel-${i}`} className="bg-[var(--bg-card)] p-7 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-8 w-16 rounded-md" />
                            </div>
                            <Skeleton className="h-4 w-24 rounded" />
                        </div>
                    ))}
                </div>

                {/* TABS SKELETON */}
                <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[2rem] w-fit mx-auto border border-[var(--border-subtle)]/50 backdrop-blur-sm shadow-inner mb-4">
                    <Skeleton className="h-12 w-48 rounded-[1.7rem]" />
                    <Skeleton className="h-12 w-48 rounded-[1.7rem] ml-1" />
                </div>

                {/* CONTENT SKELETON */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <Skeleton className="w-full h-[500px] rounded-[2.5rem]" />
                    </div>
                    <div className="lg:col-span-4">
                        <Skeleton className="w-full h-[500px] rounded-[2.5rem]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20 font-industrial">

            {/* FILTROS DE INTELIGENCIA (RF-11) */}
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end relative z-10">
                    <div className="space-y-2">
                        <label htmlFor="analytics-period" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                            Periodo de Análisis Lógico
                        </label>
                        <select
                            id="analytics-period"
                            value={filters.period as string}
                            onChange={(e) => (actions.setFilters as Function)({ ...filters, period: e.target.value })}
                            className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)] uppercase cursor-pointer"
                        >
                            <option value="TODAY">Día Actual (Today)</option>
                            <option value="LAST_24H">Últimas 24 Horas</option>
                            <option value="LAST_30">Últimos 30 días</option>
                            <option value="LAST_90">Últimos 90 días</option>
                            <option value="CAMPAÑA">Black Friday / Campaña Especial</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="analytics-rubro" className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">
                            Aislar Sector Corporativo
                        </label>
                        <select
                            id="analytics-rubro"
                            value={filters.rubro as string}
                            onChange={(e) => (actions.setFilters as Function)({ ...filters, rubro: e.target.value })}
                            className="w-full p-4 bg-[var(--bg-input)] border-none rounded-2xl text-xs font-black text-[var(--text-primary)] uppercase cursor-pointer"
                        >
                            <option value="ALL">Totalidad del Mercado (Global)</option>
                            <option value="Insumos">Sector: Insumos Agrícolas</option>
                            <option value="Herramientas">Sector: Maquinaria y Herramientas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KEY INTELLIGENCE METRICS (RF-11) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi: AnalyticsKPI) => <KpiCard key={kpi.label} kpi={kpi} />)}
            </div>

            {/* TABS DE ANALÍTICA PROFUNDA */}
            <div className="flex bg-[var(--bg-secondary)]/80 p-1.5 rounded-[2rem] w-fit mx-auto border border-[var(--border-subtle)]/50 backdrop-blur-sm shadow-inner mb-4">
                <button
                    className={`px-10 py-3.5 rounded-[1.7rem] text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'vendedores' ? 'bg-[var(--bg-card)] text-indigo-500 shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                        }`}
                    onClick={() => (actions.setActiveTab as Function)('vendedores')}
                >
                    <Store className="w-4 h-4" /> Rendimiento Oferta (Vendedores)
                </button>
                <button
                    className={`px-10 py-3.5 rounded-[1.7rem] text-xs font-black transition-all flex items-center gap-2 ${activeTab === 'clientes' ? 'bg-[var(--bg-card)] text-indigo-500 shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
                        }`}
                    onClick={() => (actions.setActiveTab as Function)('clientes')}
                >
                    <Users className="w-4 h-4" /> Comportamiento Demanda (Clientes)
                </button>
              
                   <button
         className={`px-10 py-3.5 rounded-[1.7rem] text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'finanzas' ? 'bg-[var(--bg-card)] text-indigo-500 shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)]/50'
        }`}
        onClick={() => (actions.setActiveTab as Function)('finanzas')}
    >
        <Banknote className="w-4 h-4" /> Finanzas (Vendedores)
    </button>
            </div>

            {/* TAB: VENDEDORES (RF-10) */}
            <div className={`transition-all duration-500 origin-top h-auto ${activeTab === 'vendedores' ? 'opacity-100 scale-y-100 flex-1 relative' : 'opacity-0 h-0 overflow-hidden scale-y-0 absolute'}`}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Gráfico Dispersión: ROI vs Conversión */}
                        <div className="lg:col-span-8 bg-[var(--bg-card)] p-8 min-h-[500px] rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">
                                        Rendimiento Estratégico Multivariante
                                    </h3>
                                    <p className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                                        Análisis de Dispersión (ROI vs Conversión)
                                    </p>
                                </div>
                                <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded-lg border border-amber-500/20 uppercase animate-pulse">
                                    Motor Predictivo Activo
                                </span>
                            </div>
                            <div className="relative h-[350px]">
                                <ScatterPerformanceChart sellers={data.vendedoresAnalitica as any} />
                            </div>
                        </div>

                        {/* Productos Estrella vs Hueso */}
                        <div className="lg:col-span-4 bg-[var(--bg-card)] p-8 flex flex-col overflow-hidden relative rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl">
                            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-8">
                                Rotación de Catálogo
                            </h3>
                            <CatalogPerformanceList products={data.catalogoRendimiento} />
                        </div>
                    </div>

                    {/* Comparativa de Rubro Leaderboard */}
                    <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl">
                        <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-8">
                            Líderes de Mercado (Benchmark Operacional)
                        </h3>
                        {topSellers.length > 0 ? (
                            <SellerLeaderboard sellers={topSellers} />
                        ) : (
                            <div className="text-center py-10 font-bold text-[var(--text-muted)] uppercase text-xs">No hay datos para la muestra con los filtros actuales.</div>
                        )}
                    </div>
                </div>
            </div>
{/* >>> PEGUE ESTE BLOQUE FINANCIERO INTEGRAL AQUÍ: */}
{activeTab === 'finanzas' && financeData && (
    <div className="space-y-8 animate-fadeIn">
        {/* Menú de Sub-Pestañas Financieras y Operativas Completo */}
        <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-4 overflow-x-auto no-scrollbar">
            {[
                { id: 'all', label: 'Todos', icon: 'LayoutGrid' },
                { id: 'monetario', label: 'Monetario', icon: 'Banknote' },
                { id: 'logistica', label: 'Logística', icon: 'Truck' },
                { id: 'calidad', label: 'Calidad', icon: 'CheckCircle2' },
                { id: 'fidelizacion', label: 'Fidelización', icon: 'Users' },
                { id: 'servicio', label: 'Servicio', icon: 'MessageCircle' },
                { id: 'crecimiento', label: 'Crecimiento', icon: 'TrendingUp' },
                { id: 'inventario', label: 'Inventario', icon: 'Package' },
                { id: 'satisfaccion', label: 'Satisfacción', icon: 'Smile' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setFinanceActiveTab(tab.id)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                        financeActiveTab === tab.id
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
                    }`}
                >
                    <Icon name={tab.icon as any} className="w-4 h-4" /> {tab.label}
                </button>
            ))}
        </div>

        <div className="space-y-12">
            {/* 1. MONETARIO */}
            {isFinanceVisible('monetario') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Análisis Monetario Global</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <BaseStatCard
                            label="Ingresos Brutos"
                            value={formatCurrency(financeData.ingresosBrutos.data.reduce((a, b) => a + b, 0))}
                            description="Total de ventas acumuladas"
                            icon="Banknote"
                            color="sky"
                            chart={<FinanceChart type="line" labels={financeData.ingresosBrutos.labels} data={financeData.ingresosBrutos.data} color="#0EA5E9" />}
                        />
                        <BaseStatCard
                            label="Ingresos Netos"
                            value={formatCurrency(financeData.ingresosNetos.data.reduce((a, b) => a + b, 0))}
                            description="Monto neto después de comisiones"
                            icon="LineChart"
                            color="emerald"
                            chart={<FinanceChart type="line" labels={financeData.ingresosNetos.labels} data={financeData.ingresosNetos.data} color="#10B981" />}
                        />
                        <CardProxPago data={financeData.chartProxPago} formatCurrency={formatCurrency} />

                        <BaseStatCard
                            label="ROI de Ventas"
                            value={financeData.ingresosBrutos.trend || '0%'}
                            description="Retorno sobre la inversión"
                            icon="TrendingUp"
                            color="sky"
                            chart={<FinanceChart type="line" labels={financeData.roi.labels} data={financeData.roi.data} color="#0EA5E9" />}
                        />
                        <BaseStatCard
                            label="Ventas Totales"
                            value={financeData.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                            description="Número de transacciones"
                            icon="ShoppingCart"
                            color="emerald"
                            suffix="Ord."
                            chart={<FinanceChart type="bar" labels={financeData.ventasTotales.labels} data={financeData.ventasTotales.data} color="#10B981" />}
                        />
                        <BaseStatCard
                            label="Ticket Promedio"
                            value={formatCurrency(financeData.ingresosBrutos.data.reduce((a, b) => a + b, 0) / financeData.ventasTotales.data.reduce((a, b) => a + b, 0))}
                            description="Valor medio por pedido"
                            icon="Tag"
                            color="sky"
                            chart={<FinanceChart type="line" labels={financeData.ticketPromedio.labels} data={financeData.ticketPromedio.data} color="#0EA5E9" />}
                        />
                    </div>
                </div>
            )}

            {/* 2. LOGÍSTICA */}
            {isFinanceVisible('logistica') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Rendimiento Logístico Global</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <BaseStatCard
                            label="Lead Time Despacho"
                            value={`${financeData.leadTime.data[financeData.leadTime.data.length - 1]}h`}
                            description="Tiempo promedio desde pedido a despacho"
                            icon="Timer"
                            color="sky"
                            chart={<FinanceChart type="bar" labels={financeData.leadTime.labels} data={financeData.leadTime.data} color="#0EA5E9" />}
                        />
                    </div>
                </div>
            )}

            {/* 3. CALIDAD */}
            {isFinanceVisible('calidad') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Control de Calidad</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-card p-8 border-l-4 border-emerald-400 bg-[var(--bg-card)] flex flex-col items-center rounded-[2.5rem] border border-[var(--border-subtle)]">
                            <div className="flex items-center justify-between w-full mb-6">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tasa de Defectuosos</span>
                                <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400"><Icon name="AlertOctagon" className="text-xl w-5 h-5" /></div>
                            </div>
                            <div className="w-full h-[200px]">
                                <FinanceChart type="bar" labels={financeData.defectuosos.labels} data={financeData.defectuosos.data} color="#10B981" />
                            </div>
                            <p className="text-2xl font-black text-emerald-400 mt-6">{financeData.defectuosos.data[financeData.defectuosos.data.length - 1]}%</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest">Productos con reportes de fallas</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. FIDELIZACIÓN */}
            {isFinanceVisible('fidelizacion') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Fidelización de Clientes</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BaseStatCard
                            label="Valor de Vida del Cliente (LTV)"
                            value={`S/ ${financeData.ltv.data[financeData.ltv.data.length - 1]}`}
                            description="Revenue per customer lifetime"
                            icon="Coins"
                            color="sky"
                            chart={<FinanceChart type="line" labels={financeData.ltv.labels} data={financeData.ltv.data} color="#0EA5E9" />}
                        />
                        <BaseStatCard
                            label="Cuota de Mercado"
                            value={`${financeData.cuotaMercado.data[financeData.cuotaMercado.data.length - 1]}%`}
                            description="Porcentaje del mercado objetivo"
                            icon="PieChart"
                            color="emerald"
                            chart={<FinanceChart type="bar" labels={financeData.cuotaMercado.labels} data={financeData.cuotaMercado.data} color="#10B981" />}
                        />
                    </div>
                </div>
            )}

            {/* 5. SERVICIO */}
            {isFinanceVisible('servicio') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Servicio al Cliente</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BaseStatCard
                            label="Tiempo de Respuesta"
                            value={`${financeData.tiempoRespuesta.data[financeData.tiempoRespuesta.data.length - 1]} min`}
                            description="Promedio de respuesta a tickets"
                            icon="Clock"
                            color="emerald"
                            chart={<FinanceChart type="bar" labels={financeData.tiempoRespuesta.labels} data={financeData.tiempoRespuesta.data} color="#10B981" />}
                        />
                        <BaseStatCard
                            label="Tasa de Resolución"
                            value={`${financeData.defectuosos.data[financeData.defectuosos.data.length - 1]}%`}
                            description="Problemas resueltos en primera respuesta"
                            icon="CheckCircle"
                            color="sky"
                            chart={<FinanceChart type="line" labels={financeData.defectuosos.labels} data={financeData.defectuosos.data} color="#0EA5E9" />}
                        />
                    </div>
                </div>
            )}

            {/* 6. CRECIMIENTO */}
            {isFinanceVisible('crecimiento') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Estrategia de Crecimiento</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BaseStatCard
                            label="ROI de Crecimiento"
                            value={`${financeData.roi.data[financeData.roi.data.length - 1]}%`}
                            description="Retorno sobre inversión"
                            icon="TrendingUp"
                            color="rose"
                            chart={<FinanceChart type="line" labels={financeData.roi.labels} data={financeData.roi.data} color="#F43F5E" />}
                        />
                        <BaseStatCard
                            label="Cuota de Mercado Objetivo"
                            value={`${financeData.cuotaMercado.data[financeData.cuotaMercado.data.length - 1]}%`}
                            description="Participación en el mercado"
                            icon="BarChart"
                            color="sky"
                            chart={<FinanceChart type="bar" labels={financeData.cuotaMercado.labels} data={financeData.cuotaMercado.data} color="#0EA5E9" />}
                        />
                    </div>
                </div>
            )}

            {/* 7. INVENTARIO */}
            {isFinanceVisible('inventario') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Control de Inventario Global</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BaseStatCard
                            label="Rotación de Stock"
                            value={`${financeData.stockRotacion.data[financeData.stockRotacion.data.length - 1]}`}
                            description="Veces que se renueva el inventario"
                            icon="RefreshCw"
                            color="sky"
                            chart={<FinanceChart type="bar" labels={financeData.stockRotacion.labels} data={financeData.stockRotacion.data} color="#0EA5E9" />}
                        />
                        <BaseStatCard
                            label="Unidades Vendidas"
                            value={financeData.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                            description="Unidades vendidas en el período"
                            icon="Package"
                            color="emerald"
                            chart={<FinanceChart type="bar" labels={financeData.ventasTotales.labels} data={financeData.ventasTotales.data} color="#10B981" />}
                        />
                    </div>
                </div>
            )}

            {/* 8. SATISFACCIÓN */}
            {isFinanceVisible('satisfaccion') && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
                        <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Experiencia y Satisfacción Global</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <BaseStatCard
                            label="Tiempo de Respuesta Promedio"
                            value={`${financeData.tiempoRespuesta.data[financeData.tiempoRespuesta.data.length - 1]} min`}
                            description="Satisfacción medida en tiempo"
                            icon="Smile"
                            color="sky"
                            chart={<FinanceChart type="line" labels={financeData.tiempoRespuesta.labels} data={financeData.tiempoRespuesta.data} color="#0EA5E9" />}
                        />
                        <BaseStatCard
                            label="Calidad de Entrega"
                            value={`${100 - financeData.defectuosos.data[financeData.defectuosos.data.length - 1]}%`}
                            description="Productos sin fallas reportadas"
                            icon="Award"
                            color="emerald"
                            chart={<FinanceChart type="bar" labels={financeData.defectuosos.labels} data={financeData.defectuosos.data.map(d => 100 - d)} color="#10B981" />}
                        />
                    </div>
                </div>
            )}
        </div>
    </div>
)}
            {/* TAB: CLIENTES (RF-11) */}
            <div className={`transition-all duration-500 origin-top h-auto ${activeTab === 'clientes' ? 'opacity-100 scale-y-100 flex-1' : 'opacity-0 h-0 overflow-hidden scale-y-0 absolute'}`}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Análisis Geográfico Map */}
                        <div className="lg:col-span-12 lg:row-start-2 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">
                                        Radar Geográfico de Oportunidades
                                    </h3>
                                    <p className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                                        Concentración de Demanda Nacional
                                    </p>
                                </div>
                            </div>
                            <GeographicMapBars zones={data.comportamientoClientes.demografia} />
                        </div>

                        {/* Retención de Cohortes */}
                        <div className="lg:col-span-12 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl">
                            <SalesHeatmap data={MOCK_FINANCE_DATA.heatmap} />
                        </div>

                        {/* Retención de Cohortes */}
                        <div className="lg:col-span-7 bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl">
                            <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-8">
                                Indice de Retención Temporal (LTV)
                            </h3>
                            <div className="relative h-[300px]">
                                <RetentionLineChart retentionData={data.comportamientoClientes.retencion_mensual} />
                            </div>
                        </div>

                        {/* Frecuencia de Compra Segmentada */}
                        <div className="lg:col-span-5 bg-sky-500 text-white p-8 border-none shadow-2xl shadow-sky-500/20 rounded-[2.5rem] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/50 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-sky-400/50 transition-all duration-700"></div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8 relative z-10">
                                Elasticidad de Frecuencia (Días)
                            </h3>
                            <FrequencyBars segments={data.comportamientoClientes.frecuencia_segmentos} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};
