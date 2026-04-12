'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';

export interface TicketStats {
  open?: number;
  inProgress?: number;
  resolved?: number;
  total?: number;
}

export interface HelpdeskFeatures {
  showPriority?: boolean;
  showStats?: boolean;
  canCloseTicket?: boolean;
}

interface TicketStatsProps {
  stats: TicketStats;
  features?: HelpdeskFeatures;
  loading?: boolean;
}

const defaultFeatures: HelpdeskFeatures = {
  showStats: true,
};

const colorMap = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' },
  violet: { bg: 'bg-violet-500', text: 'text-violet-500', light: 'bg-violet-50' },
  sky: { bg: 'bg-sky-500', text: 'text-sky-500', light: 'bg-sky-50' },
};

export default function TicketStats({
  stats,
  features: customFeatures,
  loading = false,
}: TicketStatsProps) {
  const features = { ...defaultFeatures, ...customFeatures };

  if (!features.showStats) return null;

  const statsConfig = [
    { label: 'Abiertos', value: stats.open || 0, icon: 'AlertCircle', colorKey: 'rose' as const },
    { label: 'En Proceso', value: stats.inProgress || 0, icon: 'Clock', colorKey: 'amber' as const },
    { label: 'Resueltos', value: stats.resolved || 0, icon: 'CheckCircle', colorKey: 'emerald' as const },
    { label: 'Total', value: stats.total || 0, icon: 'Inbox', colorKey: 'violet' as const },
  ];

  const badgeColorMap: Record<string, { bg: string; text: string; light: string }> = {
    rose: { bg: 'bg-rose-500', text: 'text-rose-500', light: 'bg-rose-50' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-50' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-500', light: 'bg-violet-50' },
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={`ticket-stat-skel-${i}`} className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4 animate-pulse">
            <div className="flex justify-between items-center">
              <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              <div className="h-8 w-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {statsConfig.map((stat) => {
        const colors = badgeColorMap[stat.colorKey];
        
        return (
          <div 
            key={stat.label} 
            className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm group hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 ${colors.light} ${colors.text} rounded-2xl flex items-center justify-center`}>
                <Icon name={stat.icon as string} className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tighter">
                {stat.value}
              </span>
            </div>
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {stat.label}
            </h3>
          </div>
        );
      })}
    </div>
  );
}
