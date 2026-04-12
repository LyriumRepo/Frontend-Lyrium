import React from 'react';
import dynamic from 'next/dynamic';
import { SellerAnalytics, CatalogProduct, GeographicZone, AnalyticsKPI } from '@/features/admin/analytics/types';
import { TrendingUp, Magnet, Filter as Funnel, Store as Storefront, Star, Skull, BarChart3, TrendingDown } from 'lucide-react';

interface TooltipPayload {
    payload?: {
        nombre: string;
        conversion: number;
        roi: number;
        crecimiento: number;
    };
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
}

const ScatterChart = dynamic(() => import('recharts').then(mod => mod.ScatterChart), { ssr: false });
const Scatter = dynamic(() => import('recharts').then(mod => mod.Scatter), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const RTooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });
const AreaChart = dynamic(() => import('recharts').then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import('recharts').then(mod => mod.Area), { ssr: false });

const MapIcon = (iconName: string) => {
    switch (iconName) {
        case 'ChartLineUp': return <TrendingUp className="w-8 h-8" />;
        case 'Magnet': return <Magnet className="w-8 h-8" />;
        case 'Funnel': return <Funnel className="w-8 h-8" />;
        case 'Storefront': return <Storefront className="w-8 h-8" />;
        default: return <BarChart3 className="w-8 h-8" />;
    }
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        if (!data) return null;
        return (
            <div className="bg-gray-900 text-white p-3 rounded-xl text-xs font-industrial">
                <p className="font-bold mb-1 uppercase tracking-widest text-[#0ea5e9]">{data.nombre}</p>
                <p>Conv: {data.conversion}% | ROI: {data.roi}%</p>
                <p className={data.crecimiento > 0 ? 'text-emerald-400' : 'text-red-400'}>Crecimiento: {data.crecimiento}%</p>
            </div>
        );
    }
    return null;
};

export const KpiCard: React.FC<{ kpi: AnalyticsKPI }> = ({ kpi }) => {

    return (
        <div className="bg-[var(--bg-card)] p-6 border-l-4 border-indigo-500 transition-all hover:-translate-y-1 rounded-2xl shadow-sm font-industrial">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${kpi.color}-500/10 text-${kpi.color}-500 rounded-2xl`}>
                    {MapIcon(kpi.icon)}
                </div>
            </div>
            <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">{kpi.label}</h3>
            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{kpi.val}</p>
        </div>
    );
}

// Scatter Chart: ROI vs Conversion (RF-10) using Recharts
export const ScatterPerformanceChart: React.FC<{ sellers: SellerAnalytics[] }> = ({ sellers }) => {

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                    dataKey="conversion"
                    type="number"
                    name="Conversión"
                    unit="%"
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                />
                <YAxis
                    dataKey="roi"
                    type="number"
                    name="ROI"
                    unit="%"
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                    axisLine={false}
                    tickLine={false}
                />
                <RTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                <Scatter name="Vendedores" data={sellers}>
                    {sellers.map((entry) => (
                        <Cell key={entry.id} fill={entry.crecimiento > 0 ? '#0ea5e9' : '#ef4444'} />
                    ))}
                </Scatter>
            </ScatterChart>
        </ResponsiveContainer>
    );
};

// Retention Area Chart using Recharts
export const RetentionLineChart: React.FC<{ retentionData: { mes: string; retencion: number }[] }> = ({ retentionData }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={retentionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorRetencion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="mes"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF' }}
                    tickFormatter={(v) => `${v}%`}
                />
                <RTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ fontWeight: 'bold', color: '#6366f1' }}
                    formatter={(val: any) => [`${val ?? 0}%`, 'Retención']}
                />
                <Area type="monotone" dataKey="retencion" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRetencion)" />
            </AreaChart>
        </ResponsiveContainer>
    );
};


// Catalog Performance List (RF-10)
export const CatalogPerformanceList: React.FC<{ products: CatalogProduct[] }> = ({ products }) => (
    <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar font-industrial">
        {products.map(p => (
            <div key={p.id} className="flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-xl ${p.tipo === 'estrella' ? 'bg-amber-500/10 text-amber-500' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'} flex items-center justify-center`}>
                    {p.tipo === 'estrella' ? <Star className="w-5 h-5" /> : <Skull className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                    <p className="text-xs font-black text-[var(--text-primary)] leading-none mb-1 uppercase tracking-tight">{p.nombre}</p>
                    <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{p.ventas} Ventas Totales</p>
                </div>
                <div className="text-right">
                    <p className={`text-xs font-black ${p.tipo === 'estrella' ? 'text-emerald-500' : 'text-red-400'}`}>{p.rotacion}%</p>
                    <p className="text-[8px] font-black text-[var(--text-muted)] uppercase">Rotación</p>
                </div>
            </div>
        ))}
    </div>
);

// Seller Leaderboard (RF-10)
export const SellerLeaderboard: React.FC<{ sellers: SellerAnalytics[] }> = ({ sellers }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 font-industrial">
        {sellers.map((v, idx) => (
            <div key={v.id} className="bg-[var(--bg-card)] p-6 bg-[var(--bg-secondary)]/50 border-none rounded-2xl shadow-sm hover:scale-[1.02] transition-transform border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-[var(--text-muted)]">RANK #0{idx + 1}</span>
                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">{v.rubro}</span>
                </div>
                <p className="text-xs font-black text-[var(--text-primary)] mb-4 truncate uppercase tracking-tight">{v.nombre}</p>
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase leading-none mb-1">ROI</p>
                        <p className="text-lg font-black text-[var(--text-primary)]">{v.roi}%</p>
                    </div>
                    <div>
                        {v.crecimiento > 0 ? <TrendingUp className="w-6 h-6 text-emerald-500" /> : <TrendingDown className="w-6 h-6 text-red-400" />}
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase leading-none mb-1">Conv.</p>
                        <p className="text-lg font-black text-emerald-500">{v.conversion}%</p>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

// Geographic Map Bars (RF-11)
export const GeographicMapBars: React.FC<{ zones: GeographicZone[] }> = ({ zones }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 font-industrial">
        {zones.map(z => (
            <div key={z.zona} className="flex flex-col gap-3">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest truncate max-w-[70%]">{z.zona}</span>
                    <span className="text-xs font-black text-[var(--text-primary)]">{z.demanda} ped.</span>
                </div>
                <div className="h-2 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${(z.demanda / 600 * 100)}%`, backgroundColor: z.color }}></div>
                </div>
            </div>
        ))}
    </div>
);

// Frequency Bars (RF-11)
export const FrequencyBars: React.FC<{ segments: { VIP: number; Recurrente: number; Ocasional: number } }> = ({ segments }) => {
    const list = [
        { label: 'Segmento VIP', val: segments.VIP, color: 'bg-sky-400', shadow: 'shadow-[0_0_10px_rgba(56,189,248,0.5)]' },
        { label: 'Segmento Recurrente', val: segments.Recurrente, color: 'bg-indigo-400', shadow: '' },
        { label: 'Segmento Ocasional', val: segments.Ocasional, color: 'bg-blue-400', shadow: '' }
    ];

    return (
        <div className="space-y-8 font-industrial">
            {list.map(s => (
                <div key={s.label} className="space-y-3">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-sky-200 uppercase tracking-widest">{s.label}</span>
                        <span className="text-lg font-black text-white">{s.val} días prom</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className={`h-full ${s.color} ${s.shadow} transition-all duration-1000`} style={{ width: `${Math.max(10, 100 - (s.val / 60 * 100))}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    );
};
