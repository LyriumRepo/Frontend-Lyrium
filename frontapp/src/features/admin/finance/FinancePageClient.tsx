'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import FinanceChart from './components/FinanceChart';
import CardProxPago from './components/CardProxPago';
import { useToast } from '@/shared/lib/context/ToastContext';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseStatCard from '@/components/ui/BaseStatCard';
import { BaseDatePicker } from '@/components/ui';
import Icon from '@/components/ui/Icon';
import { useFinanceAnalytics } from './hooks/useFinanceAnalytics';
import { formatCurrency } from '@/shared/lib/utils/formatters';

interface FinancePageClientProps {
}

export function FinancePageClient(_props: FinancePageClientProps) {
    const {
        data,
        isLoading,
        activeTab,
        setActiveTab,
        filters,
        setFilters,
        applyFilters: hookApplyFilters,
        isVisible
    } = useFinanceAnalytics();

    const { showToast } = useToast();

    const handleApplyFilters = async () => {
        const success = await hookApplyFilters();
        if (!success) {
            showToast('Selecciona un rango de fechas completo', 'info');
        } else {
            showToast('Datos sincronizados según el periodo seleccionado', 'success');
        }
    };

    const headerActions = (
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <BaseDatePicker value={filters.startDate}
                onChange={(v) => setFilters(v, filters.endDate)} placeholder="Desde" />
            <span className="text-white/30 text-lg font-thin">|</span>
            <BaseDatePicker value={filters.endDate}
                onChange={(v) => setFilters(filters.startDate, v)} placeholder="Hasta" />
            <button
                type="button"
                onClick={handleApplyFilters}
                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition active:scale-95"
            >
                <Icon name="Search" className="w-4 h-4" />
            </button>
        </div>
    );

    if (isLoading && !data) {
        return <BaseLoading message="Cargando Finanzas del Panel..." />;
    }

    if (!data) return null;

    const tabs = [
        { id: 'all', label: 'Todos', icon: 'LayoutGrid' },
        { id: 'monetario', label: 'Monetario', icon: 'Banknote' },
        { id: 'logistica', label: 'Logística', icon: 'Truck' },
        { id: 'calidad', label: 'Calidad', icon: 'CheckCircle2' },
        { id: 'fidelizacion', label: 'Fidelización', icon: 'Users' },
        { id: 'servicio', label: 'Servicio', icon: 'MessageCircle' },
        { id: 'crecimiento', label: 'Crecimiento', icon: 'TrendingUp' },
        { id: 'inventario', label: 'Inventario', icon: 'Package' },
        { id: 'satisfaccion', label: 'Satisfacción', icon: 'Smile' }
    ];

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            <ModuleHeader
                title="Centro de Finanzas y Estadísticas"
                subtitle="Monitoreo global de KPI financieros, analítica y rendimiento de mercado"
                icon="PieChart"
                actions={headerActions}
            />

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-emerald-950 pb-4 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-[var(--brand-sky)] dark:bg-[var(--brand-green)] text-white shadow-lg shadow-[var(--brand-sky)]/10 dark:shadow-[var(--brand-green)]/10'
                            : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] dark:hover:bg-[var(--brand-green-hover)]'
                            }`}
                    >
                        <Icon name={tab.icon as any} className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="space-y-12">
                {/* 1. MONETARIO */}
                {isVisible('monetario') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[var(--brand-sky)] rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Análisis Monetario</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                                    <div className="absolute top-0 left-0 w-72 h-72 bg-sky-500/5 dark:bg-sky-500/2 rounded-full -ml-36 -mt-36 blur-3xl transition-all duration-700 group-hover:scale-125" />
                                    <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full -mr-36 -mb-36 blur-3xl transition-all duration-700 group-hover:scale-125" />
                                    
                                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-[var(--border-subtle)] pb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">Rendimiento Consolidado</span>
                                            </div>
                                            <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">Centro de Control de Ingresos</h3>
                                        </div>
                                        
                                        <div className="flex flex-wrap gap-6">
                                            <div>
                                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">Ingresos Brutos</span>
                                                <span className="text-2xl font-black text-[var(--brand-sky)]">{formatCurrency(data.ingresosBrutos.data.reduce((a, b) => a + b, 0))}</span>
                                            </div>
                                            <div className="w-[1px] h-10 bg-[var(--border-subtle)] hidden sm:block" />
                                            <div>
                                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">Ingresos Netos</span>
                                                <span className="text-2xl font-black text-emerald-500">{formatCurrency(data.ingresosNetos.data.reduce((a, b) => a + b, 0))}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="relative z-10 h-[280px]">
                                        <FinanceChart
                                            type="line"
                                            labels={data.ingresosBrutos.labels}
                                            datasets={[
                                                {
                                                    label: 'Ingresos Brutos',
                                                    data: data.ingresosBrutos.data,
                                                    color: '--brand-sky'
                                                },
                                                {
                                                    label: 'Ingresos Netos',
                                                    data: data.ingresosNetos.data,
                                                    color: '--color-success'
                                                }
                                            ]}
                                            height="280px"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="lg:col-span-1">
                                <CardProxPago data={data.chartProxPago} formatCurrency={formatCurrency} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] hover:border-[var(--color-info)]/30 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-info)]/5 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-info)]/5 rounded-full blur-3xl transition-all duration-750 group-hover:scale-125" />
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[var(--color-info)]/10 text-[var(--color-info)] rounded-xl flex items-center justify-center border border-[var(--color-info)]/20">
                                                <Icon name="TrendingUp" className="w-5 h-5 stroke-[2.5px]" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-[var(--color-info)] uppercase tracking-wider block">Campañas</span>
                                                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">ROI de Ventas</h4>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-info)] to-sky-400">
                                                {data.ingresosBrutos.trend || '0%'}
                                            </span>
                                            <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">Retorno de inversión</p>
                                        </div>
                                        <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]/50">
                                            {data.roi.labels.map((l, idx) => (
                                                <div key={l} className="flex justify-between items-center text-[9px] font-bold uppercase text-[var(--text-secondary)]">
                                                    <span>{l}</span>
                                                    <span className="text-[var(--text-primary)] font-black">{data.roi.data[idx]}%</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="lg:col-span-7 h-[180px] flex items-center justify-center">
                                        <FinanceChart type="doughnut" labels={data.roi.labels} data={data.roi.data} color="--color-info" cutout="65%" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] hover:border-[var(--color-success)]/30 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--color-success)]/5 hover:-translate-y-1">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-success)]/5 rounded-full blur-3xl transition-all duration-750 group-hover:scale-125" />
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                                    <div className="lg:col-span-4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[var(--color-success)]/10 text-[var(--color-success)] rounded-xl flex items-center justify-center border border-[var(--color-success)]/20">
                                                <Icon name="ShoppingCart" className="w-5 h-5 stroke-[2.5px]" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-[var(--color-success)] uppercase tracking-wider block">Transacciones</span>
                                                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">Ventas Totales</h4>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-success)] to-emerald-400">
                                                    {data.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                                                </span>
                                                <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-wider">Ord.</span>
                                            </div>
                                            <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">Volumen acumulado</p>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-8 h-[180px] flex items-center justify-center">
                                        <FinanceChart type="line" labels={data.ventasTotales.labels} data={data.ventasTotales.data} color="--color-success" fill={true} tension={0.4} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] hover:border-[var(--brand-sky)]/30 shadow-sm relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-[var(--brand-sky)]/5 hover:-translate-y-1">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-sky)]/5 rounded-full blur-3xl transition-all duration-750 group-hover:scale-125" />
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                                <div className="lg:col-span-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] rounded-xl flex items-center justify-center border border-[var(--brand-sky)]/20">
                                                <Icon name="Tag" className="w-5 h-5 stroke-[2.5px]" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-[var(--brand-sky)] uppercase tracking-wider block">Promedio</span>
                                                <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider">Ticket Promedio</h4>
                                            </div>
                                        </div>
                                        <span className="text-[9px] font-black px-2.5 py-1 bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] rounded-full uppercase tracking-wider border border-[var(--brand-sky)]/20">
                                            Pedido
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end pt-2">
                                        <div>
                                            <span className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-[var(--brand-sky)] to-cyan-400">
                                                {formatCurrency(data.ingresosBrutos.data.reduce((a, b) => a + b, 0) / data.ventasTotales.data.reduce((a, b) => a + b, 0))}
                                            </span>
                                            <p className="text-[9px] text-[var(--text-secondary)] font-bold uppercase tracking-wider mt-1">Valor medio facturado por pedido</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-base font-black text-[var(--text-primary)]">Max: {formatCurrency(Math.max(...data.ticketPromedio.data))}</span>
                                            <p className="text-[8px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">Pico del período</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:col-span-8 h-[180px]">
                                    <FinanceChart type="bar" labels={data.ticketPromedio.labels} data={data.ticketPromedio.data} color="--brand-sky" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isVisible('logistica') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[var(--brand-sky)] rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Rendimiento Logístico</h2>
                        </div>
                        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brand-sky)]/5 rounded-full -mr-16 -mt-16 blur-2xl transition-all duration-700 group-hover:scale-150" />
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-[var(--brand-sky)]/10 text-[var(--brand-sky)] rounded-2xl flex items-center justify-center">
                                            <Icon name="Timer" className="w-6 h-6 stroke-[2.5px]" />
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] block">KPI Logístico</span>
                                            <h3 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Lead Time Despacho</h3>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-4xl font-black text-[var(--brand-sky)] tracking-tight">{data.leadTime.data[data.leadTime.data.length - 1]}h</span>
                                        <p className="text-xs text-[var(--text-secondary)] mt-1 font-bold uppercase tracking-wider">Tiempo promedio de procesamiento</p>
                                    </div>
                                    <p className="text-[9px] font-bold text-[var(--text-secondary)]/70 uppercase leading-relaxed italic">
                                        Mide el tiempo promedio transcurrido desde la recepción del pedido hasta su despacho.
                                    </p>
                                </div>
                                <div className="lg:col-span-2 h-[180px]">
                                    <FinanceChart type="line" labels={data.leadTime.labels} data={data.leadTime.data} color="--brand-sky" fill={true} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. CALIDAD */}
                {isVisible('calidad') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Control de Calidad</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Tasa de Defectuosos - Medidor (Gauge) */}
                            <div className="bg-[var(--bg-card)] p-8 border border-[var(--border-subtle)] rounded-[2.5rem] flex flex-col items-center shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl transition-all" />
                                <div className="flex items-center justify-between w-full mb-6 relative z-10">
                                    <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">Tasa de Defectuosos (Medidor)</span>
                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 border border-emerald-500/20"><Icon name="AlertOctagon" className="text-xl w-5 h-5" /></div>
                                </div>
                                <div className="relative w-full h-[200px] flex items-center justify-center">
                                    <FinanceChart type="doughnut" labels={data.defectuosos.labels} data={data.defectuosos.data} color="--color-success" cutout="75%" />
                                    <div className="absolute text-center mt-4">
                                        <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider block leading-none mb-1">Tasa Promedio</span>
                                        <span className="text-xl font-black text-emerald-500 dark:text-emerald-400">{data.defectuosos.data[data.defectuosos.data.length - 1]}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] mt-4 font-bold uppercase tracking-widest text-center relative z-10">Productos con reportes de fallas</p>
                            </div>

                        </div>
                    </div>
                )}

                {/* 4. FIDELIZACIÓN */}
                {isVisible('fidelizacion') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Fidelización de Clientes</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Valor de Vida del Cliente - Gráfico de Áreas */}
                            <BaseStatCard
                                label="Valor de Vida del Cliente"
                                value={`S/ ${data.ltv.data[data.ltv.data.length - 1]}`}
                                description="Revenue per customer lifetime"
                                icon="Coins"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.ltv.labels} data={data.ltv.data} color="--brand-sky" fill={true} />}
                            />

                            {/* Cuota de Mercado - Gráfico de Tarta (Pie) */}
                            <BaseStatCard
                                label="Cuota de Mercado"
                                value={`${data.cuotaMercado.data[data.cuotaMercado.data.length - 1]}%`}
                                description="Porcentaje del mercado objetivo"
                                icon="PieChart"
                                color="emerald"
                                chart={<FinanceChart type="doughnut" labels={data.cuotaMercado.labels} data={data.cuotaMercado.data} color="--color-success" cutout="0%" />}
                            />
                        </div>
                    </div>
                )}

                {isVisible('servicio') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[var(--color-success)] rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Servicio al Cliente</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BaseStatCard
                                label="Tiempo de Respuesta"
                                value={`${data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1]} min`}
                                description="Promedio de respuesta a tickets"
                                icon="Clock"
                                color="emerald"
                                chart={<FinanceChart type="line" labels={data.tiempoRespuesta.labels} data={data.tiempoRespuesta.data} color="--color-success" fill={true} />}
                            />
                            <BaseStatCard
                                label="Tasa de Resolución"
                                value={`${100 - data.defectuosos.data[data.defectuosos.data.length - 1]}%`}
                                description="Problemas resueltos en primera respuesta"
                                icon="CheckCircle"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.defectuosos.labels} data={data.defectuosos.data.map(d => 100 - d)} color="--brand-sky" fill={true} />}
                            />
                        </div>
                    </div>
                )}

                {/* 6. CRECIMIENTO */}
                {isVisible('crecimiento') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Estrategia de Crecimiento</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* ROI - Gráfico de Áreas */}
                            <BaseStatCard
                                label="ROI"
                                value={`${data.roi.data[data.roi.data.length - 1]}%`}
                                description="Retorno sobre inversión"
                                icon="TrendingUp"
                                color="rose"
                                chart={<FinanceChart type="line" labels={data.roi.labels} data={data.roi.data} color="--color-error" fill={true} />}
                            />

                            {/* Cuota de Mercado - Gráfico de Tarta (Pie) */}
                            <BaseStatCard
                                label="Cuota de Mercado"
                                value={`${data.cuotaMercado.data[data.cuotaMercado.data.length - 1]}%`}
                                description="Participación en el mercado"
                                icon="BarChart"
                                color="sky"
                                chart={<FinanceChart type="doughnut" labels={data.cuotaMercado.labels} data={data.cuotaMercado.data} color="--brand-sky" cutout="0%" />}
                            />
                        </div>
                    </div>
                )}

                {isVisible('inventario') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[var(--brand-sky)] rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Control de Inventario</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BaseStatCard
                                label="Rotación de Stock"
                                value={`${data.stockRotacion.data[data.stockRotacion.data.length - 1]}`}
                                description="Veces que se renueva el inventario"
                                icon="RefreshCw"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.stockRotacion.labels} data={data.stockRotacion.data} color="--brand-sky" fill={true} />}
                            />
                            <BaseStatCard
                                label="Ventas Totales"
                                value={data.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                                description="Unidades vendidas en el período"
                                icon="Package"
                                color="emerald"
                                chart={<FinanceChart type="bar" labels={data.ventasTotales.labels} data={data.ventasTotales.data} color="--color-success" />}
                            />
                        </div>
                    </div>
                )}

                {isVisible('satisfaccion') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-[var(--brand-sky)] rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Experiencia del Cliente</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BaseStatCard
                                label="Tiempo de Respuesta"
                                value={`${data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1]} min`}
                                description="Satisfacción medida en tiempo"
                                icon="Smile"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.tiempoRespuesta.labels} data={data.tiempoRespuesta.data} color="--brand-sky" fill={true} />}
                            />
                            <div className="bg-[var(--bg-card)] p-8 border border-[var(--border-subtle)] rounded-[2.5rem] flex flex-col items-center shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-success)]/5 rounded-full blur-xl transition-all" />
                                <div className="flex items-center justify-between w-full mb-6 relative z-10">
                                    <span className="text-xs font-bold text-[var(--color-success)] uppercase tracking-wider">Índice de Calidad</span>
                                    <div className="bg-[var(--color-success)]/10 p-2 rounded-lg text-[var(--color-success)] border border-[var(--color-success)]/20">
                                        <Icon name="Award" className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="relative w-full h-[180px] flex items-center justify-center">
                                    <FinanceChart
                                        type="doughnut"
                                        labels={['Sin fallas', 'Reportados']}
                                        data={[100 - data.defectuosos.data[data.defectuosos.data.length - 1], data.defectuosos.data[data.defectuosos.data.length - 1]]}
                                        color="--color-success"
                                        cutout="75%"
                                    />
                                    <div className="absolute text-center mt-2">
                                        <span className="text-[9px] text-[var(--text-secondary)] font-black uppercase tracking-wider block leading-none mb-1">Sin Reportes</span>
                                        <span className="text-xl font-black text-[var(--color-success)]">{100 - data.defectuosos.data[data.defectuosos.data.length - 1]}%</span>
                                    </div>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] mt-4 font-bold uppercase tracking-widest text-center relative z-10">Calidad de productos entregados</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FinancePageClient;
