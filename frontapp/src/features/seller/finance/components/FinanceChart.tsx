'use client';

import React, { useEffect, useRef, useState } from 'react';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import { useTheme } from 'next-themes';

interface FinanceChartProps {
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

export default function FinanceChart({
    type,
    labels,
    data,
    label = '',
    color = '#0EA5E9',
    fill = true,
    tension = 0.4,
    cutout = '75%',
    height = '200px'
}: FinanceChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstance = useRef<Chart | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const gridColor = isDark ? '#334d3b' : '#f1f5f9';
    const tickColor = isDark ? '#9BAF9F' : '#94a3b8';
    const pointBorder = isDark ? '#1E3028' : '#ffffff';

    useEffect(() => {
        if (!chartRef.current) return;

        // Destroy previous instance
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const config: ChartConfiguration = {
            type,
            data: {
                labels,
                datasets: [{
                    label,
                    data,
                    borderColor: color,
                    backgroundColor: type === 'doughnut' ? [color, isDark ? '#1E3028' : '#F1F5F9'] : (fill ? `${color}1A` : 'transparent'),
                    borderWidth: type === 'doughnut' ? 0 : 3,
                    tension: type === 'line' ? tension : 0,
                    fill: type === 'line' ? fill : false,
                    pointBackgroundColor: color,
                    pointBorderColor: pointBorder,
                    pointRadius: type === 'line' ? 4 : 0,
                    borderRadius: type === 'bar' ? 8 : 0,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: type === 'doughnut' ? cutout : undefined,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                scales: type !== 'doughnut' && type !== 'radar' ? {
                    y: {
                        beginAtZero: true,
                        grid: { color: gridColor },
                        ticks: { font: { size: 10, weight: 'bold' }, color: tickColor }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 10, weight: 'bold' }, color: tickColor }
                    }
                } : undefined
            } as any
        };

        chartInstance.current = new Chart(ctx, config);

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
    }, [type, labels, data, color, fill, tension, cutout, isDark]);

    return (
        <div style={{ height }}>
            <canvas ref={chartRef}></canvas>
        </div>
    );
}
