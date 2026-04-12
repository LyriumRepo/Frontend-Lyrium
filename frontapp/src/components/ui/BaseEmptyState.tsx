import React from 'react';
import BaseButton from './BaseButton';
import Icon from './Icon';

interface BaseEmptyStateProps {
    title: string;
    description: string;
    icon?: string;
    actionLabel?: string;
    onAction?: () => void;
    suggestion?: string;
}

export default function BaseEmptyState({
    title,
    description,
    icon = 'Search',
    actionLabel,
    onAction,
    suggestion
}: BaseEmptyStateProps) {
    return (
        <div className="w-full py-24 flex flex-col items-center justify-center text-center px-6 bg-[var(--bg-card)] rounded-[3rem] border border-[var(--border-subtle)] shadow-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-secondary)]/50 to-transparent"></div>

            <div className="relative z-10 space-y-8 max-w-md">
                <div className="relative inline-block">
                    <div className="w-24 h-24 bg-[var(--bg-muted)] rounded-[2.5rem] flex items-center justify-center shadow-inner border border-[var(--border-subtle)] text-[var(--text-secondary)] group-hover:scale-110 group-hover:text-[var(--brand-sky)] transition-all duration-700 ease-out">
                        <Icon name={icon} className="w-12 h-12 stroke-[1.5px]" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-[var(--bg-card)] rounded-2xl shadow-lg border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)]">
                        <Icon name="Info" className="w-5 h-5" />
                    </div>
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                        {title}
                    </h3>
                    <p className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">
                        {description}
                    </p>
                </div>

                {suggestion && (
                    <div className="py-3 px-6 bg-[var(--brand-sky)]/10 rounded-2xl border border-[var(--brand-sky)]/20 inline-block">
                        <p className="text-[10px] font-black text-[var(--brand-sky)] uppercase tracking-tighter flex items-center justify-center">
                            <Icon name="Lightbulb" className="w-3.5 h-3.5 mr-2" /> TIP: {suggestion}
                        </p>
                    </div>
                )}

                {actionLabel && onAction && (
                    <div className="pt-4">
                        <BaseButton onClick={onAction} variant="primary" size="lg">
                            {actionLabel}
                        </BaseButton>
                    </div>
                )}
            </div>
        </div>
    );
}
