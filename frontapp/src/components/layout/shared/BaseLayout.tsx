'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Footer from '@/components/layout/shared/Footer';

interface BaseLayoutProps {
    children: ReactNode;
    header: ReactNode;
    sidebar: ReactNode;
    sidebarOpen: boolean;
    onSidebarClose: () => void;
    className?: string;
    mainClassName?: string;
}

export default function BaseLayout({
    children,
    header,
    sidebar,
    sidebarOpen,
    onSidebarClose,
    className = 'bg-[var(--bg-secondary)]',
    mainClassName = 'p-6 md:p-8'
}: BaseLayoutProps) {
    const pathname = usePathname();
    const isImmersiveHelpdeskRoute = pathname === '/seller/help' || pathname === '/admin/helpdesk';

    useEffect(() => {
        onSidebarClose();
    }, [pathname, onSidebarClose]);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onSidebarClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onSidebarClose]);

    return (
        <div className={`min-h-screen ${className} flex flex-col`}>
            {header}
            <div className="relative mx-auto flex w-full max-w-[1920px] flex-1 min-h-0">
                {sidebar}
                <main className={`flex-1 min-h-0 overflow-x-hidden ${isImmersiveHelpdeskRoute ? 'overflow-y-hidden' : ''} ${mainClassName}`}>
                    <div className="h-full min-h-0 animate-fadeIn">
                        {children}
                    </div>
                </main>
            </div>
            {isImmersiveHelpdeskRoute ? (
                <div className="hidden md:block">
                    <Footer />
                </div>
            ) : (
                <Footer />
            )}
        </div>
    );
}
