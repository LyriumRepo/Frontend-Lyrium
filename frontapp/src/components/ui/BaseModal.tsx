'use client';

import React, { useId } from 'react';
import ModalPortal from '@/components/ModalPortal';
import Icon from '@/components/ui/Icon';

interface BaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full';
    showCloseButton?: boolean;
    accentColor?: string;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-2xl',
    '2xl': 'max-w-3xl',
    '4xl': 'max-w-5xl',
    full: 'max-w-[95vw] h-[90vh]'
};

export default function BaseModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    size = 'xl',
    showCloseButton = true,
    accentColor = 'from-sky-400 to-indigo-400'
}: BaseModalProps) {
    const titleId = useId();
    const subtitleId = useId();

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className={`absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300 ease-out cursor-default
                        ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                    aria-hidden="true"
                ></div>

                {/* Content Card */}
                <div
                    className={`bg-[var(--bg-card)] w-full ${sizeClasses[size]} max-h-[85vh] rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden transition-all duration-300 ease-out border border-[var(--border-subtle)] flex flex-col
                        ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={title ? titleId : undefined}
                    aria-describedby={subtitle ? subtitleId : undefined}
                >
                    {/* Top Accent Decorator */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${accentColor}`}></div>

                    {/* Header */}
                    {(title || subtitle || showCloseButton) && (
                        <div className="p-6 md:p-8 pb-4 flex justify-between items-start bg-[var(--bg-card)]/50 backdrop-blur-sm sticky top-0 z-20 border-b border-[var(--border-subtle)]/50">
                            <div className="flex-1 min-w-0 pr-4">
                                {title && (
                                    <h2 id={titleId} className="text-2xl md:text-3xl font-black text-[var(--text-primary)] tracking-tighter leading-none truncate">
                                        {title}
                                    </h2>
                                )}
                                {subtitle && (
                                    <p id={subtitleId} className="text-[9px] md:text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mt-2 px-0.5 truncate">
                                        {subtitle}
                                    </p>
                                )}
                            </div>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 md:w-12 md:h-12 bg-[var(--bg-muted)] text-[var(--text-secondary)] rounded-2xl md:rounded-[1.25rem] flex items-center justify-center hover:bg-[var(--bg-danger)] hover:text-[var(--text-danger)] transition-all duration-300 active:scale-90 group border border-[var(--border-subtle)]/50 shadow-sm shrink-0"
                                    aria-label="Cerrar modal"
                                >
                                    <Icon name="X" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4 md:pt-4">
                        {children}
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
