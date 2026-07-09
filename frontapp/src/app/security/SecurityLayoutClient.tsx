'use client';

import React from 'react';
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
