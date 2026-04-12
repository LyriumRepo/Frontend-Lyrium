'use client';

import React from 'react';
import ModuleHeader from '@/components/layout/shared/ModuleHeader';
import BaseButton from '@/components/ui/BaseButton';
import Skeleton from '@/components/ui/Skeleton';
import { TopBuyersRanking, SalesHeatmap } from '@/components/admin/finance/FinanceCharts';
import { useFinance } from '@/features/admin/finance/hooks/useFinance';
import { RefreshCw, Download, PieChart, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { exportToCSV } from '@/shared/lib/utils/export';

const cardColorClasses: Record<string, string> = { emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', blue: 'bg-sky-500/10 text-sky-500 border-sky-500/20' };

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FinancePageClientProps { }
export function FinancePageClient(_props: FinancePageClientProps) {
    const [activeTab, setActiveTab] = React.useState<'dashboard' | 'ranking'>('dashboard');
    const { data, loading, error, refresh } = useFinance();

    const stats = [
        { label: 'Utilidad Bruta (Mes)', val: data?.totalRevenue !== undefined ? `S/ ${data.totalRevenue.toLocaleString()}` : '-', icon: 'TrendingUp', color: 'emerald' },
        { label: 'Margen de Comisión (avg)', val: data?.commissionRate !== undefined ? `${data.commissionRate}%` : '-', icon: 'PieChart', color: 'indigo' },
        { label: 'Utilidad Neta (Lyrium)', val: data?.netProfit !== undefined ? `S/ ${data.netProfit.toLocaleString()}` : '-', icon: 'DollarSign', color: 'emerald' },
        { label: 'Tasa de Crecimiento', val: data?.growthPercentage !== undefined ? `+${data.growthPercentage}%` : '-', icon: 'Zap', color: 'blue' }
    ];

    const handleExport = () => {
        if (!data) return;
        const headers = ['Métrica', 'Valor'];
        const csvData = [['Ingresos Totales', `S/ ${data.totalRevenue}`], ['Margen Comisión', `${data.commissionRate}%`], ['Utilidad Neta', `S/ ${data.netProfit}`], ['Crecimiento', `${data.growthPercentage}%`]];
        exportToCSV(headers, csvData, `reporte-financiero-${new Date().toISOString().split('T')[0]}.csv`);
    };

    return (
        <div className="space-y-8 animate-fadeIn font-industrial pb-20">
            <ModuleHeader title="Centro Financiero" subtitle="Métricas, estadísticas y reportes de revenue management" icon="DollarSign" actions={<div className="flex gap-2"><BaseButton onClick={() => refresh()} variant="ghost" leftIcon="RefreshCw" size="md"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></BaseButton><BaseButton onClick={handleExport} variant="primary" leftIcon="Download" size="md">Exportar</BaseButton></div>} />
            {error && <div className="p-6 bg-[var(--bg-danger)] border border-[var(--text-danger)]/20 rounded-[2rem] text-[var(--text-danger)] font-bold">{error}</div>}
            {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[1, 2, 3, 4].map((i) => <Skeleton key={`finance-skel-${i}`} className="h-32 rounded-[2rem]" />)}</div> : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat) => (<div key={stat.label} className="bg-[var(--bg-card)] p-7 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-sm"><div className="flex items-center gap-4"><div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cardColorClasses[stat.color]}`}><TrendingUp className="w-6 h-6" /></div><div><p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.label}</p><p className="text-xl font-black text-[var(--text-primary)]">{stat.val}</p></div></div></div>))}
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            {data?.topBuyers && data.topBuyers.length > 0 && (
                                <TopBuyersRanking buyers={data.topBuyers} />
                            )}
                        </div>
                        <div className="lg:col-span-2">
                            {data?.heatmap && data.heatmap.length > 0 && (
                                <SalesHeatmap data={data.heatmap} />
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
