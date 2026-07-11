'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/lib/context/AuthContext';
import SecuritySidebar from '@/components/layout/security/SecuritySidebar';
import SecurityHeader from '@/components/layout/security/SecurityHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';
import NotificationSidebar from '@/components/shared/notifications/NotificationSidebar';
import ChatBotWidget from '@/features/chatbot/components/ChatBotWidget';

interface SecurityLayoutClientProps {
    children: React.ReactNode;
}

export function SecurityLayoutClient({ children }: SecurityLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && (!user || (user.role !== 'security_admin' && user.role !== 'administrator'))) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user || (user.role !== 'security_admin' && user.role !== 'administrator')) {
        return null;
    }

    return (
        <DashboardLayout
            header={<SecurityHeader onOpenMenu={toggleSidebar} />}
            sidebar={<SecuritySidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-6 md:p-8"
        >
            {children}
            <NotificationSidebar />
            <ChatBotWidget />
        </DashboardLayout>
    );
}
