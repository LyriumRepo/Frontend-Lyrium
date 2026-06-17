'use client';

import React, { useEffect, useRef, useState } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import ZoomPlugin from 'chartjs-plugin-zoom';
import { useTheme } from 'next-themes';
import { companyColors } from '../colors';

Chart.register(ZoomPlugin);

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
    height = '260px'
}: FinanceChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const { resolvedTheme } = useTheme();
    const [isDark, setIsDark] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const canZoom = ZOOMABLE_TYPES.includes(type);

    useEffect(() => {
        setIsDark(document.documentElement.classList.contains('dark') || resolvedTheme === 'dark');
    }, [resolvedTheme]);

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';
    const tickColor = isDark ? '#cbd5e1' : '#64748b';
    const pointBorder = isDark ? '#1E3028' : '#ffffff';

    useEffect(() => {
        if (!chartRef.current) return;

        // Destroy previous instance
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

        const resolvedColor = resolveColor(color);

        const config: ChartConfiguration = {
            type,
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    borderColor: resolvedColor,
                    backgroundColor: type === 'doughnut' ? [resolvedColor, isDark ? '#1E3028' : '#F1F5F9'] : (fill ? `${resolvedColor}1A` : 'transparent'),
                    borderWidth: type === 'doughnut' ? 0 : 3,
                    tension: type === 'line' ? tension : 0,
                    fill: type === 'line' ? fill : false,
                    pointBackgroundColor: resolvedColor,
                    pointBorderColor: pointBorder,
                    pointRadius: type === 'line' ? 4 : 0,
                    pointHoverRadius: type === 'line' ? 7 : 5,
                    borderRadius: type === 'bar' ? 8 : 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: type === 'doughnut' ? cutout : undefined,
                plugins: {
                    legend: { display: false },
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
                        displayColors: false,
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
                            limits: {
                                x: { minRange: 1 },
                            },
                        },
                    } : {}),
                },
                scales: type === 'radar' ? {
                    r: {
                        grid: { 
                            color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)' 
                        },
                        angleLines: { 
                            color: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)' 
                        },
                        pointLabels: {
                            color: isDark ? '#f1f5f9' : '#1e293b', // Bright labels in dark mode
                            font: { 
                                size: 10, 
                                weight: 'black',
                                family: "'Inter', sans-serif" 
                            }
                        },
                        ticks: {
                            showLabelBackdrop: false,
                            backdropColor: 'transparent',
                            color: isDark ? '#cbd5e1' : '#475569',
                            font: { 
                                size: 9, 
                                weight: 'bold' 
                            }
                        }
                    }
                } : (type !== 'doughnut' ? {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { font: { size: 10, weight: 'bold' }, color: tickColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10, weight: 'bold' }, color: tickColor }
                    }
                } : undefined)
            } as any
        };

        chartInstance.current = new Chart(ctx, config);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [type, labels, data, color, fill, tension, cutout, isDark]);

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
                    onClick={handleResetZoom}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleResetZoom(); }}
                    className="absolute top-2 right-2 z-10 px-2 py-1 text-[9px] font-black uppercase tracking-widest bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-lg hover:bg-[var(--bg-hover)] transition-all cursor-pointer select-none"
                >
                    Reset zoom
                </div>
            )}
            {canZoom && !isZoomed && (
                <span className="absolute top-2 right-2 z-10 text-[8px] font-bold text-[var(--text-secondary)] opacity-50 pointer-events-none select-none">
                    Scroll para zoom
                </span>
            )}
            <canvas ref={chartRef}></canvas>
        </div>
    );
}
