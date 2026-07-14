'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/layout/admin/AdminSidebar';
import AdminHeader from '@/components/layout/admin/AdminHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/shared/hooks/useAuth';
import NotificationSidebar from '@/components/shared/notifications/NotificationSidebar';
import ChatBotWidget from '@/features/chatbot/components/ChatBotWidget';

interface AdminLayoutClientProps {
    children: React.ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <DashboardLayout
            header={<AdminHeader onOpenMenu={toggleSidebar} />}
            sidebar={<AdminSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-3 sm:p-5 md:p-6 lg:p-8"
        >
            {children}
            <NotificationSidebar />
            <ChatBotWidget />
        </DashboardLayout>
    );
}
