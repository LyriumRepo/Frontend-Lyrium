'use client';

import React, { useId } from 'react';
import ModalPortal from '@/components/ModalPortal';
import Icon from '@/components/ui/Icon';

interface BaseDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    width?: string;
    accentColor?: string;
    badge?: string;
}

export default function BaseDrawer({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    width = 'md:w-[600px]',
    accentColor = 'from-sky-500/10 via-indigo-500/5',
    badge
}: BaseDrawerProps) {
    const titleId = useId();
    const subtitleId = useId();

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex justify-end overflow-hidden">
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-500 ease-in-out cursor-default
                        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={onClose}
                    aria-hidden="true"
                ></div>

                {/* Drawer Content */}
                <div 
                    className={`relative h-full bg-[var(--bg-card)] shadow-[-40px_0_80px_-20px_rgba(0,0,0,0.15)] dark:shadow-[-40px_0_80px_-20px_rgba(0,0,0,0.5)] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) flex flex-col w-full ${width}
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? titleId : undefined}
                    aria-describedby={subtitle ? subtitleId : undefined}
                >

                    {/* Header Ambient Background */}
                    <div className={`absolute top-0 left-0 right-0 h-64 bg-gradient-to-br ${accentColor} to-transparent -z-10 blur-3xl opacity-60`}></div>

                    {/* Header */}
                    <div className="p-10 flex items-center justify-between border-b border-[var(--border-subtle)]/50 backdrop-blur-2xl bg-[var(--bg-card)]/30 sticky top-0 z-20">
                        <div className="flex-1 min-w-0 pr-4">
                            {badge && (
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-black text-[var(--brand-sky)] uppercase tracking-widest border border-[var(--brand-sky)]/20 rounded-lg bg-[var(--brand-sky)]/10 shadow-sm">
                                        {badge}
                                    </span>
                                </div>
                            )}
                            {title && (
                                <h2 id={titleId} className="text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none truncate">
                                    {title}
                                </h2>
                            )}
                            {subtitle && (
                                <p id={subtitleId} className="text-xs text-[var(--text-secondary)] font-bold mt-3 uppercase tracking-widest flex items-center gap-2">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="w-14 h-14 flex items-center justify-center bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem] shadow-xl hover:bg-[var(--bg-danger)] hover:text-[var(--text-danger)] hover:border-[var(--color-error)]/20 transition-all active:scale-90 group shrink-0"
                            aria-label="Cerrar drawer"
                        >
                            <Icon name="X" className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                        </button>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10">
                        {children}
                    </div>

                    {/* Footer Actions */}
                    {footer && (
                        <div className="p-2 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/80 backdrop-blur-xl flex gap-4 relative z-20">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </ModalPortal>
    );
}
