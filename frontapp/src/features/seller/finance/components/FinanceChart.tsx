'use client';

import React, { useEffect, useRef, useState } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import ZoomPlugin from 'chartjs-plugin-zoom';
import { useTheme } from 'next-themes';
import { companyColors } from '../colors';

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

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark') || resolvedTheme === 'dark');
    }, [resolvedTheme]);

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';
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
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: type === 'doughnut' ? cutout : undefined,
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
                        backgroundColor: isDark ? 'rgba(30, 48, 40, 0.95)' : 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f8fafc',
                        bodyColor: '#e2e8f0',
                        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)',
                        borderWidth: 1,
                        padding: 12,
                        bodyFont: { size: 12, weight: 'bold' } as any,
                        titleFont: { size: 11, weight: 'bold' } as any,
                        cornerRadius: 8,
                        displayColors: !!isMulti,
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

    return (
        <div style={{ height }} className="relative">
            {canZoom && isZoomed && (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); handleResetZoom(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleResetZoom(); } }}
                    className="absolute top-2 right-2 z-10 flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/30 cursor-pointer select-none"
                >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M3 12h18M3 6h18M3 18h18" />
                    </svg>
                    Reset
                </div>
            )}
            {canZoom && !isZoomed && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg pointer-events-none select-none opacity-70">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="7" /><path d="M21 21l-4.35-4.35" />
                        <path d="M11 8v6M8 11h6" />
                    </svg>
                    <span className="text-[9px] font-black">Zoom</span>
                </div>
            )}
            <canvas ref={chartRef}></canvas>
        </div>
    );
}
