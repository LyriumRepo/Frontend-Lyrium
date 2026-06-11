'use client';

import React, { useEffect, useState } from 'react';
import CustomerSidebar from '@/components/layout/customer/CustomerSidebar';
import CustomerHeader from '@/components/layout/customer/CustomerHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';
import { useAuth } from '@/shared/lib/context/AuthContext';
import Icon from '@/components/ui/Icon';

interface CustomerLayoutClientProps {
    children: React.ReactNode;
}

function BirthdayToast() {
    const { user } = useAuth();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!user?.birthday) return;

        const today = new Date();
        const bday = new Date(user.birthday);
        const isToday =
            today.getMonth() === bday.getMonth() &&
            today.getDate() === bday.getDate();

        if (!isToday) return;

        const key = `lyrium_bday_${today.getFullYear()}_${user.id}`;
        if (localStorage.getItem(key)) return;

        localStorage.setItem(key, '1');
        setVisible(true);

        const timer = setTimeout(() => setVisible(false), 6000);
        return () => clearTimeout(timer);
    }, [user]);

    if (!visible) return null;

    return (
        <div className="fixed bottom-24 right-6 z-[200] animate-fadeIn max-w-xs w-full">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-[2rem] p-5 shadow-2xl flex items-start gap-4">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-[var(--lima-500)] to-[var(--turquesa-500)] flex items-center justify-center text-xl shadow-md">
                    🎂
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[var(--text-primary)] leading-snug">
                        ¡Feliz cumpleaños, {user?.display_name?.split(' ')[0] ?? 'amigo'}!
                    </p>
                    <p className="text-[11px] font-bold text-[var(--text-secondary)] mt-0.5">
                        Lyrium celebra tu día especial contigo 🎉
                    </p>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="w-7 h-7 shrink-0 flex items-center justify-center rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                    <Icon name="X" className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export function CustomerLayoutClient({ children }: CustomerLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();

    return (
        <DashboardLayout
            header={<CustomerHeader onOpenMenu={toggleSidebar} />}
            sidebar={<CustomerSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-4 md:p-8 bg-[var(--bg-secondary)]"
        >
            {children}
            <BirthdayToast />
        </DashboardLayout>
    );
}
