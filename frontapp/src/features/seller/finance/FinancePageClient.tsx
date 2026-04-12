'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import FinanceChart from './components/FinanceChart';
import CardProxPago from './components/CardProxPago';
import { useToast } from '@/shared/lib/context/ToastContext';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseStatCard from '@/components/ui/BaseStatCard';
import Icon from '@/components/ui/Icon';
import { useSellerFinance } from '@/features/seller/finance/hooks/useSellerFinance';
import { formatCurrency } from '@/shared/lib/utils/formatters';

interface FinancePageClientProps {
    // TODO Tarea 3: Recibir datos iniciales del Server Component
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
    } = useSellerFinance();

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
        <div className="flex gap-2 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20">
            <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(e.target.value, filters.endDate)}
                className="text-xs bg-transparent border-none focus:ring-0 text-white placeholder-white/50 cursor-pointer"
            />
            <span className="text-white/30">|</span>
            <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(filters.startDate, e.target.value)}
                className="text-xs bg-transparent border-none focus:ring-0 text-white placeholder-white/50 cursor-pointer"
            />
            <button
                onClick={handleApplyFilters}
                className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition active:scale-95"
            >
                <Icon name="Search" className="w-4 h-4" />
            </button>
        </div>
    );

    if (isLoading && !data) {
        return <BaseLoading message="Sincronizando Finanzas..." />;
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
                subtitle="Monitoreo en tiempo real de tus KPIs estratégicos"
                icon="PieChart"
                actions={headerActions}
            />

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4 overflow-x-auto no-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-sky-500 text-white shadow-lg shadow-sky-100'
                            : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
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
                            <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Análisis Monetario</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <BaseStatCard
                                label="Ingresos Brutos"
                                value={formatCurrency(data.ingresosBrutos.data.reduce((a, b) => a + b, 0))}
                                description="Total de ventas acumuladas"
                                icon="Banknote"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.ingresosBrutos.labels} data={data.ingresosBrutos.data} color="#0EA5E9" />}
                            />
                            <BaseStatCard
                                label="Ingresos Netos"
                                value={formatCurrency(data.ingresosNetos.data.reduce((a, b) => a + b, 0))}
                                description="Monto neto después de comisiones"
                                icon="LineChart"
                                color="emerald"
                                chart={<FinanceChart type="line" labels={data.ingresosNetos.labels} data={data.ingresosNetos.data} color="#10B981" />}
                            />
                            <CardProxPago data={data.chartProxPago} formatCurrency={formatCurrency} />

                            <BaseStatCard
                                label="ROI de Ventas"
                                value={data.ingresosBrutos.trend || '0%'}
                                description="Retorno sobre la inversión"
                                icon="TrendingUp"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.roi.labels} data={data.roi.data} color="#0EA5E9" />}
                            />
                            <BaseStatCard
                                label="Ventas Totales"
                                value={data.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                                description="Número de transacciones"
                                icon="ShoppingCart"
                                color="emerald"
                                suffix="Ord."
                                chart={<FinanceChart type="bar" labels={data.ventasTotales.labels} data={data.ventasTotales.data} color="#10B981" />}
                            />
                            <BaseStatCard
                                label="Ticket Promedio"
                                value={formatCurrency(data.ingresosBrutos.data.reduce((a, b) => a + b, 0) / data.ventasTotales.data.reduce((a, b) => a + b, 0))}
                                description="Valor medio por pedido"
                                icon="Tag"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.ticketPromedio.labels} data={data.ticketPromedio.data} color="#0EA5E9" />}
                            />
                        </div>
                    </div>
                )}

                {/* 2. LOGÍSTICA */}
                {isVisible('logistica') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Rendimiento Logístico</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <BaseStatCard
                                label="Lead Time Despacho"
                                value={`${data.leadTime.data[data.leadTime.data.length - 1]}h`}
                                description="Tiempo promedio desde pedido a despacho"
                                icon="Timer"
                                color="sky"
                                chart={<FinanceChart type="bar" labels={data.leadTime.labels} data={data.leadTime.data} color="#0EA5E9" />}
                            />
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
                            <div className="glass-card p-8 border-l-4 border-emerald-400 bg-[var(--bg-card)] flex flex-col items-center rounded-[2.5rem]">
                                <div className="flex items-center justify-between w-full mb-6">
                                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Tasa de Defectuosos</span>
                                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400"><Icon name="AlertOctagon" className="text-xl w-5 h-5" /></div>
                                </div>
                                <div className="w-full h-[200px]">
                                    <FinanceChart type="bar" labels={data.defectuosos.labels} data={data.defectuosos.data} color="#10B981" />
                                </div>
                                <p className="text-2xl font-black text-emerald-400 mt-6">{data.defectuosos.data[data.defectuosos.data.length - 1]}%</p>
                                <p className="text-xs text-[var(--text-secondary)] mt-2 font-bold uppercase tracking-widest">Productos con reportes de fallas</p>
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
                            <BaseStatCard
                                label="Valor de Vida del Cliente"
                                value={`S/ ${data.ltv.data[data.ltv.data.length - 1]}`}
                                description="Revenue per customer lifetime"
                                icon="Coins"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.ltv.labels} data={data.ltv.data} color="#0EA5E9" />}
                            />
                            <BaseStatCard
                                label="Cuota de Mercado"
                                value={`${data.cuotaMercado.data[data.cuotaMercado.data.length - 1]}%`}
                                description="Porcentaje del mercado objetivo"
                                icon="PieChart"
                                color="emerald"
                                chart={<FinanceChart type="bar" labels={data.cuotaMercado.labels} data={data.cuotaMercado.data} color="#10B981" />}
                            />
                        </div>
                    </div>
                )}

                {/* 5. SERVICIO */}
                {isVisible('servicio') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-emerald-400 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Servicio al Cliente</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BaseStatCard
                                label="Tiempo de Respuesta"
                                value={`${data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1]} min`}
                                description="Promedio de respuesta a tickets"
                                icon="Clock"
                                color="emerald"
                                chart={<FinanceChart type="bar" labels={data.tiempoRespuesta.labels} data={data.tiempoRespuesta.data} color="#10B981" />}
                            />
                            <BaseStatCard
                                label="Tasa de Resolución"
                                value={`${data.defectuosos.data[data.defectuosos.data.length - 1]}%`}
                                description="Problemas resueltos en primera respuesta"
                                icon="CheckCircle"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.defectuosos.labels} data={data.defectuosos.data} color="#0EA5E9" />}
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
                            <BaseStatCard
                                label="ROI"
                                value={`${data.roi.data[data.roi.data.length - 1]}%`}
                                description="Retorno sobre inversión"
                                icon="TrendingUp"
                                color="rose"
                                chart={<FinanceChart type="line" labels={data.roi.labels} data={data.roi.data} color="#F43F5E" />}
                            />
                            <BaseStatCard
                                label="Cuota de Mercado"
                                value={`${data.cuotaMercado.data[data.cuotaMercado.data.length - 1]}%`}
                                description="Participación en el mercado"
                                icon="BarChart"
                                color="sky"
                                chart={<FinanceChart type="bar" labels={data.cuotaMercado.labels} data={data.cuotaMercado.data} color="#0EA5E9" />}
                            />
                        </div>
                    </div>
                )}

                {/* 7. INVENTARIO */}
                {isVisible('inventario') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Control de Inventario</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BaseStatCard
                                label="Rotación de Stock"
                                value={`${data.stockRotacion.data[data.stockRotacion.data.length - 1]}`}
                                description="Veces que se renueva el inventario"
                                icon="RefreshCw"
                                color="sky"
                                chart={<FinanceChart type="bar" labels={data.stockRotacion.labels} data={data.stockRotacion.data} color="#0EA5E9" />}
                            />
                            <BaseStatCard
                                label="Ventas Totales"
                                value={data.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                                description="Unidades vendidas en el período"
                                icon="Package"
                                color="emerald"
                                chart={<FinanceChart type="bar" labels={data.ventasTotales.labels} data={data.ventasTotales.data} color="#10B981" />}
                            />
                        </div>
                    </div>
                )}

                {/* 8. SATISFACCIÓN */}
                {isVisible('satisfaccion') && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
                            <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">Experiencia del Cliente</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <BaseStatCard
                                label="Tiempo de Respuesta"
                                value={`${data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1]} min`}
                                description="Satisfacción medida en tiempo"
                                icon="Smile"
                                color="sky"
                                chart={<FinanceChart type="line" labels={data.tiempoRespuesta.labels} data={data.tiempoRespuesta.data} color="#0EA5E9" />}
                            />
                            <BaseStatCard
                                label="Calidad (Defectuosos)"
                                value={`${100 - data.defectuosos.data[data.defectuosos.data.length - 1]}%`}
                                description="Productos sin fallas reportadas"
                                icon="Award"
                                color="emerald"
                                chart={<FinanceChart type="bar" labels={data.defectuosos.labels} data={data.defectuosos.data.map(d => 100 - d)} color="#10B981" />}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
