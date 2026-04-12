'use client';

import React from 'react';
import { TopBuyer, HeatmapData } from '@/lib/types/admin/finance';
import { Users, TrendingUp, Trophy, Calendar } from 'lucide-react';

// --- RANKING DE MEJORES COMPRADORES (RF-07) ---
export const TopBuyersRanking: React.FC<{ buyers: TopBuyer[] }> = ({ buyers }) => {
    return (
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl font-industrial">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">
                        Lealtad y Retención (CLV)
                    </h3>
                    <p className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                        Ranking de Mejores Compradores
                    </p>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl">
                    <Trophy className="w-5 h-5" />
                </div>
            </div>

            <div className="space-y-4">
                {buyers.map((buyer, idx) => (
                    <div key={buyer.id} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[var(--bg-secondary)] transition-all group">
                        <div className="w-10 h-10 bg-[var(--text-primary)] text-[var(--bg-card)] rounded-xl flex items-center justify-center font-black text-xs">
                            #{idx + 1}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-[var(--text-primary)] uppercase group-hover:text-indigo-500 transition-colors">{buyer.name}</p>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{buyer.purchases} Pedidos Concluídos</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-emerald-500 tracking-tighter">S/ {buyer.clv.toLocaleString()}</p>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{buyer.lastPurchase}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAPA DE CALOR DE VENTAS (RF-08) ---
export const SalesHeatmap: React.FC<{ data: HeatmapData[] }> = ({ data }) => {
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const timeSlots = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    const getIntensity = (day: string, hour: number) => {
        const item = data.find(d => d.day === day && d.hour === hour);
        if (!item) return 0;
        return item.value;
    };

    const getBgColor = (intensity: number) => {
        if (intensity === 0) return 'bg-[var(--bg-secondary)]';
        if (intensity < 40) return 'bg-indigo-500/20';
        if (intensity < 70) return 'bg-indigo-500/40';
        if (intensity < 100) return 'bg-indigo-500/60';
        return 'bg-indigo-700';
    };

    return (
        <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-subtle)] shadow-xl font-industrial col-span-full lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1">
                        Densidad Transaccional Temporal
                    </h3>
                    <p className="text-lg font-black text-[var(--text-primary)] tracking-tight">
                        Mapa de Calor de Ventas (Peak Hours)
                    </p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                    <Calendar className="w-5 h-5" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                    <div className="grid grid-cols-[80px_1fr] gap-4 mb-2">
                        <div></div>
                        <div className="grid grid-cols-10 gap-2">
                            {timeSlots.map(h => (
                                <div key={h} className="text-[9px] font-black text-[var(--text-muted)] text-center uppercase">{h}:00</div>
                            ))}
                        </div>
                    </div>

                    {days.map(day => (
                        <div key={day} className="grid grid-cols-[80px_1fr] gap-4 mb-2 items-center">
                            <div className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{day}</div>
                            <div className="grid grid-cols-10 gap-2">
                                {timeSlots.map(hour => {
                                    const intensity = getIntensity(day, hour);
                                    return (
                                        <div
                                            key={hour}
                                            className={`h-8 rounded-lg transition-all hover:scale-110 cursor-help border border-white/20 shadow-sm ${getBgColor(intensity)}`}
                                            title={`${day} ${hour}:00 - Intensidad: ${intensity}`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-4">
                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase">Intensidad:</span>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-[var(--bg-secondary)] rounded shadow-sm border border-[var(--border-subtle)]"></div>
                    <div className="w-3 h-3 bg-indigo-500/20 rounded shadow-sm"></div>
                    <div className="w-3 h-3 bg-indigo-500/40 rounded shadow-sm"></div>
                    <div className="w-3 h-3 bg-indigo-500/60 rounded shadow-sm"></div>
                    <div className="w-3 h-3 bg-indigo-700 rounded shadow-sm"></div>
                </div>
            </div>
        </div>
    );
};
