'use client';

import React from 'react';
import BaseLayout from '@/components/layout/shared/BaseLayout';

interface DashboardLayoutProps {
    children: React.ReactNode;
    header: React.ReactNode;
    sidebar: React.ReactNode;
    sidebarOpen?: boolean;
    onSidebarClose?: () => void;
    className?: string;
    mainClassName?: string;
}

export function DashboardLayout({ 
    children, 
    header, 
    sidebar,
    sidebarOpen = false,
    onSidebarClose = () => {},
    className = 'bg-[var(--bg-secondary)]',
    mainClassName = 'p-6 md:p-8'
}: DashboardLayoutProps) {
    return (
        <BaseLayout
            header={header}
            sidebar={sidebar}
            sidebarOpen={sidebarOpen}
            onSidebarClose={onSidebarClose}
            className={className}
            mainClassName={mainClassName}
        >
            {children}
        </BaseLayout>
    );
}
