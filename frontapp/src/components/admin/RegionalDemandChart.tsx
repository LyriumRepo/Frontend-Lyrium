'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getOrders } from '@/shared/lib/api';
import { Order } from '@/shared/types/wp/wp-types';
import Icon from '@/components/ui/Icon';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });
const Cell = dynamic(() => import('recharts').then(mod => mod.Cell), { ssr: false });

interface RegionalData {
    name: string;
    value: number;
    region?: string;
}

export default function RegionalDemandChart() {
    const [data, setData] = useState<RegionalData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegionalData = async () => {
            try {
                setLoading(true);
                const orders = await getOrders();

                // Agrupar pedidos por ciudad (billing.city)
                const regionMap: { [key: string]: number } = {};

                orders.forEach(order => {
                    const city = order.billing?.city || 'Otros';
                    regionMap[city] = (regionMap[city] || 0) + 1;
                });

                const chartData = Object.entries(regionMap)
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 5); // Top 5 regiones

                setData(chartData);
            } catch (error) {
                console.error('Error fetching regional data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRegionalData();
    }, []);

    const COLORS = ['#00A3FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

    if (loading) {
        return (
            <div className="bg-white rounded-3xl p-10 border border-gray-100 shadow-sm h-[350px] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-brand-sky/20 border-t-brand-sky rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm h-[350px] flex flex-col transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-gray-900 font-black uppercase tracking-widest text-xs">Demanda Regional</h3>
                    <p className="text-gray-400 text-[10px] font-bold mt-1 uppercase">Top 5 Ciudades con más pedidos</p>
                </div>
                <Icon name="MapPin" className="text-brand-sky w-5 h-5 opacity-20" />
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 9, fontWeight: 800, fill: '#94A3B8' }}
                            width={80}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                fontSize: '10px',
                                fontWeight: 900,
                                textTransform: 'uppercase'
                            }}
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                            {data.map((entry, index) => (
                                <Cell key={entry.region ?? `region-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {data.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px] rounded-3xl">
                    <p className="text-gray-400 font-black uppercase tracking-widest text-[9px]">Sin datos geográficos suficientes</p>
                </div>
            )}
        </div>
    );
}
