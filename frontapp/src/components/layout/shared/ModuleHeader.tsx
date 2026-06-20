import React from 'react';
import Icon from '@/components/ui/Icon';

interface ModuleHeaderProps {
    title: React.ReactNode;
    subtitle: string;
    icon?: string;
    gradient?: string;
    height?: string;
    children?: React.ReactNode;
    actions?: React.ReactNode;
}

export default function ModuleHeader({
    title,
    subtitle,
    icon,
    gradient = 'bg-brand-gradient',
    height = '6rem',
    children,
    actions,
}: ModuleHeaderProps) {
    const hasActions = !!actions || !!children;

    return (
        <div
            className={`flex flex-col sm:flex-row sm:items-stretch justify-between ${gradient} rounded-2xl overflow-visible shadow-sm border border-[var(--border-subtle)] mb-8 group transition-all duration-300 hover:shadow-md`}
            style={{ minHeight: '4rem' }}
        >
            {/* Lado Izquierdo (Blanco Inteligente con Máscara) */}
            <div className={`lateral-gradient-mask dark:!bg-[var(--bg-card)] pl-5 sm:pl-8 pr-5 sm:pr-16 md:pr-24 py-4 sm:py-7 flex flex-col justify-center flex-none z-10 transition-all duration-500 ${hasActions ? 'w-full sm:w-auto sm:max-w-[60%]' : 'w-full'}`}>
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--celeste-500)]/10 group-hover:text-[var(--celeste-500)] transition-all duration-500 flex-shrink-0">
                            <Icon name={icon} className="w-4 h-4 sm:w-5 sm:h-5 !stroke-[2.5px]" />
                        </div>
                    )}
                    <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight leading-tight text-[var(--text-primary)]">
                        {title}
                    </h1>
                </div>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-medium mt-1 line-clamp-1">
                    {subtitle}
                </p>
            </div>

            {/* Lado Derecho (Degradado dinámico con brillo) */}
            {hasActions && (
                <div className="flex items-center justify-start sm:justify-end px-5 sm:px-10 pb-4 sm:pb-0 relative sm:flex-1">
                    <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 hidden sm:block"></div>

                    <div className="relative z-20 flex flex-wrap items-center gap-2 sm:gap-3">
                        {actions}
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
