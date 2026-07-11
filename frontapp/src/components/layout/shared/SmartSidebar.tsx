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
    badges?: Record<string, number>;
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
        textActive: 'text-sky-600 dark:text-lime-500',
        bgIcon: 'bg-sky-50 bg-[var(--bg-card)]',
        hover: 'hover:bg-sky-50/50 dark:hover:bg-[var(--bg-card)]',
        accent: 'text-sky-500 dark:text-[var(--icons-green)]',
        badge: 'bg-sky-400 dark:bg-lime-400',
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
    badges = {},
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

    // Aplana todos los hrefs del navigation para comparar entre sí
    const allNavHrefs = useMemo(() => {
        const sections = (Array.isArray(navigation) && typeof navigation[0] === 'object' && 'items' in navigation[0])
            ? (navigation as any[])
            : [{ items: navigation }];
        return sections.flatMap((s: any) => s.items.map((item: NavItem) => item.href));
    }, [navigation]);

    const isActive = (href: string) => {
        // Coincidencia exacta siempre gana
        if (pathname === href) return true;
        // Prefix-match: exigir que continúe con '/' para no activar segmentos parciales
        if (!pathname.startsWith(href + '/')) return false;
        // No activar si hay un sibling con match más específico para este pathname
        const hasSiblingMatch = allNavHrefs.some(
            (otherHref) => otherHref !== href && pathname.startsWith(otherHref)
        );
        return !hasSiblingMatch;
    };

    // Renderizado optimizado para evitar saltos de hidratación
    if (!isMounted) return <aside className="hidden md:block md:w-16 lg:w-72 h-[100dvh] border-r border-[var(--border-subtle)] bg-[var(--bg-sidebar)]" />;

    return (
        <>
            <aside
                className={`
                    fixed inset-y-0 left-0 z-[60] bg-[var(--bg-sidebar)] border-r ${colors.border} flex flex-col transition-all duration-500 ease-in-out
                    md:sticky md:top-0 md:z-40 lg:sticky lg:top-0 lg:z-40 h-[100dvh] font-industrial
                    ${isExpanded ? 'lg:w-72' : 'lg:w-20'}
                    ${isMobileOpen ? 'translate-x-0 w-72 md:w-16' : '-translate-x-full md:translate-x-0 md:w-16 lg:translate-x-0 w-72 lg:w-auto'}
                `}
            >
                {/* 1. PERFIL DE USUARIO */}
                <div className={`p-4 border-b ${colors.border} bg-[var(--bg-sidebar)]/95 backdrop-blur flex items-center transition-all duration-500 md:justify-center md:px-2 ${(isExpanded || isMobileOpen) ? 'lg:justify-start lg:px-4' : 'justify-center px-2'}`}>
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
                            <div className="flex flex-col min-w-0 animate-fadeIn md:hidden lg:flex">
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
                        <h2 className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] animate-fadeIn md:hidden lg:block">
                            {sectionTitle}
                        </h2>
                    )}
                    <button onClick={toggleSidebar} className={`hidden lg:flex p-2 hover:bg-[var(--bg-hover)] ${colors.accent} rounded-xl transition-all duration-300 ${!isExpanded ? 'mx-auto' : ''}`}>
                        <Icon name="ChevronLeft" className={`transition-transform duration-500 ${!isExpanded ? 'rotate-180' : ''} w-4 h-4`} />
                    </button>
                    {/* Close button for mobile inside sidebar */}
                    {onClose && (
                        <button onClick={onClose} className={`md:hidden p-2 hover:bg-[var(--bg-hover)] ${colors.accent} rounded-xl transition-all duration-300`}>
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
                                    <div className="flex items-center gap-2 mb-4 px-2 md:hidden lg:flex">
                                        <span className={`w-1.5 h-1.5 ${colors.badge} rounded-full`}></span>
                                        <h3 className={`text-[9px] font-black text-[var(--brand-green)] uppercase tracking-[0.2em] truncate`}>
                                            {section.title || 'Navegación'}
                                        </h3>
                                    </div>
                                )}

                                {section.items.map((module: NavItem) => {
                                    const active     = isActive(module.href);
                                    const badgeCount = (module.id ? badges[module.id] : 0) ?? 0;
                                    return (
                                        <Link
                                            key={module.href}
                                            href={module.href}
                                            data-tour={module.id ? `nav-${module.id}` : undefined}
                                            className={`
                                                relative group block transition-all duration-500 overflow-hidden rounded-2xl mb-2
                                                ${active ? colors.bgActive : colors.hover}
                                            `}
                                        >
                                            <div className={`grid grid-cols-1 ${(isExpanded || isMobileOpen) ? 'lg:grid-cols-[80%_20%]' : ''} items-center h-14 relative z-10 transition-all duration-500`}>
                                                <div className={`flex items-center h-full transition-all duration-500 ${active ? 'bg-[var(--bg-sidebar)] rounded-r-[80px] shadow-[10px_0_15px_-5px_rgba(0,0,0,0.05)]' : 'bg-transparent'}`}>
                                                    <div className={`flex items-center justify-center transition-all duration-500 ${isMobileOpen ? 'w-14' : 'w-full'} md:w-full ${(isExpanded || isMobileOpen) ? 'lg:w-14' : 'lg:w-20'}`}>
                                                        <div className={`
                                                            relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
                                                            ${active ? `${colors.bgIcon} ${colors.textActive} shadow-inner` : `bg-[var(--bg-muted)] text-[var(--text-secondary)] group-hover:text-[var(--brand-green)] group-hover:bg-[var(--bg-sidebar)]`}
                                                        `}>
                                                            <Icon name={module.icon || 'Package'} className="w-5 h-5" />
                                                            {badgeCount > 0 && (
                                                                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--brand-green)] text-white text-[8px] font-black leading-none">
                                                                    {badgeCount > 99 ? '99+' : badgeCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {(isExpanded || isMobileOpen) && (
                                                        <span title={active ? module.label : ""} className={`text-[13px] font-black whitespace-nowrap transition-all duration-300 md:hidden lg:inline ${active
                                                        ? 'max-w-[140px] overflow-hidden text-ellipsis text-[var(--text-primary)]'
                                                        : 'flex-shrink-0 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]' }`} > {module.label}
                                                    </span>
                                                    )}
                                                </div>
                                                {/* Punto parpadeante — desktop (columna 2 del grid) */}
                                                {active && (isExpanded || isMobileOpen) && (
                                                    <div className="hidden lg:flex justify-center items-center">
                                                        <div className="w-1.5 h-1.5 bg-[var(--bg-sidebar)] dark:bg-[var(--text-primary)] rounded-full animate-ping" />
                                                    </div>
                                                )}
                                                {/* Punto parpadeante — móvil (posición absoluta derecha) */}
                                                {active && isMobileOpen && (
                                                    <div className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                                        <div className="w-2 h-2 bg-[var(--brand-green)] rounded-full animate-ping opacity-80" />
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
                    <div className="mt-auto px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-sidebar)]/30 animate-fadeIn md:hidden lg:flex flex-col">
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
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden animate-fadeIn cursor-default"
                    onClick={onClose}
                    onKeyDown={(e) => e.key === 'Escape' && onClose?.()}
                />
            )}
        </>
    );
}