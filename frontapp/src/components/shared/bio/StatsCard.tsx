'use client';

import Icon from '@/components/ui/Icon';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  color?: 'green' | 'turquoise' | 'blue';
  showDot?: boolean;
}

const colorClasses = {
  green: {
    border: 'border-l-[#67ce00]',
    bg: 'bg-emerald-500 to-teal-600',
    iconBg: 'bg-white/20',
  },
  turquoise: {
    border: 'border-l-[#019895]',
    bg: 'bg-cyan-500 to-sky-600',
    iconBg: 'bg-white/20',
  },
  blue: {
    border: 'border-l-[#3b82f6]',
    bg: 'bg-blue-500 to-indigo-600',
    iconBg: 'bg-white/20',
  },
};

export default function StatsCard({ icon, label, value, color = 'green', showDot = false }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div 
      className={`
        relative bg-white rounded-xl p-4 md:p-6 flex items-center gap-3 md:gap-4 
        shadow-sm border border-slate-100 transition-all duration-300 
        hover:-translate-y-1 hover:shadow-md overflow-hidden
        border-l-[6px] ${colors.border}
      `}
    >
      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${colors.iconBg}`}>
        <Icon name={icon} className="w-5 h-5 md:w-7 md:h-7 text-white" />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-xs md:text-sm text-slate-500 font-normal">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-slate-800 flex items-center">
          {showDot && (
            <span className="w-3 h-3 rounded-full bg-emerald-500 mr-2 animate-pulse" style={{ backgroundColor: '#10b981' }} />
          )}
          {value}
        </p>
      </div>
    </div>
  );
}
