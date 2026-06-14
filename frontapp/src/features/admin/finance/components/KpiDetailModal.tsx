'use client';

import React from 'react';
import BaseModal from '@/components/ui/BaseModal';
import FinanceChart from './FinanceChart';
import Icon from '@/components/ui/Icon';
import type { FinanceData } from '../types';

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

function KpiDetailModal({ isOpen, onClose, kpi }: KpiDetailModalProps) {
  if (!kpi) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={kpi.label}
      subtitle={kpi.description}
      size="2xl"
      accentColor={`from-[${kpi.color}] to-[${kpi.color}]/80`}
    >
      <div className="space-y-8 modal-stagger">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                Valor Actual
              </p>
              <p className="text-4xl font-black text-[var(--text-primary)] tracking-tighter mt-1">
                {kpi.value}
                {kpi.suffix && (
                  <span className="text-sm font-black text-[var(--text-secondary)] ml-2">
                    {kpi.suffix}
                  </span>
                )}
              </p>
            </div>
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: `${kpi.color}15`, borderLeft: `4px solid ${kpi.color}` }}
            >
              <div className="flex items-center gap-2 mb-2" style={{ color: kpi.color }}>
                <Icon name="Info" className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">Sobre este indicador</span>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                {kpi.extraInfo}
              </p>
            </div>
          </div>
          <div className="h-[220px]">
            <FinanceChart
              type={kpi.chartType}
              labels={kpi.chartLabels}
              data={kpi.chartData}
              color={kpi.chartColor}
              height="220px"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Icon name="BarChart3" className="w-4 h-4" style={{ color: kpi.color }} />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: kpi.color }}>
              Desglose por Período
            </span>
          </div>
          <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {kpi.chartLabels.map((label, i) => (
              <div
                key={label}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 transition-colors"
              >
                <span className="text-xs font-bold text-[var(--text-primary)]">{label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${kpi.chartColor}30` }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((kpi.chartData[i] / Math.max(...kpi.chartData)) * 100, 2)}%`,
                        backgroundColor: kpi.chartColor,
                      }}
                    />
                  </div>
                  <span className="text-xs font-black text-[var(--text-primary)] min-w-[60px] text-right tabular-nums">
                    {kpi.chartData[i].toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 rounded-2xl border border-[var(--border-subtle)]">
          <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-widest">
            Total del Período
          </span>
          <span className="text-lg font-black text-[var(--text-primary)]">
            {kpi.chartData.reduce((a, b) => a + b, 0).toLocaleString()}
            {kpi.suffix ? ` ${kpi.suffix}` : ''}
          </span>
        </div>
      </div>
    </BaseModal>
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
