'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { NavItem, NavSection } from '@/lib/types/navigation';

interface SmartSidebarProps {
    navigation: NavItem[] | NavSection[];
    user?: {
        name: string;
        role: string;
        avatar?: string;
    };
    brandColor?: 'sky' | 'violet' | 'indigo' | 'emerald' | 'amber';
    storageKey: string;
    sectionTitle?: string;
    footerLabel?: string;
    isMobileOpen?: boolean;
    onClose?: () => void;
}

const colorVariants = {
    sky: {
        border: 'border-sky-100 border-[var(--border-subtle)]',
        bgActive: 'bg-brand-gradient shadow-sky-100/50',
        textActive: 'text-sky-600 dark:text-sky-400',
        bgIcon: 'bg-sky-50 bg-[var(--bg-card)]',
        hover: 'hover:bg-sky-50/50 dark:hover:bg-[var(--bg-card)]',
        accent: 'text-sky-500 dark:text-sky-400',
        badge: 'bg-sky-400',
    },
    violet: {
        border: 'border-violet-100 border-[var(--border-subtle)]',
        bgActive: 'bg-brand-gradient shadow-violet-100/50',
        textActive: 'text-violet-600 dark:text-violet-400',
        bgIcon: 'bg-violet-50 bg-[var(--bg-card)]',
        hover: 'hover:bg-violet-50/50 dark:hover:bg-[var(--bg-card)]',
        accent: 'text-violet-500 dark:text-violet-400',
        badge: 'bg-violet-400',
    },
    indigo: {
        border: 'border-indigo-100 border-[var(--border-subtle)]',
        bgActive: 'bg-brand-gradient shadow-indigo-100/50',
        textActive: 'text-indigo-600 dark:text-indigo-400',
        bgIcon: 'bg-indigo-50 bg-[var(--bg-card)]',
        hover: 'hover:bg-indigo-50/50 dark:hover:bg-[var(--bg-card)]',
        accent: 'text-indigo-500 dark:text-indigo-400',
        badge: 'bg-indigo-400',
    },
    emerald: {
        border: 'border-emerald-100 border-[var(--border-subtle)]',
        bgActive: 'bg-brand-gradient shadow-emerald-100/50',
        textActive: 'text-emerald-600 dark:text-emerald-400',
        bgIcon: 'bg-emerald-50 bg-[var(--bg-card)]',
        hover: 'hover:bg-emerald-50/50 dark:hover:bg-[var(--bg-card)]',
        accent: 'text-emerald-500 dark:text-emerald-400',
        badge: 'bg-emerald-400',
    },
    amber: {
        border: 'border-amber-100 border-[var(--border-subtle)]',
        bgActive: 'bg-brand-gradient shadow-amber-100/50',
        textActive: 'text-amber-600 dark:text-amber-400',
        bgIcon: 'bg-amber-50 bg-[var(--bg-card)]',
        hover: 'hover:bg-amber-50/50 dark:hover:bg-[var(--bg-card)]',
        accent: 'text-amber-500 dark:text-amber-400',
        badge: 'bg-amber-400',
    }
};

export default function SmartSidebar({
    navigation,
    user,
    brandColor = 'sky',
    storageKey,
    sectionTitle = 'Gestión Administrativa',
    footerLabel = 'LYRIUM © 2025',
    isMobileOpen = false,
    onClose
}: SmartSidebarProps) {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const colors = useMemo(() => colorVariants[brandColor], [brandColor]);

    useEffect(() => {
        setIsMounted(true);
        const stored = localStorage.getItem(storageKey);
        if (stored) setIsExpanded(JSON.parse(stored));
    }, [storageKey]);

    const toggleSidebar = () => {
        const newState = !isExpanded;
        setIsExpanded(newState);
        localStorage.setItem(storageKey, JSON.stringify(newState));
    };

    const isActive = (href: string) => {
        if (href === '/admin' || href === '/logistics' || href === '/seller') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    // Renderizado optimizado para evitar saltos de hidratación
    if (!isMounted) return <aside className="w-20 lg:w-72 h-screen border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)]" />;

    return (
        <>
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[60] bg-[var(--bg-sidebar)] border-r ${colors.border} flex flex-col transition-all duration-500 ease-in-out
                    lg:sticky lg:top-0 lg:z-40 h-screen font-industrial
                    ${isExpanded ? 'lg:w-72' : 'lg:w-20'}
                    ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0 w-72 lg:w-auto'}
                `}
            >
                {/* 1. PERFIL DE USUARIO */}
                <div className={`p-4 border-b ${colors.border} bg-[var(--bg-sidebar)]/95 backdrop-blur flex items-center transition-all duration-500 ${(isExpanded || isMobileOpen) ? '' : 'justify-center px-2'}`}>
                    <div className="flex items-center space-x-3 w-full">
                        <div className="relative flex-shrink-0">
                            {user?.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt="User Profile"
                                    width={44}
                                    height={44}
                                    className={`rounded-xl border-2 ${colors.border} shadow-sm transition-all duration-500 ${(isExpanded || isMobileOpen) ? 'w-11 h-11' : 'w-10 h-10'}`}
                                />
                            ) : (
                                <div className={`rounded-xl border-2 ${colors.border} shadow-sm transition-all duration-500 bg-brand-gradient flex items-center justify-center text-white font-black ${(isExpanded || isMobileOpen) ? 'w-11 h-11 text-base' : 'w-10 h-10 text-sm'}`}>
                                    {user?.name?.substring(0, 2).toUpperCase() || 'LR'}
                                </div>
                            )}
                            <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full bg-emerald-400"></span>
                        </div>

                        {(isExpanded || isMobileOpen) && (
                            <div className="flex flex-col min-w-0 animate-fadeIn">
                                <p className="font-black text-xs text-[var(--text-primary)] leading-tight truncate uppercase tracking-tighter">
                                    {user?.name || "Marketplace User"}
                                </p>
                                <p className={`text-[9px] mt-0.5 uppercase font-black tracking-widest ${colors.accent}`}>
                                    {user?.role || "Acceso Premium"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. HEADER DE CONTROL */}
                <div className="flex items-center justify-between p-4 px-6 border-b border-[var(--border-subtle)] bg-[var(--bg-sidebar)]/20">
                    {(isExpanded || isMobileOpen) && (
                        <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] animate-fadeIn">
                            {sectionTitle}
                        </h2>
                    )}
                    <button onClick={toggleSidebar} className={`hidden lg:flex p-2 hover:bg-[var(--bg-hover)] ${colors.accent} rounded-xl transition-all duration-300 ${!isExpanded ? 'mx-auto' : ''}`}>
                        <Icon name="ChevronLeft" className={`transition-transform duration-500 ${!isExpanded ? 'rotate-180' : ''} w-4 h-4`} />
                    </button>
                    {/* Close button for mobile inside sidebar */}
                    {onClose && (
                        <button onClick={onClose} className="lg:hidden p-2 hover:bg-[var(--bg-hover)] ${colors.accent} rounded-xl transition-all duration-300">
                            <Icon name="X" className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* 3. NAVEGACIÓN MÓDULOS */}
                <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
                    <nav className="space-y-8 px-4">
                        {(Array.isArray(navigation) && typeof navigation[0] === 'object' && 'items' in navigation[0] ? (navigation as any[]) : [{ items: navigation }]).map((section, sidx) => (
                            <div key={sidx} className="space-y-1.5">
                                {(isExpanded || isMobileOpen) && (
                                    <div className="flex items-center gap-2 mb-4 px-2">
                                        <span className={`w-1.5 h-1.5 ${colors.badge} rounded-full`}></span>
                                        <h3 className={`text-[9px] font-black ${colors.accent}/80 uppercase tracking-[0.2em] truncate`}>
                                            {section.title || 'Navegación'}
                                        </h3>
                                    </div>
                                )}

                                {section.items.map((module: NavItem) => {
                                    const active = isActive(module.href);
                                    return (
                                        <Link
                                            key={module.href}
                                            href={module.href}
                                            className={`
                                                relative group block transition-all duration-500 overflow-hidden rounded-2xl mb-2
                                                ${active ? colors.bgActive : colors.hover}
                                            `}
                                        >
                                            <div className={`grid ${(isExpanded || isMobileOpen) ? 'grid-cols-[80%_20%]' : 'grid-cols-1'} items-center h-14 relative z-10 transition-all duration-500`}>
                                                <div className={`flex items-center h-full transition-all duration-500 ${active ? 'bg-[var(--bg-sidebar)] rounded-r-[80px] shadow-[10px_0_15px_-5px_rgba(0,0,0,0.05)]' : 'bg-transparent'}`}>
                                                    <div className={`flex items-center justify-center transition-all duration-500 ${(isExpanded || isMobileOpen) ? 'w-14' : 'w-20'}`}>
                                                        <div className={`
                                                            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
                                                            ${active ? `${colors.bgIcon} ${colors.textActive} shadow-inner` : `bg-[var(--bg-muted)] text-[var(--text-secondary)] group-hover:${colors.accent} group-hover:bg-[var(--bg-sidebar)]`}
                                                        `}>
                                                            <Icon name={module.icon || 'Package'} className="w-5 h-5" />
                                                        </div>
                                                    </div>

                                                    {(isExpanded || isMobileOpen) && (
                                                        <span className={`text-[13px] font-black whitespace-nowrap flex-1 transition-all duration-500 pr-4 ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`}>
                                                            {module.label}
                                                        </span>
                                                    )}
                                                </div>
                                                {active && (isExpanded || isMobileOpen) && (
                                                    <div className="flex justify-center items-center">
                                                        <div className="w-1.5 h-1.5 bg-[var(--bg-sidebar)] rounded-full animate-pulse" />
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* 4. FOOTER */}
                {(isExpanded || isMobileOpen) && (
                    <div className="mt-auto px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)]/30 animate-fadeIn">
                        <div className="flex items-center justify-between opacity-60">
                            <span className={`flex items-center gap-1.5 text-[10px] font-black ${colors.accent}`}>
                                <Icon name="Zap" className="w-3 h-3" />
                                <span>{footerLabel}</span>
                            </span>
                            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-widest">
                                v4.0 SPA
                            </span>
                        </div>
                    </div>
                )}
            </aside>

            {/* Backdrop for Mobile */}
            {isMobileOpen && (
                <div
                    role="button"
                    tabIndex={0}
                    aria-label="Cerrar menú"
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] lg:hidden animate-fadeIn cursor-default"
                    onClick={onClose}
                    onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
                />
            )}
        </>
    );
}
