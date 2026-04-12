'use client';

import ThemeToggle from '@/components/layout/shared/ThemeToggle';
import NotificationBell from '@/components/layout/shared/NotificationBell';
import UserMenu from '@/components/layout/shared/UserMenu';
import Breadcrumb from '@/components/layout/shared/Breadcrumb';
import { useAutoBreadcrumb } from '@/shared/hooks/useAutoBreadcrumb';
import { Menu } from 'lucide-react';

export default function CustomerHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
    const breadcrumbs = useAutoBreadcrumb();

    return (
        <header className="h-16 bg-white dark:bg-[var(--bg-secondary)] border-b border-sky-100 dark:border-[var(--border-subtle)] sticky top-0 z-50">
            <div className="h-full px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onOpenMenu}
                        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#182420] transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    </button>
                    <span className="hidden md:inline-block px-3 py-1 bg-sky-500 text-white text-xs font-bold uppercase rounded-full whitespace-nowrap">
                        Mi Panel de Cliente
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
                            <span className="font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">0</span>
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
