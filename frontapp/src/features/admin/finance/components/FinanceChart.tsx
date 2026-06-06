'use client';

import React, { useEffect, useRef, useState } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto';

interface FinanceChartProps {
  type: 'line' | 'bar' | 'doughnut' | 'radar';
  labels: string[];
  data?: number[];
  datasets?: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
  label?: string;
  color?: string;
  fill?: boolean;
  tension?: number;
  cutout?: string;
  height?: string;
}

export default function FinanceChart({
  type,
  labels,
  data,
  datasets,
  label = '',
  color = '#0EA5E9',
  fill = true,
  tension = 0.4,
  cutout = '75%',
  height = '200px',
}: FinanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';
  const tickColor = isDark ? '#cbd5e1' : '#171717';
  const pointBorder = isDark ? '#0b0f0c' : '#ffffff';

  const colorsPalette = [
    '#06B6D4',
    '#10B981',
    '#F59E0B',
    '#EC4899',
    '#8B5CF6',
    '#3B82F6',
  ];

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    let finalDatasets: any[] = [];

    if (datasets && datasets.length > 0) {
      finalDatasets = datasets.map((d, idx) => {
        const itemColor = d.color;
        let bgStyle: any = `${itemColor}15`;

        if (type === 'bar') {
          const barGrad = ctx.createLinearGradient(0, 0, 0, 200);
          barGrad.addColorStop(0, itemColor);
          barGrad.addColorStop(1, `${itemColor}05`);
          bgStyle = barGrad;
        } else if (type === 'line' && fill) {
          const lineGrad = ctx.createLinearGradient(0, 0, 0, 200);
          lineGrad.addColorStop(0, `${itemColor}25`);
          lineGrad.addColorStop(1, 'transparent');
          bgStyle = lineGrad;
        }

        return {
          label: d.label,
          data: d.data,
          borderColor: itemColor,
          backgroundColor: bgStyle,
          borderWidth: 2.5,
          tension: type === 'line' ? tension : 0,
          fill: type === 'line' ? fill : false,
          pointBackgroundColor: itemColor,
          pointBorderColor: pointBorder,
          pointRadius: type === 'line' ? 3.5 : 0,
          pointHoverRadius: type === 'line' ? 5.5 : 0,
          borderRadius: type === 'bar' ? 5 : 0,
        };
      });
    } else {
      const singleData = data || [];
      let backgroundStyle: any =
        type === 'doughnut'
          ? singleData.length > 2
            ? colorsPalette.slice(0, singleData.length)
            : [color, isDark ? '#1b231d' : '#f1f5f9']
          : fill
            ? `${color}1A`
            : 'transparent';

      if (type === 'bar') {
        const barGrad = ctx.createLinearGradient(0, 0, 0, 200);
        barGrad.addColorStop(0, color);
        barGrad.addColorStop(1, `${color}10`);
        backgroundStyle = barGrad;
      } else if (type === 'line' && fill) {
        const lineGrad = ctx.createLinearGradient(0, 0, 0, 200);
        lineGrad.addColorStop(0, `${color}35`);
        lineGrad.addColorStop(1, 'transparent');
        backgroundStyle = lineGrad;
      }

      finalDatasets = [
        {
          label,
          data: singleData,
          borderColor: color,
          backgroundColor: backgroundStyle,
          borderWidth: type === 'doughnut' ? 0 : 2.5,
          tension: type === 'line' ? tension : 0,
          fill: type === 'line' ? fill : false,
          pointBackgroundColor: color,
          pointBorderColor: pointBorder,
          pointRadius: type === 'line' ? 4 : 0,
          pointHoverRadius: type === 'line' ? 6 : 0,
          borderRadius: type === 'bar' ? 6 : 0,
        },
      ];
    }

    const config: ChartConfiguration = {
      type,
      data: {
        labels,
        datasets: finalDatasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: type === 'doughnut' ? cutout : undefined,
        plugins: {
          legend: {
            display: type === 'doughnut' || (datasets && datasets.length > 0),
            position: 'bottom',
            labels: {
              color: tickColor,
              font: { size: 9, weight: 'bold' },
              boxWidth: 8,
              padding: 12,
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: isDark ? '#0d120e' : '#ffffff',
            titleColor: isDark ? '#ffffff' : '#0f172a',
            bodyColor: isDark ? '#9db3a1' : '#475569',
            borderColor: isDark ? '#1e291e' : '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            bodyFont: { weight: 'bold', size: 11 },
            titleFont: { weight: 'black', size: 12 },
          },
        },
        scales:
          type === 'radar'
            ? {
                r: {
                  grid: {
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                  angleLines: {
                    color: isDark
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.06)',
                  },
                  pointLabels: {
                    color: isDark ? '#f1f5f9' : '#1e293b', // Bright labels in dark mode
                    font: {
                      size: 10,
                      weight: 'black',
                      family: "'Inter', sans-serif",
                    },
                  },
                  ticks: {
                    showLabelBackdrop: false,
                    backdropColor: 'transparent', // Transparent backdrop
                    color: isDark ? '#cbd5e1' : '#475569',
                    font: {
                      size: 9,
                      weight: 'bold',
                    },
                  },
                },
              }
            : type !== 'doughnut'
              ? {
                  y: {
                    beginAtZero: true,
                    grid: { color: gridColor },
                    ticks: {
                      font: { size: 9, weight: 'bold' },
                      color: tickColor,
                    },
                  },
                  x: {
                    grid: { display: false },
                    ticks: {
                      font: { size: 9, weight: 'bold' },
                      color: tickColor,
                    },
                  },
                }
              : undefined,
      } as any,
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, labels, data, datasets, color, fill, tension, cutout, isDark]);

  return (
    <div style={{ height }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
}
