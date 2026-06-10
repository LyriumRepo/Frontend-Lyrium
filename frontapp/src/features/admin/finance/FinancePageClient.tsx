'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import FinanceChart from './components/FinanceChart';
import CardProxPago from './components/CardProxPago';
import { useToast } from '@/shared/lib/context/ToastContext';
import BaseLoading from '@/components/ui/BaseLoading';
import BaseStatCard from '@/components/ui/BaseStatCard';

import Icon from '@/components/ui/Icon';
import { useFinanceAnalytics } from './hooks/useFinanceAnalytics';
import { formatCurrency } from '@/shared/lib/utils/formatters';


interface FinancePageClientProps {}

export function FinancePageClient(_props: FinancePageClientProps) {
  const {
    data,
    isLoading,
    activeTab,
    setActiveTab,
    filters,
    setFilters,
    applyFilters: hookApplyFilters,
    isVisible,
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
    { id: 'satisfaccion', label: 'Satisfacción', icon: 'Smile' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <ModuleHeader
        title="Centro de Finanzas y Estadísticas"
        subtitle="Monitoreo global de KPI financieros, analítica y rendimiento de mercado"
        icon="PieChart"
        actions={headerActions}
      />

      <div className="flex flex-wrap gap-2 border-b border-gray-100 dark:border-emerald-950 pb-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-100'
                : 'text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)]'
            }`}
          >
            <Icon name={tab.icon as any} className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {/* ══════════════════ 1. MONETARIO ══════════════════ */}
        {isVisible('monetario') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Análisis Monetario
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl relative overflow-hidden group transition-all duration-500 hover:shadow-2xl">
                  <div className="absolute top-0 left-0 w-72 h-72 bg-sky-500/5 dark:bg-sky-500/2 rounded-full -ml-36 -mt-36 blur-3xl transition-all duration-700 group-hover:scale-125" />
                  <div className="absolute bottom-0 right-0 w-72 h-72 bg-emerald-500/5 dark:bg-emerald-500/2 rounded-full -mr-36 -mb-36 blur-3xl transition-all duration-700 group-hover:scale-125" />
                  <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 border-b border-[var(--border-subtle)] pb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">
                          Rendimiento Consolidado
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight">
                        Centro de Control de Ingresos
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      <div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">
                          Ingresos Brutos
                        </span>
                        <span className="text-2xl font-black text-sky-500">
                          {formatCurrency(data.ingresosBrutos.data.reduce((a, b) => a + b, 0))}
                        </span>
                      </div>
                      <div className="w-[1px] h-10 bg-[var(--border-subtle)] hidden sm:block" />
                      <div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">
                          Ingresos Netos
                        </span>
                        <span className="text-2xl font-black text-emerald-500">
                          {formatCurrency(data.ingresosNetos.data.reduce((a, b) => a + b, 0))}
                        </span>
                      </div>
                      <div className="w-[1px] h-10 bg-[var(--border-subtle)] hidden sm:block" />
                      <div>
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">
                          Ingresos Reales
                        </span>
                        <span className="text-2xl font-black text-amber-500">
                          {formatCurrency(data.ingresosReales.data.reduce((a, b) => a + b, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative z-10 h-[280px]">
                    <FinanceChart
                      type="line"
                      labels={data.ingresosBrutos.labels}
                      datasets={[
                        { label: 'Brutos', data: data.ingresosBrutos.data, color: '#0EA5E9' },
                        { label: 'Netos', data: data.ingresosNetos.data, color: '#10B981' },
                        { label: 'Reales', data: data.ingresosReales.data, color: '#F59E0B' },
                      ]}
                      height="280px"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <BaseStatCard
                    label="Ventas Totales"
                    value={data.ventasTotales.data.reduce((a, b) => a + b, 0).toString()}
                    description="Número de transacciones"
                    icon="ShoppingCart"
                    color="emerald"
                    suffix="Ord."
                    chart={
                      <FinanceChart
                        type="bar"
                        labels={data.ventasTotales.labels}
                        data={data.ventasTotales.data}
                        color="#10B981"
                      />
                    }
                  />
                  <BaseStatCard
                    label="Ticket Promedio"
                    value={formatCurrency(
                      data.ingresosBrutos.data.reduce((a, b) => a + b, 0) /
                        Math.max(data.ventasTotales.data.reduce((a, b) => a + b, 0), 1),
                    )}
                    description="Valor medio por pedido"
                    icon="Tag"
                    color="sky"
                    chart={
                      <FinanceChart
                        type="line"
                        labels={data.ticketPromedio.labels}
                        data={data.ticketPromedio.data}
                        color="#0EA5E9"
                        fill
                      />
                    }
                  />
                </div>
              </div>
              <div className="space-y-8">
                <CardProxPago
                  data={data.chartProxPago}
                  formatCurrency={formatCurrency}
                />
                <div className="bg-[var(--bg-card)] p-6 rounded-[2.5rem] border border-[var(--border-subtle)] text-center">
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider block">
                    Próximo Pago Neto
                  </span>
                  <span className="text-3xl font-black text-sky-500">
                    {formatCurrency(data.proximoPago)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ 2. LOGÍSTICA ══════════════════ */}
        {isVisible('logistica') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Rendimiento Logístico
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseStatCard
                label="Lead Time Despacho"
                value={`${data.leadTime.data[data.leadTime.data.length - 1] || 0}h`}
                description="Tiempo promedio de pedido a despacho"
                icon="Timer"
                color="sky"
                chart={
                  <FinanceChart
                    type="bar"
                    labels={data.leadTime.labels}
                    data={data.leadTime.data}
                    color="#0EA5E9"
                  />
                }
              />
              <BaseStatCard
                label="Ingresos Reales"
                value={formatCurrency(data.ingresosReales.data.reduce((a, b) => a + b, 0))}
                description="Ingresos después de comisiones y costos"
                icon="TrendingUp"
                color="amber"
                chart={
                  <FinanceChart
                    type="line"
                    labels={data.ingresosReales.labels}
                    data={data.ingresosReales.data}
                    color="#F59E0B"
                    fill
                  />
                }
              />
            </div>
          </div>
        )}

        {/* ══════════════════ 3. CALIDAD ══════════════════ */}
        {isVisible('calidad') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-emerald-400 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Control de Calidad
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--bg-card)] p-8 border border-[var(--border-subtle)] rounded-[2.5rem] flex flex-col items-center shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl transition-all" />
                <div className="flex items-center justify-between w-full mb-6 relative z-10">
                  <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider">
                    Tasa de Defectuosos
                  </span>
                  <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 border border-emerald-500/20">
                    <Icon name="AlertOctagon" className="text-xl w-5 h-5" />
                  </div>
                </div>
                <div className="relative w-full h-[200px] flex items-center justify-center">
                  <FinanceChart
                    type="doughnut"
                    labels={data.defectuosos.labels}
                    data={data.defectuosos.data}
                    color="#10B981"
                    cutout="75%"
                  />
                  <div className="absolute text-center mt-4">
                    <span className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider block leading-none mb-1">
                      Tasa Promedio
                    </span>
                    <span className="text-xl font-black text-emerald-500 dark:text-emerald-400">
                      {data.defectuosos.data[data.defectuosos.data.length - 1]}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-4 font-bold uppercase tracking-widest text-center relative z-10">
                  Productos con reportes de fallas
                </p>
              </div>
              <BaseStatCard
                label="CSAT General"
                value={`${data.csat.promedio.toFixed(1)} / 5`}
                description={`${data.csat.total} calificaciones`}
                icon="Star"
                color="emerald"
                chart={
                  <FinanceChart
                    type="doughnut"
                    labels={['Satisfacción', 'Restante']}
                    data={[data.csat.promedio, Math.max(5 - data.csat.promedio, 0)]}
                    color="#10B981"
                    cutout="75%"
                  />
                }
              />
            </div>
          </div>
        )}

        {/* ══════════════════ 4. FIDELIZACIÓN ══════════════════ */}
        {isVisible('fidelizacion') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Fidelización de Clientes
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseStatCard
                label="Valor de Vida del Cliente (LTV)"
                value={`S/ ${data.ltv.data[data.ltv.data.length - 1] || 0}`}
                description="Revenue per customer lifetime"
                icon="Coins"
                color="sky"
                chart={
                  <FinanceChart
                    type="line"
                    labels={data.ltv.labels}
                    data={data.ltv.data}
                    color="#0EA5E9"
                    fill
                  />
                }
              />
              <BaseStatCard
                label="Cuota de Mercado"
                value={`${data.cuotaMercado.data[0] || 0}%`}
                description="Participación en el mercado"
                icon="PieChart"
                color="emerald"
                chart={
                  <FinanceChart
                    type="doughnut"
                    labels={data.cuotaMercado.labels}
                    data={data.cuotaMercado.data}
                    color="#10B981"
                    cutout="0%"
                  />
                }
              />
            </div>
          </div>
        )}

        {/* ══════════════════ 5. SERVICIO ══════════════════ */}
        {isVisible('servicio') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-emerald-400 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Servicio al Cliente
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseStatCard
                label="Tiempo de Respuesta"
                value={`${data.tiempoRespuesta.data[data.tiempoRespuesta.data.length - 1] || 0} min`}
                description="Promedio de respuesta a tickets"
                icon="Clock"
                color="emerald"
                chart={
                  <FinanceChart
                    type="bar"
                    labels={data.tiempoRespuesta.labels}
                    data={data.tiempoRespuesta.data}
                    color="#10B981"
                  />
                }
              />
              <BaseStatCard
                label="Tasa de Resolución"
                value={`${data.defectuosos.data[data.defectuosos.data.length - 1] || 0}%`}
                description="Efectividad en resolución de problemas"
                icon="CheckCircle"
                color="sky"
                chart={
                  <FinanceChart
                    type="line"
                    labels={data.defectuosos.labels}
                    data={data.defectuosos.data}
                    color="#0EA5E9"
                    fill
                  />
                }
              />
            </div>
          </div>
        )}

        {/* ══════════════════ 6. CRECIMIENTO ══════════════════ */}
        {isVisible('crecimiento') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Estrategia de Crecimiento
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseStatCard
                label="ROI"
                value={`${(data.roi.data[data.roi.data.length - 1] || 0).toFixed(1)}%`}
                description="Retorno sobre inversión"
                icon="TrendingUp"
                color="rose"
                chart={
                  <FinanceChart
                    type="line"
                    labels={data.roi.labels}
                    data={data.roi.data}
                    color="#F43F5E"
                    fill
                  />
                }
              />
              <BaseStatCard
                label="Cuota de Mercado"
                value={`${data.cuotaMercado.data[0] || 0}%`}
                description="Participación en el mercado"
                icon="BarChart"
                color="sky"
                chart={
                  <FinanceChart
                    type="doughnut"
                    labels={data.cuotaMercado.labels}
                    data={data.cuotaMercado.data}
                    color="#0EA5E9"
                    cutout="0%"
                  />
                }
              />
            </div>
            {/* Top Buyers */}
            <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)]">
              <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-6">
                Top Compradores
              </h3>
              <div className="space-y-4">
                {data.topBuyers.map((buyer, i) => (
                  <div
                    key={buyer.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)]/50"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white ${
                        i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-sky-500/30'
                      }`}>
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{buyer.name}</p>
                        <p className="text-[10px] text-[var(--text-muted)]">{buyer.purchases} compras</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-emerald-500">{formatCurrency(buyer.clv)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════ 7. INVENTARIO ══════════════════ */}
        {isVisible('inventario') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Control de Inventario
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseStatCard
                label="Rotación de Stock"
                value={`${(data.stockRotacion.data[data.stockRotacion.data.length - 1] || 0).toFixed(1)}`}
                description="Veces que se renueva el inventario"
                icon="RefreshCw"
                color="sky"
                chart={
                  <FinanceChart
                    type="bar"
                    labels={data.stockRotacion.labels}
                    data={data.stockRotacion.data}
                    color="#0EA5E9"
                  />
                }
              />
              <BaseStatCard
                label="Ventas por Categoría"
                value={`${data.categories.labels.length} categorías`}
                description="Distribución de ventas"
                icon="PieChart"
                color="emerald"
                chart={
                  <FinanceChart
                    type="doughnut"
                    labels={data.categories.labels}
                    data={data.categories.data}
                    color="#10B981"
                    cutout="0%"
                  />
                }
              />
            </div>
          </div>
        )}

        {/* ══════════════════ 8. SATISFACCIÓN ══════════════════ */}
        {isVisible('satisfaccion') && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
              <h2 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tight">
                Experiencia del Cliente
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BaseStatCard
                label="CSAT"
                value={`${data.csat.promedio.toFixed(1)} / 5`}
                description={`${data.csat.total} calificaciones recibidas`}
                icon="Star"
                color="sky"
                chart={
                  <FinanceChart
                    type="line"
                    labels={['CSAT']}
                    data={[data.csat.promedio]}
                    color="#0EA5E9"
                    fill
                  />
                }
              />
              <div className="bg-[var(--bg-card)] p-8 border border-[var(--border-subtle)] rounded-[2.5rem]">
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider mb-6">
                  Mapa de Calor - Actividad de Órdenes
                </h3>
                <div className="grid grid-cols-7 gap-1.5">
                  {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                    <div key={day} className="text-[9px] font-bold text-[var(--text-muted)] text-center uppercase">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 7 * 6 }, (_, i) => {
                    const entry = data.heatmap[i];
                    const intensity = entry ? Math.min(entry.value / 150, 1) : 0;
                    return (
                      <div
                        key={i}
                        className="aspect-square rounded-md transition-colors"
                        style={{
                          backgroundColor: `rgba(14, 165, 233, ${intensity})`,
                        }}
                        title={entry ? `Día: ${entry.day}, Hora: ${entry.hour}:00, Órdenes: ${entry.value}` : ''}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FinancePageClient;
