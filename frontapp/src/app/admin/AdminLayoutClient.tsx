'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/admin/AdminSidebar';
import AdminHeader from '@/components/layout/admin/AdminHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';

interface AdminLayoutClientProps {
    children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

    return (
        <DashboardLayout
            header={<AdminHeader onOpenMenu={toggleSidebar} />}
            sidebar={<AdminSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-6 md:p-8"
        >
            {children}
        </DashboardLayout>
    );
}
