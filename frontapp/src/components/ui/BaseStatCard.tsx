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

export default function BaseStatCard({
  label,
  value,
  description,
  icon,
  color = 'sky',
  trend,
  chart,
  suffix,
  className = '',
  onClick,
}: BaseStatCardProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-subtle)] shadow-sm transition-all duration-300 group ${
        onClick
          ? 'hover:shadow-xl hover:shadow-black/10 hover:-translate-y-1 cursor-pointer active:scale-[0.98] text-left w-full'
          : 'hover:shadow-xl hover:shadow-black/5'
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
              {value}
            </p>
            {suffix && (
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                {suffix}
              </span>
            )}
          </div>
          {description && (
            <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">
              {description}
            </p>
          )}
        </div>
        {icon && (
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 ml-4"
            style={{
              backgroundColor: `var(--${color}-100, var(--bg-secondary))`,
              color: `var(--${color}-500, var(--text-secondary))`,
            }}
          >
            <Icon name={icon} className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div
          className={`flex items-center gap-1 text-xs font-black ${
            trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
          }`}
        >
          <span>{trend.isPositive ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
        </div>
      )}
      {chart && <div className="mt-4">{chart}</div>}
      {onClick && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest flex items-center gap-1">
            <Icon name="ArrowRight" className="w-3 h-3" />
            Ver detalle
          </span>
        </div>
      )}
    </Tag>
  );
}
