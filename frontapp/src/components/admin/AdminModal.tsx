'use client';

import React from 'react';
import BaseModal from '@/components/ui/BaseModal';
import Icon from '@/components/ui/Icon';

interface AdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    icon?: string;
    iconColor?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
    footer?: React.ReactNode;
    className?: string;
}

export default function AdminModal({
    isOpen,
    onClose,
    title,
    subtitle,
    icon,
    iconColor,
    children,
    size = 'md',
    footer,
    className = '',
}: AdminModalProps) {
    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            subtitle={subtitle}
            size={size}
            className={className}
            footer={footer}
        >
            {icon && (
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                            backgroundColor: iconColor ? `${iconColor}1A` : 'var(--bg-secondary)',
                            color: iconColor || 'var(--text-secondary)',
                        }}
                    >
                        <Icon name={icon} className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-[var(--text-primary)]">{title}</h3>
                        {subtitle && (
                            <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
                        )}
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {children}
            </div>
        </BaseModal>
    );
}
