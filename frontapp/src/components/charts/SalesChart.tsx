'use client';

import React from 'react';
import { SalesKPIs } from '@/shared/lib/actions/dashboard';
import Icon from '@/components/ui/Icon';

interface SalesChartProps {
  data: SalesKPIs;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * GRÁFICO DE VENTAS SIMPLE (SVG)
 * 
 * Alternativa ligera a recharts/tremor
 * - No requiere dependencias externas
 * - Server Components ready (client component para interactividad)
 * - < 5KB bundle size
 * ═══════════════════════════════════════════════════════════════════════════
 */

export default function SalesChart({ data }: SalesChartProps) {
  // Datos de ejemplo para el gráfico
  const chartData = [
    { day: 'Lun', sales: 1200 },
    { day: 'Mar', sales: 1800 },
    { day: 'Mié', sales: 1400 },
    { day: 'Jue', sales: 2100 },
    { day: 'Vie', sales: 2800 },
    { day: 'Sáb', sales: 3200 },
    { day: 'Dom', sales: 2600 },
  ];

  const maxSales = Math.max(...chartData.map(d => d.sales));
  const chartHeight = 200;
  const chartWidth = 100; // porcentaje

  return (
    <div className="glass-card p-6 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-gray-100 dark:border-[var(--border-subtle)] shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-black text-gray-800 dark:text-[var(--text-primary)] uppercase">Ventas de la Semana</h3>
          <p className="text-xs text-gray-400 dark:text-[var(--text-secondary)] mt-1">Comparado con semana anterior</p>
        </div>
        <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400">
          <Icon name="TrendingUp" className="w-4 h-4" />
          <span className="text-sm font-bold">+18%</span>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative h-56">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={`grid-line-${i}`} className="border-b border-gray-100 dark:border-[var(--border-subtle)] w-full" />
          ))}
        </div>

        {/* Bars */}
        <div className="absolute inset-0 flex items-end justify-between gap-2 px-2 pb-6">
          {chartData.map((item) => {
            const height = (item.sales / maxSales) * chartHeight;
            return (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-gray-900 dark:bg-[var(--border-subtle)] text-white dark:text-[var(--text-primary)] text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-10">
                  S/{item.sales.toLocaleString()}
                </div>
                {/* Bar */}
                <div
                  className="w-full bg-gradient-to-t from-sky-500 to-sky-400 rounded-t-lg transition-all group-hover:from-emerald-500 group-hover:to-emerald-400"
                  style={{ height: `${height}px` }}
                />
                {/* Label */}
                <span className="text-[10px] font-bold text-gray-400 dark:text-[var(--text-secondary)] uppercase">{item.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-[var(--border-subtle)]">
        <div className="text-center">
          <p className="text-xs text-gray-400 dark:text-[var(--text-secondary)] font-bold uppercase">Promedio</p>
          <p className="text-lg font-black text-gray-800 dark:text-[var(--text-primary)]">S/2,157</p>
        </div>
        <div className="text-center border-l border-gray-100 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-400 dark:text-[var(--text-secondary)] font-bold uppercase">Más Alto</p>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">S/3,200</p>
        </div>
        <div className="text-center border-l border-gray-100 dark:border-[var(--border-subtle)]">
          <p className="text-xs text-gray-400 dark:text-[var(--text-secondary)] font-bold uppercase">Total</p>
          <p className="text-lg font-black text-gray-800 dark:text-[var(--text-primary)]">S/15,100</p>
        </div>
      </div>
    </div>
  );
}
