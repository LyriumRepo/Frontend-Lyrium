'use client';

import ThemeToggle from '@/components/layout/shared/ThemeToggle';
import NotificationBell from '@/components/layout/shared/NotificationBell';
import UserMenu from '@/components/layout/shared/UserMenu';
import Breadcrumb from '@/components/layout/shared/Breadcrumb';
import { useAutoBreadcrumb } from '@/shared/hooks/useAutoBreadcrumb';
import { useApiConnection, ConnectionStatusPanel } from '@/shared/hooks/useApiConnection';

import { Menu } from 'lucide-react';

export default function SellerHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
    const breadcrumbs = useAutoBreadcrumb();
    const { status, checkConnection, isHealthy, showLaravel } = useApiConnection();

    return (
        <header className="h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] sticky top-0 z-50">
            <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
                {/* Left: Panel Indicator + Breadcrumb */}
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    <button
                        onClick={onOpenMenu}
                        className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-6 h-6 text-[var(--text-secondary)]" />
                    </button>
                    <span className="hidden md:inline-block px-3 py-1 bg-sky-500 text-white text-xs font-bold uppercase rounded-full whitespace-nowrap">
                        Mi Panel del Vendedor
                    </span>
                    <div className="hidden sm:block">
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                </div>

                {/* Right: Connection Status + Quick Stats + Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4">
                    {/* Connection Status */}
                    <div className="hidden sm:block">
                        <ConnectionStatusPanel status={status} onRefresh={checkConnection} showLaravel={showLaravel} />
                    </div>

                    {/* Connection Health Indicator */}
                    <div className={`hidden lg:flex items-center gap-2 px-2 py-1 rounded-full ${isHealthy ? 'bg-emerald-50 dark:bg-[var(--bg-card)]' : 'bg-red-50 dark:bg-red-900/20'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${isHealthy ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={`text-[10px] font-bold uppercase ${isHealthy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                            {isHealthy ? 'API Activa' : 'API Offline'}
                        </span>
                    </div>

                    <div className="hidden lg:block h-6 w-px bg-gray-200 dark:bg-[var(--border-subtle)]" />

                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-sm">
                            <span className="text-gray-400 dark:text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-widest">Ventas del Mes: </span>
                            <span className="font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">S/ 4,560.00</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-gray-400 dark:text-[var(--text-secondary)] font-bold uppercase text-[10px] tracking-widest">Pedidos Hoy: </span>
                            <span className="font-black text-gray-900 dark:text-[var(--text-primary)] tracking-tight">08</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-200 dark:bg-[var(--border-subtle)] mx-2 hidden sm:block" />
                    <div className="hidden sm:block">
                        <ThemeToggle />
                    </div>
                    <NotificationBell />
                    <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-[var(--border-subtle)] mx-2" />
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}
