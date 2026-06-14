'use client';

import React from 'react';
import BaseModal from '@/components/ui/BaseModal';
import FinanceChart from './FinanceChart';
import Icon from '@/components/ui/Icon';

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
}

interface KpiDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  kpi: KpiConfig | null;
}

const KPI_DETAILS: Record<string, string> = {
  'Ventas Totales': 'Número total de transacciones completadas exitosamente en toda la plataforma durante el período seleccionado.',
  'Ticket Promedio': 'Valor medio por pedido en toda la plataforma. Se calcula dividiendo los ingresos brutos entre el número total de ventas.',
  'Lead Time Despacho': 'Tiempo promedio desde que el cliente realiza el pedido hasta que el producto es despachado por el vendedor.',
  'Ingresos Reales': 'Ingresos netos considerando comisiones y costos de envío de toda la plataforma.',
  'CSAT General': 'Customer Satisfaction Score general de la plataforma. Porcentaje de clientes que calificaron positivamente su experiencia.',
  'Valor de Vida del Cliente (LTV)': 'Valor promedio que un cliente genera durante toda su relación con Lyrium.',
  'Cuota de Mercado': 'Distribución de ventas entre las tiendas de la plataforma. Indica el peso relativo de cada vendedor.',
  'Tiempo de Respuesta': 'Tiempo promedio que tarda el equipo de soporte en responder los tickets de los vendedores.',
  'Tasa de Resolución': 'Porcentaje de incidencias resueltas exitosamente sobre el total de tickets recibidos.',
  'ROI': 'Retorno sobre inversión general de la plataforma. Mide la rentabilidad frente a los costos operativos.',
  'Rotación de Stock': 'Indicador de eficiencia en la gestión de inventario global. Una rotación alta indica buena gestión.',
  'Ventas por Categoría': 'Distribución de ventas totales por categoría de producto en toda la plataforma.',
  'CSAT': 'Customer Satisfaction Score que mide el nivel de satisfacción general de los clientes con la plataforma.',
  'Ingresos Brutos': 'Total de ventas realizadas en toda la plataforma antes de descuentos, impuestos y comisiones.',
  'Ingresos Netos': 'Monto agregado después de descontar las comisiones promedio de las tiendas en la plataforma.',
};

function getKpiDetail(label: string): string {
  return KPI_DETAILS[label] || 'Indicador clave de rendimiento de la plataforma Lyrium.';
}

function KpiDetailModal({ isOpen, onClose, kpi }: KpiDetailModalProps) {
  if (!kpi) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={kpi.label}
      subtitle={kpi.description}
      size="3xl"
      accentColor={`from-[${kpi.color}] to-[${kpi.color}]/80`}
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0 modal-stagger">
        <div className="md:col-span-2 space-y-4 pr-0 md:pr-6 md:border-r border-[var(--border-subtle)]">
          <div>
            <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              Valor Actual
            </p>
            <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter mt-1">
              {kpi.value}
              {kpi.suffix && (
                <span className="text-sm font-black text-[var(--text-secondary)] ml-2">
                  {kpi.suffix}
                </span>
              )}
            </p>
          </div>

          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${kpi.color}15`, borderLeft: `4px solid ${kpi.color}` }}
          >
            <div className="flex items-center gap-2 mb-1.5" style={{ color: kpi.color }}>
              <Icon name="Info" className="w-3.5 h-3.5" />
              <span className="text-[8px] font-black uppercase tracking-widest">Sobre este indicador</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
              {kpi.extraInfo}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="BarChart3" className="w-3.5 h-3.5" style={{ color: kpi.color }} />
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: kpi.color }}>
                Desglose por Período
              </span>
            </div>
            <div className="max-h-[240px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {kpi.chartLabels.map((label, i) => {
                const maxVal = Math.max(...kpi.chartData);
                const pct = maxVal > 0 ? ((kpi.chartData[i] / maxVal) * 100).toFixed(1) : '0';
                return (
                  <div
                    key={label}
                    className="group relative flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors"
                  >
                    <span className="text-xs font-bold text-[var(--text-primary)]">{label}</span>
                    <div className="flex items-center gap-2">
                      <div className="relative w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${kpi.chartColor}30` }}>
                        <div
                          className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                          style={{
                            width: `${Math.max(parseFloat(pct), 2)}%`,
                            backgroundColor: kpi.chartColor,
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)] min-w-[50px] text-right tabular-nums">
                        {kpi.chartData[i].toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-subtle)]">
            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
              Total del Período
            </span>
            <span className="text-base font-black text-[var(--text-primary)]">
              {kpi.chartData.reduce((a, b) => a + b, 0).toLocaleString()}
              {kpi.suffix ? ` ${kpi.suffix}` : ''}
            </span>
          </div>
        </div>

        <div className="md:col-span-3 flex items-start justify-center pl-0 md:pl-6">
          <div className="w-full h-[360px]">
            <FinanceChart
              type={kpi.chartType}
              labels={kpi.chartLabels}
              data={kpi.chartData}
              color={kpi.chartColor}
              height="360px"
            />
          </div>
        </div>
      </div>
    </BaseModal>
  );
}

export { getKpiDetail, KpiDetailModal };
export default KpiDetailModal;
export type { KpiConfig };
