import React from 'react';
import Icon from '@/components/ui/Icon';

interface ModuleHeaderProps {
    title: string;
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
    return (
        <div
            className={`flex items-stretch justify-between ${gradient} rounded-2xl overflow-hidden shadow-sm border border-[var(--border-subtle)] mb-8 group transition-all duration-300 hover:shadow-md`}
            style={{ height }}
        >
            {/* Lado Izquierdo (Blanco Inteligente con Máscara) */}
            <div className="lateral-gradient-mask dark:!bg-[var(--bg-card)] pl-8 pr-16 md:pr-24 py-7 flex flex-col justify-center flex-none w-auto max-w-[90%] z-10 transition-all duration-500">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-secondary)] group-hover:bg-brand-sky/10 group-hover:text-brand-sky transition-all duration-500">
                            <Icon name={icon} className="w-5 h-5 !stroke-[2.5px]" />
                        </div>
                    )}
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight whitespace-nowrap text-[var(--text-primary)]">
                        {title}
                    </h1>
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-medium mt-1 truncate">
                    {subtitle}
                </p>
            </div>

            {/* Lado Derecho (Degradado dinámico con brillo) */}
            <div className="flex-1 flex items-center justify-end px-10 relative">
                <div className="absolute inset-0 bg-white/10 dark:bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative z-20 flex items-center gap-3">
                    {actions}
                    {children}
                </div>
            </div>
        </div>
    );
}
