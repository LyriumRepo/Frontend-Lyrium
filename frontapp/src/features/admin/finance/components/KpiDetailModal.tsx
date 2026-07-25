'use client';

import React, { useState, useEffect } from 'react';
import BaseModal from '@/components/ui/BaseModal';
import FinanceChart from './FinanceChart';
import Icon from '@/components/ui/Icon';
import type { FinanceData } from '../types';
import type { FinanceChartDataset } from './FinanceChart';

interface KpiConfig {
  label: string;
  value: string;
  description: string;
  icon: string;
  color: string;
  chartType: 'line' | 'bar' | 'doughnut' | 'pie' | 'radar' | 'gauge' | 'stars';
  chartLabels: string[];
  chartData: number[];
  chartColor: string;
  suffix?: string;
  extraInfo: string;
  chartDatasets?: FinanceChartDataset[];
}

interface KpiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: KpiConfig | null;
}

function GaugeVisual({ value, color, max = 60 }: { value: number; color: string; max?: number }) {
  const ratio = Math.min(Math.max(value / max, 0), 1);
  return (
    <div className="relative w-56 h-56 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
        <circle
          cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${ratio * 339.292} 339.292`}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color }}>{value}</span>
        <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-1">minutos promedio</span>
      </div>
    </div>
  );
}

function StarsVisual({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Icon
            key={star}
            name="Star"
            className="w-10 h-10"
            style={{ color, fill: star <= Math.round(value / 20) ? color : undefined }}
          />
        ))}
      </div>
      <span className="text-2xl font-black" style={{ color }}>{value > 0 ? `${value}%` : 'N/A'}</span>
    </div>
  );
}

function ChartExpandedModal({ kpi, onClose }: { kpi: KpiConfig; onClose: () => void }) {
  return (
    <BaseModal
      isOpen
      onClose={onClose}
      title={kpi.label}
      subtitle="Zoom con rueda del mouse · Arrastra para desplazar"
      size="5xl"
      rainbowHeader
    >
      {kpi.chartType === 'gauge' ? (
        <GaugeVisual value={kpi.chartData[kpi.chartData.length - 1] ?? 0} color={kpi.chartColor} />
      ) : kpi.chartType === 'stars' ? (
        <StarsVisual value={kpi.chartData[0] ?? 0} color={kpi.chartColor} />
      ) : (
        <FinanceChart
          type={kpi.chartType}
          labels={kpi.chartLabels}
          data={kpi.chartData}
          color={kpi.chartColor}
          datasets={kpi.chartDatasets}
          height="58vh"
        />
      )}
    </BaseModal>
  );
}

function KpiDetailModal({ isOpen, onClose, kpi }: KpiDetailModalProps) {
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsChartExpanded(false);
  }, [isOpen]);

  if (!kpi) return null;

  const isVisualKpi = kpi.chartType === 'gauge' || kpi.chartType === 'stars';
  const total = kpi.chartData.reduce((a, b) => a + b, 0);
  const maxVal = Math.max(...kpi.chartData, 1);

  return (
    <>
      {isChartExpanded && <ChartExpandedModal kpi={kpi} onClose={() => setIsChartExpanded(false)} />}

      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={kpi.label}
        subtitle={kpi.description}
        size="4xl"
        rainbowHeader
      >
        <div className="space-y-6 modal-stagger max-h-[75vh] overflow-y-auto pr-1">

          {/* Fila superior: valor + descripción */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-1">
                Valor del período
              </p>
              <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter">
                {kpi.value}
                {kpi.suffix && (
                  <span className="text-sm font-black text-[var(--text-secondary)] ml-2">{kpi.suffix}</span>
                )}
              </p>
            </div>
            <div
              className="flex items-start gap-2 p-3 rounded-xl max-w-sm"
              style={{ backgroundColor: `${kpi.color}12`, borderLeft: `3px solid ${kpi.color}` }}
            >
              <Icon name="Info" className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: kpi.color }} />
              <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">{kpi.extraInfo}</p>
            </div>
          </div>

          {/* Gráfico protagonista */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: `${kpi.color}08`, border: `1px solid ${kpi.color}20` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon name="BarChart3" className="w-4 h-4" style={{ color: kpi.color }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: kpi.color }}>
                Evolución
              </span>
              {!isVisualKpi && (
                <span className="text-[10px] text-[var(--text-secondary)] ml-2 hidden sm:block">
                  Zoom con rueda · Arrastra para desplazar
                </span>
              )}
              {!isVisualKpi && (
                <button
                  onClick={() => setIsChartExpanded(true)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: `${kpi.color}20`, color: kpi.color, border: `1px solid ${kpi.color}40` }}
                >
                  <Icon name="Maximize2" className="w-3 h-3" />
                  Ampliar gráfica
                </button>
              )}
            </div>
            {kpi.chartType === 'gauge' ? (
              <GaugeVisual value={kpi.chartData[kpi.chartData.length - 1] ?? 0} color={kpi.chartColor} />
            ) : kpi.chartType === 'stars' ? (
              <StarsVisual value={kpi.chartData[0] ?? 0} color={kpi.chartColor} />
            ) : (
              <FinanceChart
                type={kpi.chartType}
                labels={kpi.chartLabels}
                data={kpi.chartData}
                color={kpi.chartColor}
                datasets={kpi.chartDatasets}
                height="280px"
              />
            )}
          </div>

          {/* Desglose por período */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="List" className="w-4 h-4" style={{ color: kpi.color }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: kpi.color }}>
                Desglose por período
              </span>
              <span
                className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}
              >
                Total: {total.toLocaleString('es-PE')}{kpi.suffix ? ` ${kpi.suffix}` : ''}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {kpi.chartLabels.map((label, i) => {
                const pct = Math.max((kpi.chartData[i] / maxVal) * 100, 2);
                return (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/70 transition-colors"
                  >
                    <span className="text-[11px] font-bold text-[var(--text-secondary)] w-16 shrink-0">{label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${kpi.chartColor}25` }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: kpi.chartColor }}
                      />
                    </div>
                    <span className="text-[11px] font-black text-[var(--text-primary)] min-w-[64px] text-right tabular-nums">
                      {kpi.chartData[i].toLocaleString('es-PE')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </BaseModal>
    </>
  );
}

const KPI_DETAILS: Record<string, string> = {
  'Ingresos Brutos':
    'Representa el total de ventas realizadas antes de descuentos, impuestos y comisiones. Es tu indicador de facturación total antes de cualquier deducción.',
  'Ingresos Netos':
    'Monto que realmente recibes después de descontar la comisión de Lyrium y el IGV. Este es tu ingreso real disponible.',
  'ROI de Ventas':
    'Retorno sobre Inversión. Mide cuánto ganas por cada sol invertido en comisiones de la plataforma. Un ROI alto significa mayor rentabilidad.',
  'Ticket Promedio':
    'Valor medio por pedido. Se calcula dividiendo los ingresos brutos entre el número total de ventas del período. Útil para identificar tendencias de consumo.',
  'Ingresos Netos Reales':
    'Neto efectivamente cobrado y confirmado en tu cuenta. Excluye transacciones pendientes o en proceso de verificación.',
  'Ventas Totales':
    'Número total de transacciones completadas exitosamente en el período seleccionado.',
  'Lead Time de Despacho':
    'Tiempo promedio desde que el cliente realiza el pedido hasta que el producto es despachado. Menor lead time = mayor eficiencia logística.',
  'Tasa de Productos Defectuosos':
    'Porcentaje de productos con reportes de fallas o defectos sobre el total de productos vendidos en el período.',
  'LTV (Lifetime Value)':
    'Valor total que un cliente genera durante toda su relación con tu tienda. Se calcula como Ticket Promedio × Frecuencia de Compra.',
  'Cuota de Mercado Interna':
    'Participación de tus ventas frente al total de ventas en Lyrium. Indica tu posicionamiento frente a otros vendedores.',
  'Rotación de Stock':
    'Indicador de eficiencia en la gestión de inventario. Se calcula como Costo de Ventas / Inventario Promedio. Una rotación alta indica buena gestión.',
  'Tiempo de Respuesta (Chat)':
    'Tiempo promedio que tardas en responder a los mensajes de tus clientes a través del chat de la plataforma.',
  'CSAT - Satisfacción del Cliente':
    'Customer Satisfaction Score. Promedio de las reseñas (1-5 estrellas) que los clientes dejaron en los productos del marketplace, expresado como porcentaje.',
};

export function getKpiDetail(label: string): string {
  return KPI_DETAILS[label] || 'Indicador clave de rendimiento que mide el desempeño de tu tienda en Lyrium.';
}

export default KpiDetailModal;
