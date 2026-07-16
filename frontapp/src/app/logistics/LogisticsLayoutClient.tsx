'use client';

import React from 'react';
import LogisticsSidebar from '@/components/layout/logistics/LogisticsSidebar';
import LogisticsHeader from '@/components/layout/logistics/LogisticsHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';

interface LogisticsLayoutClientProps {
    children: React.ReactNode;
}

export function LogisticsLayoutClient({ children }: LogisticsLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

    return (
        <DashboardLayout
            header={<LogisticsHeader onOpenMenu={toggleSidebar} />}
            sidebar={<LogisticsSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-6 md:p-8"
        >
            {children}
        </DashboardLayout>
    );
}
