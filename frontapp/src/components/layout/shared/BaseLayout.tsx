'use client';

import React, { useEffect, ReactNode } from 'react';
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
    const isImmersiveHelpdeskRoute = pathname === '/admin/helpdesk' || pathname === '/seller/chat';

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

    // Immersive routes need body to have a definite height so the flex-1 chain
    // inside can resolve h-full / flex-1 correctly and enable internal scroll.
    useEffect(() => {
        if (!isImmersiveHelpdeskRoute) return;
        const prev = { overflow: document.body.style.overflow, height: document.body.style.height };
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100dvh';
        return () => {
            document.body.style.overflow = prev.overflow;
            document.body.style.height = prev.height;
        };
    }, [isImmersiveHelpdeskRoute]);

    // Lock body scroll when mobile sidebar is open to prevent background scrolling.
    useEffect(() => {
        if (!sidebarOpen) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [sidebarOpen]);

    return (
        <div className={`${isImmersiveHelpdeskRoute ? 'h-full' : 'min-h-screen'} ${className} flex flex-col`}>
            {header}
            <div className="relative mx-auto flex w-full max-w-[1920px] flex-1 min-h-0">
                {sidebar}
                <main className={`flex flex-col flex-1 min-h-0 overflow-x-hidden ${isImmersiveHelpdeskRoute ? 'overflow-y-hidden !p-0' : ''} ${mainClassName}`}>
                    <div className={`animate-fadeIn ${isImmersiveHelpdeskRoute ? 'flex flex-col flex-1 min-h-0' : 'h-full min-h-0'}`}>
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
