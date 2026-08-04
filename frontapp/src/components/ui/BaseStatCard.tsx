import React from 'react';
import Icon from '@/components/ui/Icon';
import KpiBadge from '@/components/ui/KpiBadge';

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
  badge?: {
    label: string;
    level: 'regular' | 'good' | 'excellent';
    tip?: string;
    scale?: string | null;
  };
}

const _info = {
  bg: 'bg-[var(--color-info)]/10 dark:bg-[var(--color-info)]/15',
  iconBg: 'bg-[var(--color-info)]',
  text: 'text-[var(--text-primary)] dark:text-[var(--color-info)]',
  border: 'border-[var(--color-info)]/20 dark:border-[var(--color-info)]/25',
  shadow: 'shadow-[var(--color-info)]/20',
};
const _success = {
  bg: 'bg-[var(--color-success)]/10 dark:bg-[var(--color-success)]/15',
  iconBg: 'bg-[var(--color-success)]',
  text: 'text-[var(--text-primary)] dark:text-[var(--color-success)]',
  border:
    'border-[var(--color-success)]/20 dark:border-[var(--color-success)]/25',
  shadow: 'shadow-[var(--color-success)]/20',
};
const _teal = {
  bg: 'bg-[var(--icons-green)]/10 dark:bg-[var(--icons-green)]/15',
  iconBg: 'bg-[var(--icons-green)]',
  text: 'text-[var(--text-primary)] dark:text-[var(--icons-green)]',
  border: 'border-[var(--icons-green)]/20 dark:border-[var(--icons-green)]/25',
  shadow: 'shadow-[var(--icons-green)]/20',
};
const _error = {
  bg: 'bg-[var(--color-error)]/10 dark:bg-[var(--color-error)]/15',
  iconBg: 'bg-[var(--color-error)]',
  text: 'text-[var(--color-error)] dark:text-[var(--color-error)]',
  border: 'border-[var(--color-error)]/20 dark:border-[var(--color-error)]/25',
  shadow: 'shadow-[var(--color-error)]/20',
};

const colorMap = {
  sky: _info,
  violet: _info,
  celeste: _info,
  azulCeleste: _info,
  emerald: _success,
  lima: _success,
  verde: _success,
  amber: _teal,
  indigo: _teal,
  turquesaClaro: _teal,
  turquesa: _teal,
  rose: _error,
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
  badge,
}: BaseStatCardProps) {
  const Tag = onClick ? 'button' : 'div';
  const theme = isValidColor(color) ? colorMap[color] : colorMap.celeste;

  return (
    <Tag
      onClick={onClick}
      className={`bg-[var(--bg-card)] p-4 sm:p-6 rounded-2xl border ${theme.border} shadow-lg dark:shadow-none transition-all duration-300 hover:shadow-xl hover:shadow-[var(--border-subtle)]/20 hover:-translate-y-0.5 group relative overflow-hidden min-w-0 ${
        onClick ? 'cursor-pointer active:scale-[0.98] text-left w-full' : ''
      } ${className}`}
    >
      <div
        className={`absolute top-0 right-0 w-40 h-40 ${theme.bg} rounded-full -mr-20 -mt-20 blur-3xl transition-all duration-500 group-hover:scale-150`}
      ></div>

      <div className="relative z-10 min-w-0">
        <div className="flex items-center gap-2 sm:gap-3 mb-2.5 sm:mb-4">
          {icon && (
            <div
              className={`w-8 h-8 sm:w-10 sm:h-10 ${theme.iconBg} text-white dark:text-white/90 rounded-xl flex items-center justify-center shadow-md ${theme.shadow} transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shrink-0`}
            >
              <Icon name={icon} className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5px]" />
            </div>
          )}

          {trend && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${trend.isPositive ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20' : 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20'}`}
            >
              <Icon
                name={trend.isPositive ? 'TrendingUp' : 'TrendingDown'}
                className="w-3 h-3"
              />
              {trend.isPositive ? '+' : '-'}
              {typeof trend.value === 'number'
                ? trend.value.toFixed(1)
                : trend.value}
              %
            </div>
          )}
        </div>

        <div className="space-y-1 sm:space-y-1.5 min-w-0">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h3 className="text-xl sm:text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none tabular-nums truncate">
              {value}
            </h3>
            {suffix && (
              <span className="text-[10px] sm:text-xs font-black text-[var(--text-secondary)] uppercase tracking-tight shrink-0">
                {suffix}
              </span>
            )}
          </div>

          <div>
            <p
              className={`text-[9px] sm:text-[11px] font-bold ${theme.text} uppercase tracking-wider leading-tight`}
            >
              {label}
            </p>
            {description && (
              <p className="text-[10px] font-semibold text-[var(--text-secondary)]/60 mt-0.5 leading-snug">
                {description}
              </p>
            )}
          </div>
        </div>

        {badge && (
          <KpiBadge
            label={badge.label}
            level={badge.level}
            scale={badge.scale}
          />
        )}

        {chart && <div className="mt-4 mb-1 min-h-[120px] w-full">{chart}</div>}
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
