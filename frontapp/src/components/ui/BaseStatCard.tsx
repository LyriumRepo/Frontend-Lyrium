import React from 'react';
import Icon from '@/components/ui/Icon';

interface BaseStatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: string;
  color?: string;
  trend?: { value: number; isPositive: boolean };
  chart?: React.ReactNode;
  suffix?: string;
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
}

const colorMap = {
    sky: {
        bg: 'bg-[#8FD400]/10 dark:bg-[#8FD400]/15',
        iconBg: 'bg-[#8FD400]',
        text: 'text-[#66D6A8] dark:text-[#8FD400]',
        border: 'border-[#8FD400]/20 dark:border-[#8FD400]/25',
        shadow: 'shadow-[#8FD400]/20 dark:shadow-[#8FD400]/20'
    },
    emerald: {
        bg: 'bg-[#B7E000]/10 dark:bg-[#B7E000]/15',
        iconBg: 'bg-[#B7E000]',
        text: 'text-[#8FD400] dark:text-[#B7E000]',
        border: 'border-[#B7E000]/20 dark:border-[#B7E000]/25',
        shadow: 'shadow-[#B7E000]/20 dark:shadow-[#B7E000]/20'
    },
    amber: {
        bg: 'bg-[#66D6A8]/10 dark:bg-[#66D6A8]/15',
        iconBg: 'bg-[#66D6A8]',
        text: 'text-[#4EC7B8] dark:text-[#66D6A8]',
        border: 'border-[#66D6A8]/20 dark:border-[#66D6A8]/25',
        shadow: 'shadow-[#66D6A8]/20 dark:shadow-[#66D6A8]/20'
    },
    indigo: {
        bg: 'bg-[#4EC7B8]/10 dark:bg-[#4EC7B8]/15',
        iconBg: 'bg-[#4EC7B8]',
        text: 'text-[#5AAFE6] dark:text-[#4EC7B8]',
        border: 'border-[#4EC7B8]/20 dark:border-[#4EC7B8]/25',
        shadow: 'shadow-[#4EC7B8]/20 dark:shadow-[#4EC7B8]/20'
    },
    rose: {
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        iconBg: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-500/20 dark:border-rose-500/25',
        shadow: 'shadow-rose-500/20 dark:shadow-rose-500/20'
    },
    violet: {
        bg: 'bg-[#69BEEB]/10 dark:bg-[#69BEEB]/15',
        iconBg: 'bg-[#69BEEB]',
        text: 'text-[#5AAFE6] dark:text-[#69BEEB]',
        border: 'border-[#69BEEB]/20 dark:border-[#69BEEB]/25',
        shadow: 'shadow-[#69BEEB]/20 dark:shadow-[#69BEEB]/20'
    },
    celeste: {
        bg: 'bg-[#69BEEB]/10 dark:bg-[#69BEEB]/15',
        iconBg: 'bg-[#69BEEB]',
        text: 'text-[#5AAFE6] dark:text-[#69BEEB]',
        border: 'border-[#69BEEB]/20 dark:border-[#69BEEB]/25',
        shadow: 'shadow-[#69BEEB]/20 dark:shadow-[#69BEEB]/20'
    }
};

const isValidColor = (c: string): c is keyof typeof colorMap => c in colorMap;

export default function BaseStatCard({
  label,
  value,
  description,
  icon,
  color = 'celeste',
  trend,
  chart,
  suffix,
  className = '',
  onClick,
}: BaseStatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  const theme = isValidColor(color) ? colorMap[color] : colorMap.celeste;

  return (
    <Tag
      onClick={onClick}
      className={`bg-[var(--bg-card)] p-6 rounded-2xl border ${theme.border} shadow-sm dark:shadow-none transition-all duration-300 hover:shadow-lg hover:shadow-[var(--border-subtle)]/20 hover:-translate-y-0.5 group relative overflow-hidden ${
        onClick ? 'cursor-pointer active:scale-[0.98] text-left w-full' : ''
      } ${className}`}
    >
      <div className={`absolute top-0 right-0 w-40 h-40 ${theme.bg} rounded-full -mr-20 -mt-20 blur-3xl transition-all duration-500 group-hover:scale-150`}></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          {icon && (
            <div className={`w-10 h-10 ${theme.iconBg} text-white dark:text-white/90 rounded-xl flex items-center justify-center shadow-md ${theme.shadow} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
              <Icon name={icon} className="w-5 h-5 stroke-[2.5px]" />
            </div>
          )}

          {trend && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${trend.isPositive ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800'}`}>
              <Icon name={trend.isPositive ? 'TrendingUp' : 'AlertCircle'} className="w-3 h-3" />
              {trend.value}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-1.5">
            <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none tabular-nums">
              {value}
            </h3>
            {suffix && <span className="text-xs font-black text-[var(--text-secondary)] uppercase tracking-tight">{suffix}</span>}
          </div>

          <div>
            <p className={`text-[11px] font-bold ${theme.text} uppercase tracking-wider`}>
              {label}
            </p>
            {description && (
              <p className="text-[10px] font-semibold text-[var(--text-secondary)]/60 mt-0.5 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>

        {chart && (
          <div className="mt-4 mb-1 min-h-[120px] w-full">
            {chart}
          </div>
        )}
      </div>

      {onClick && (
        <div className="relative z-10 mt-3 pt-3 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
            <Icon name="ArrowRight" className="w-3 h-3" />
            Ver detalle
          </span>
        </div>
      )}
    </Tag>
  );
}
