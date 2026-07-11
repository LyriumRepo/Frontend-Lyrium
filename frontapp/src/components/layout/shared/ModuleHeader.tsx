import React from 'react';
import Icon from '@/components/ui/Icon';

interface ModuleHeaderProps {
    title: React.ReactNode;
    subtitle: string;
    icon?: string | React.ReactNode;
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
    // height ignorado en móvil — usamos min-h para que el contenido dicte la altura
    height = '6rem',
    children,
    actions,
}: ModuleHeaderProps) {
    return (
        <div
            className={`flex items-stretch justify-between ${gradient} rounded-2xl overflow-hidden shadow-sm border border-[var(--border-subtle)] mb-4 sm:mb-8 group transition-all duration-300 hover:shadow-md`}
            // En desktop respeta el height prop; en móvil se autoajusta al contenido
            style={{ minHeight: height }}
        >
            {/* ── Lado Izquierdo ── */}
            <div className="lateral-gradient-mask dark:!bg-[var(--bg-card)] pl-4 sm:pl-8 pr-8 sm:pr-16 md:pr-24 py-4 sm:py-7 flex flex-col justify-center w-fit max-w-[70%] min-w-0 z-10 transition-all duration-500">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {icon && (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-[var(--celeste-500)]/10 group-hover:text-[var(--celeste-500)] transition-all duration-500">
                            {typeof icon === 'string' ? (
                                <Icon name={icon} className="w-4 h-4 sm:w-5 sm:h-5 !stroke-[2.5px]" />
                            ) : (
                                icon
                            )}
                        </div>
                    )}
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight truncate min-w-0 text-[var(--text-primary)]">
                        {title}
                    </h1>
                </div>
                <p className="text-[var(--text-secondary)] text-xs sm:text-sm font-medium mt-1 truncate">
                    {subtitle}
                </p>
            </div>

            {/* ── Lado Derecho (actions) ── */}
            <div className="flex-shrink-0 flex items-center justify-end px-4 sm:px-10 relative">
                <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-20 flex items-center gap-3">
                    {actions}
                    {children}
                </div>
            </div>
        </div>
    );
}