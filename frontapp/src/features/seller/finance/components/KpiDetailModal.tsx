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
  chartType: 'line' | 'bar' | 'doughnut' | 'radar';
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
      <FinanceChart
        type={kpi.chartType}
        labels={kpi.chartLabels}
        data={kpi.chartData}
        color={kpi.chartColor}
        datasets={kpi.chartDatasets}
        height="58vh"
      />
    </BaseModal>
  );
}

function KpiDetailModal({ isOpen, onClose, kpi }: KpiDetailModalProps) {
  const [isChartExpanded, setIsChartExpanded] = useState(false);

  useEffect(() => {
    if (!isOpen) setIsChartExpanded(false);
  }, [isOpen]);

  if (!kpi) return null;

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
        <div className="space-y-6 modal-stagger">

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
              <span className="text-[10px] text-[var(--text-secondary)] ml-2 hidden sm:block">
                Zoom con rueda · Arrastra para desplazar
              </span>
              <button
                onClick={() => setIsChartExpanded(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                style={{ backgroundColor: `${kpi.color}20`, color: kpi.color, border: `1px solid ${kpi.color}40` }}
              >
                <Icon name="Maximize2" className="w-3 h-3" />
                Ampliar gráfica
              </button>
            </div>
            <FinanceChart
              type={kpi.chartType}
              labels={kpi.chartLabels}
              data={kpi.chartData}
              color={kpi.chartColor}
              datasets={kpi.chartDatasets}
              height="380px"
            />
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
    'Customer Satisfaction Score. Porcentaje de clientes que calificaron positivamente su experiencia de compra en tu tienda.',
};

export function getKpiDetail(label: string): string {
  return KPI_DETAILS[label] || 'Indicador clave de rendimiento que mide el desempeño de tu tienda en Lyrium.';
}

export default KpiDetailModal;
