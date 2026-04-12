'use client';

import React from 'react';
import CustomerSidebar from '@/components/layout/customer/CustomerSidebar';
import CustomerHeader from '@/components/layout/customer/CustomerHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';

interface CustomerLayoutClientProps {
    children: React.ReactNode;
}

export function CustomerLayoutClient({ children }: CustomerLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

    return (
        <DashboardLayout
            header={<CustomerHeader onOpenMenu={toggleSidebar} />}
            sidebar={<CustomerSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-gray-50 dark:bg-[var(--bg-primary)]"
            mainClassName="p-4 md:p-8 bg-gray-50 dark:bg-[var(--bg-primary)]"
        >
            {children}
        </DashboardLayout>
    );
}
