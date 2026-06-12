import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
}

interface BaseStatsGridProps {
  stats?: StatItem[];
  columns?: number;
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function BaseStatsGrid({
  stats,
  columns = 4,
  isLoading,
  children,
  className = '',
}: BaseStatsGridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  };

  const colsClass = gridCols[columns as keyof typeof gridCols] || gridCols[4];

  if (isLoading) {
    return (
      <div className={`grid gap-6 ${colsClass} ${className}`}>
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse bg-[var(--bg-secondary)]/70 rounded-[2rem]"
          />
        ))}
      </div>
    );
  }

  if (children) {
    return <div className={`grid gap-6 ${colsClass} ${className}`}>{children}</div>;
  }

  if (!stats) return null;

  return (
    <div className={`grid gap-6 ${colsClass} ${className}`}>
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-[var(--bg-card)] p-6 rounded-[2rem] border border-[var(--border-subtle)] shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group"
        >
          <div className="flex items-center gap-4">
            {stat.icon && (
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                style={{
                  backgroundColor: stat.color ? `${stat.color}1A` : 'var(--bg-secondary)',
                  color: stat.color || 'var(--text-secondary)',
                }}
              >
                <span className="text-2xl font-black">{stat.icon}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest truncate">
                {stat.label}
              </p>
              <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter mt-0.5">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
