'use client';

import React, { useEffect, useRef, useState } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import ZoomPlugin from 'chartjs-plugin-zoom';
import { useTheme } from 'next-themes';
import { companyColors } from '../colors';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';
import PlanUpgradeMessage from '@/features/seller/store/components/PlanUpgradeMessage';
import Icon from '@/components/ui/Icon';

Chart.register(ZoomPlugin);

export interface FinanceChartDataset {
    label: string;
    data: number[];
    color: string;
}

export interface FinanceChartProps {
    type: 'line' | 'bar' | 'doughnut' | 'radar';
    labels: string[];
    data: number[];
    label?: string;
    color?: string;
    fill?: boolean;
    tension?: number;
    cutout?: string;
    height?: string;
    datasets?: FinanceChartDataset[];
}

const ZOOMABLE_TYPES: FinanceChartProps['type'][] = ['line', 'bar'];

const annotationsPlugin = {
    id: 'lyrium-annotations',
    afterDatasetsDraw(chart: any) {
        const { ctx, data: chartData } = chart;
        const datasets = chartData.datasets;
        if (!datasets?.length) return;
        const values: number[] = datasets[0].data as number[];
        if (!values?.length) return;
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const maxIdx = values.indexOf(maxVal);
        const minIdx = values.indexOf(minVal);
        const drawLabel = (idx: number, val: number, isMax: boolean) => {
            const meta = chart.getDatasetMeta(0);
            if (!meta?.data?.[idx]) return;
            const { x, y } = meta.data[idx];
            const label = isMax ? `▲ ${val.toLocaleString('es-PE')}` : `▼ ${val.toLocaleString('es-PE')}`;
            const dark = document.documentElement.classList.contains('dark');
        const color = isMax ? (dark ? '#B7E000' : '#5a7a00') : (dark ? '#f87171' : '#dc2626');
            ctx.save();
            ctx.font = 'bold 10px Inter, sans-serif';
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 4;
            ctx.fillText(label, x, isMax ? y - 10 : y + 18);
            ctx.restore();
        };
        drawLabel(maxIdx, maxVal, true);
        if (maxIdx !== minIdx) drawLabel(minIdx, minVal, false);
    },
};

const crosshairPlugin = {
    id: 'lyrium-crosshair',
    afterDraw(chart: any) {
        const { ctx, chartArea, tooltip } = chart;
        if (!tooltip || !tooltip._active || tooltip._active.length === 0) return;
        const x = tooltip._active[0].element.x;
        if (x < chartArea.left || x > chartArea.right) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, chartArea.top);
        ctx.lineTo(x, chartArea.bottom);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(90,175,230,0.45)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
    },
};

export default function FinanceChart({
    type,
    labels,
    data,
    label = '',
    color = companyColors.azulCeleste,
    fill = true,
    tension = 0.4,
    cutout = '75%',
    height = '320px',
    datasets,
}: FinanceChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const { resolvedTheme } = useTheme();
    const [isDark, setIsDark] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const canZoom = ZOOMABLE_TYPES.includes(type);
    const isMulti = datasets && datasets.length > 0;
    const { can } = usePlanCapabilities();
    const canViewCharts = can('can_finance_charts');

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark') || resolvedTheme === 'dark');
    }, [resolvedTheme]);

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0';
    const tickColor = isDark ? '#cbd5e1' : '#64748b';
    const pointBorder = isDark ? '#1E3028' : '#ffffff';

    useEffect(() => {
        if (!chartRef.current) return;

        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const resolveColor = (c: string) => {
            if (typeof window !== 'undefined' && c.startsWith('--')) {
                return getComputedStyle(document.documentElement).getPropertyValue(c).trim() || '#0ea5e9';
            }
            return c;
        };

        const buildDataset = (
            dsLabel: string,
            dsData: number[],
            dsColor: string,
            index = 0,
        ) => {
            const resolved = resolveColor(dsColor);

            let backgroundStyle: string | CanvasGradient = fill ? `${resolved}1A` : 'transparent';

            if (type === 'bar') {
                const grad = ctx.createLinearGradient(0, 0, 0, 240);
                grad.addColorStop(0, `${resolved}CC`);
                grad.addColorStop(1, `${resolved}18`);
                backgroundStyle = grad;
            }

            if (type === 'doughnut') {
                backgroundStyle = index === 0
                    ? resolved
                    : (isDark ? '#1E3028' : '#F1F5F9');
            }

            return {
                label: dsLabel,
                data: dsData,
                borderColor: resolved,
                backgroundColor: backgroundStyle,
                borderWidth: type === 'doughnut' ? 0 : (type === 'line' ? 2.5 : 0),
                tension: type === 'line' ? tension : 0,
                fill: type === 'line' ? fill : false,
                pointBackgroundColor: resolved,
                pointBorderColor: pointBorder,
                pointRadius: type === 'line' ? 4 : 0,
                pointHoverRadius: type === 'line' ? 7 : 5,
                borderRadius: type === 'bar' ? 8 : 0,
            };
        };

        const chartDatasets = isMulti
            ? datasets!.map((ds, i) => buildDataset(ds.label, ds.data, ds.color, i))
            : [buildDataset(label, data, color)];

        const config: ChartConfiguration = {
            type,
            data: { labels, datasets: chartDatasets },
            plugins: ZOOMABLE_TYPES.includes(type) ? [crosshairPlugin as any, annotationsPlugin as any] : [],
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: type === 'doughnut' ? cutout : undefined,
                interaction: ZOOMABLE_TYPES.includes(type)
                    ? { mode: 'index' as const, intersect: false }
                    : { mode: 'nearest' as const, intersect: true },
                plugins: {
                    legend: {
                        display: !!isMulti,
                        position: 'top' as const,
                        labels: {
                            color: tickColor,
                            font: { size: 11, weight: 'bold' },
                            boxWidth: 12,
                            boxHeight: 12,
                            borderRadius: 4,
                            padding: 12,
                        },
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(15, 23, 42, 0.92)',
                        titleColor: '#f8fafc',
                        bodyColor: '#cbd5e1',
                        footerColor: '#94a3b8',
                        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.18)',
                        borderWidth: 1,
                        padding: { top: 10, bottom: 10, left: 14, right: 14 },
                        bodyFont: { size: 12, weight: 'bold' } as any,
                        titleFont: { size: 11, weight: 'bold' } as any,
                        footerFont: { size: 10, style: 'italic' } as any,
                        cornerRadius: 10,
                        displayColors: true,
                        boxWidth: 10,
                        boxHeight: 10,
                        callbacks: {
                            title: (items: any[]) => items[0]?.label ?? '',
                            label: (item: any) => {
                                const val: number = item.parsed.y ?? item.parsed ?? 0;
                                const isCurrency = type === 'line' || (label && label.toLowerCase().includes('ingreso'));
                                const formatted = isCurrency
                                    ? `S/ ${val.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                    : val.toLocaleString('es-PE');
                                return `  ${item.dataset.label || label || ''}: ${formatted}`;
                            },
                            footer: (items: any[]) => {
                                if (items.length <= 1) return '';
                                const total = items.reduce((s: number, it: any) => s + (it.parsed.y ?? 0), 0);
                                return `Total: S/ ${total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            },
                        },
                    },
                    ...(canZoom ? {
                        zoom: {
                            zoom: {
                                wheel: { enabled: true },
                                pinch: { enabled: true },
                                mode: 'x' as const,
                                onZoom: () => setIsZoomed(true),
                            },
                            pan: {
                                enabled: true,
                                mode: 'x' as const,
                            },
                            limits: { x: { minRange: 1 } },
                        },
                    } : {}),
                },
                scales: type === 'radar' ? {
                    r: {
                        grid: { color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)' },
                        angleLines: { color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)' },
                        pointLabels: {
                            color: isDark ? '#f1f5f9' : '#1e293b',
                            font: { size: 10, weight: 'black', family: "'Inter', sans-serif" },
                        },
                        ticks: {
                            showLabelBackdrop: false,
                            backdropColor: 'transparent',
                            color: isDark ? '#cbd5e1' : '#475569',
                            font: { size: 9, weight: 'bold' },
                        },
                    },
                } : (type !== 'doughnut' ? {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { font: { size: 10, weight: 'bold' }, color: tickColor },
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10, weight: 'bold' }, color: tickColor },
                    },
                } : undefined),
            } as any,
        };

        chartInstance.current = new Chart(ctx, config);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [type, labels, data, color, fill, tension, cutout, isDark, datasets, isMulti, label]);

    const handleResetZoom = () => {
        if (chartInstance.current) {
            (chartInstance.current as any).resetZoom();
            setIsZoomed(false);
        }
    };

    const handleExport = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!chartInstance.current) return;
        const url = (chartInstance.current as any).toBase64Image('image/png', 1.0);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lyrium-${label || 'grafica'}.png`;
        a.click();
    };

    if (!canViewCharts) {
        return (
            <div style={{ height }} className="relative flex items-center justify-center bg-[var(--bg-secondary)]/40 rounded-2xl">
                <div className="max-w-xs px-4">
                    <Icon name="Lock" className="w-6 h-6 text-[var(--lima-500)] mx-auto mb-3" />
                    <PlanUpgradeMessage message="Los gráficos financieros avanzados están disponibles desde el plan Crece. Actualiza tu plan para visualizarlos." />
                </div>
            </div>
        );
    }

    return (
        <div style={{ height }} className="relative">
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                <div
                    role="button"
                    tabIndex={0}
                    onClick={handleExport}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleExport(e as any); }}
                    title="Descargar gráfica como PNG"
                    className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-secondary)]/80 transition-all select-none cursor-pointer"
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    <span className="text-[9px] font-black">PNG</span>
                </div>
                {canZoom && isZoomed ? (
                    <div
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleResetZoom(); }}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/30 select-none cursor-pointer"
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                        Reset
                    </div>
                ) : canZoom ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg pointer-events-none select-none opacity-70">
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                            <path d="M11 8v6M8 11h6" />
                        </svg>
                        <span className="text-[9px] font-black">Zoom</span>
                    </div>
                ) : null}
            </div>
            <canvas ref={chartRef}></canvas>
        </div>
    );
}
