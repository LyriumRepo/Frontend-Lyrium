'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useEcho } from '@laravel/echo-react';
import ThemeToggle from '@/components/layout/shared/ThemeToggle';
import NotificationBell from '@/components/layout/shared/NotificationBell';
import UserMenu from '@/components/layout/shared/UserMenu';
import Breadcrumb from '@/components/layout/shared/Breadcrumb';
import { useAutoBreadcrumb } from '@/shared/hooks/useAutoBreadcrumb';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { orderApi } from '@/shared/lib/api/orderRepository';
import { Menu, Home } from 'lucide-react';
import { ROUTES } from '@/shared/lib/constants/routes';

export default function CustomerHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
    const breadcrumbs = useAutoBreadcrumb();
    const { user } = useAuth();
    const [activeCount, setActiveCount] = useState<number | null>(null);

    const fetchCount = useCallback(async () => {
        try {
            const count = await orderApi.getActiveCount();
            setActiveCount(count);
        } catch {
            setActiveCount(null);
        }
    }, []);

    useEffect(() => {
        fetchCount();
        const interval = setInterval(fetchCount, 30000);
        return () => clearInterval(interval);
    }, [fetchCount]);

    useEcho<{ order_id: string; status: string; active: boolean }>(
        `user.${user?.id ?? 0}`,
        'OrderStatusChanged',
        () => { fetchCount(); },
        [user, fetchCount],
    );

    return (
        <header className="h-16 bg-white dark:bg-[var(--bg-secondary)] border-b border-gray-200 dark:border-[var(--border-subtle)] sticky top-0 z-50">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenMenu}
                        className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-card)] transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* Volver al Home público — solo en mobile, la sidebar ya cubre esto en desktop */}
                    <Link
                        href={ROUTES.HOME}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-card)] transition-colors"
                        aria-label="Ir al inicio"
                        title="Ir al inicio"
                    >
                        <Home className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </Link>
                    <span className="hidden md:inline-block px-3 py-1 bg-sky-500 dark:bg-[var(--bg-secondary)] text-white dark:text-[var(--brand-green)] dark:border dark:border-[var(--border-default)] text-xs font-bold uppercase rounded-full whitespace-nowrap">
                        Mi Panel de Usuario
                    </span>
                    <div className="hidden sm:block">
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="h-6 w-px bg-gray-200 dark:bg-[var(--border-subtle)]" />
                        <div className="text-sm">
                            <span className="text-gray-400 dark:text-gray-500 font-bold uppercase text-[10px] tracking-widest">Pedidos Activos: </span>
                            <span className="font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">
                                {activeCount === null ? (
                                    <span className="inline-block w-5 h-4 bg-gray-200 dark:bg-[var(--bg-muted)] rounded animate-pulse align-middle" />
                                ) : (
                                    activeCount
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-[var(--border-subtle)] mx-2 hidden sm:block" />
                    <ThemeToggle />
                    <NotificationBell />
                    <div className="h-8 w-px bg-gray-200 dark:bg-[var(--border-subtle)] mx-2" />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
