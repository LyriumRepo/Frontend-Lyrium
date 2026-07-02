'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import ThemeToggle from '@/components/layout/shared/ThemeToggle';
import TopBanner from './TopBanner';
import DesktopNav from './DesktopNav';
import MobileMenu from './MobileMenu';
import { menuItems as fallbackMenuItems, megaMenuData as fallbackMegaMenuData, type MenuItem } from '@/data/menuData';
import { useMegaMenu } from '@/shared/hooks/useMegaMenu';
import { useCarritoStore } from '@/store/carritoStore';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { AUTH_CONFIG } from '@/shared/lib/config/auth';
import LogoLyrium from '@/components/LogoLyrium';

export default function PublicHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeMobileMegaMenuItem, setActiveMobileMegaMenuItem] = useState<MenuItem | null>(null);
    const [activeMobileCategory, setActiveMobileCategory] = useState<string>('');
    const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});
    const cartItemCount = useCarritoStore((s) => s.cartItems.reduce((sum, i) => sum + Number(i.cantidad ?? 0), 0));
    const { menuItems: apiMenuItems, megaMenuData: apiMegaMenuData, hasData } = useMegaMenu();
    const { user, isAuthenticated } = useAuth();
    const dashboardUrl = isAuthenticated && user?.role
        ? (AUTH_CONFIG.routes[user.role as keyof typeof AUTH_CONFIG.routes] ?? '/login')
        : '/login';

    const handleMobileMegaMenuOpen = (item: MenuItem) => {
        setActiveMobileMegaMenuItem(item);
        if (item.children && item.children.length > 0) {
            setActiveMobileCategory(item.children[0].label);
        }
    };

    const toggleColumn = (key: string) => {
        setExpandedCols(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const staticItems = fallbackMenuItems.filter(item => !item.children);
    const menuItems = hasData ? [...apiMenuItems, ...staticItems] : fallbackMenuItems;
    const megaMenuData = hasData ? apiMegaMenuData : fallbackMegaMenuData;

    return (
        <>
            <TopBanner />
            <header className="bg-white dark:bg-[var(--bg-secondary)] shadow-md dark:shadow-none sticky top-0 z-50 border-b border-gray-100 dark:border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-3 md:px-4 py-3 gap-2 md:gap-6">
                    <Link href="/" className="flex items-center gap-2 group relative">
                        <LogoLyrium
                            frontImg="/img/iconologo.png"
                            sideImg="/img/nombrelogo.png"
                        />
                    </Link>

                    <div className="flex lg:hidden items-center gap-1 sm:gap-2 ml-auto">
                        <Link
                            href="/productos"
                            onClick={(e) => {
                                const item = menuItems.find(x => x.label?.toUpperCase() === 'PRODUCTOS');
                                if (item) {
                                    e.preventDefault();
                                    handleMobileMegaMenuOpen(item);
                                }
                            }}
                            className="flex items-center gap-1 px-2 py-1 min-[360px]:px-2.5 min-[360px]:py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/30 text-sky-600 dark:text-[var(--color-success)] text-[10px] min-[360px]:text-[11px] font-black uppercase tracking-wider hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-all duration-200"
                        >
                            <Icon name="ShoppingBag" className="text-[11px] min-[360px]:text-[12px]" />
                            <span>Productos</span>
                        </Link>
                        <Link
                            href="/servicios"
                            onClick={(e) => {
                                const item = menuItems.find(x => x.label?.toUpperCase() === 'SERVICIOS');
                                if (item) {
                                    e.preventDefault();
                                    handleMobileMegaMenuOpen(item);
                                }
                            }}
                            className="flex items-center gap-1 px-2 py-1 min-[360px]:px-2.5 min-[360px]:py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/30 text-sky-600 dark:text-[var(--color-success)] text-[10px] min-[360px]:text-[11px] font-black uppercase tracking-wider hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-all duration-200"
                        >
                            <Icon name="Headset" className="text-[11px] min-[360px]:text-[12px]" />
                            <span>Servicios</span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-5 text-xs lg:text-[13px] text-sky-600 dark:text-[var(--color-success)]">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Icon name="UserCircle" className="text-[18px]" />
                                        <span className="whitespace-nowrap truncate max-w-[110px]">
                                            {user.display_name || user.username || user.email}
                                        </span>
                                    </span>
                                    <div className="relative group">
                                        <Link href={dashboardUrl} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center">
                                            <Icon name="LayoutDashboard" className="text-[18px]" />
                                        </Link>
                                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#333333] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                            Mi panel
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative group">
                                    <Link href="/login" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center">
                                        <Icon name="UserCircle" className="text-[18px]" />
                                    </Link>
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#333333] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                        Iniciar sesión
                                    </span>
                                </div>
                            )}

                            <div className="relative group">
                                <Link href="/carrito" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center">
                                    <Icon name="ShoppingCart" className="text-[18px]" />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[11px] rounded-full px-1.5 py-0.5">
                                            {cartItemCount}
                                        </span>
                                    )}
                                </Link>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#333333] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                    Carrito
                                </span>
                            </div>

                            <ThemeToggle />
                        </div>

                        {/* Hamburger button (mobile/tablet) */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden text-3xl text-sky-600 dark:text-[var(--color-success)]"
                            aria-label="Menú"
                        >
                            <Icon name="Menu" />
                        </button>
                    </div>
                </div>

                <DesktopNav menuItems={menuItems} megaMenuData={megaMenuData} />
            </header>

            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                menuItems={menuItems}
                isAuthenticated={isAuthenticated}
                user={user}
                dashboardUrl={dashboardUrl}
            />

            {activeMobileMegaMenuItem && (
                <div className="fixed inset-0 bg-white dark:bg-[var(--bg-secondary)] z-[99999] flex flex-col font-[Outfit,sans-serif]">
                    <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)] flex-shrink-0">
                        <button
                            onClick={() => setActiveMobileMegaMenuItem(null)}
                            className="flex items-center gap-1.5 text-sky-600 dark:text-[var(--color-success)] text-sm font-bold"
                        >
                            <Icon name="ChevronLeft" className="text-lg" />
                            <span>Atrás</span>
                        </button>
                        <span className="font-extrabold text-[13px] tracking-widest text-slate-800 dark:text-[var(--text-primary)] uppercase">
                            {activeMobileMegaMenuItem.label}
                        </span>
                        <button
                            onClick={() => setActiveMobileMegaMenuItem(null)}
                            className="text-slate-400 hover:text-slate-600 p-1"
                        >
                            <Icon name="X" className="text-xl" />
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {activeMobileMegaMenuItem.children && (
                            <aside className="w-[30%] max-w-[110px] min-w-[85px] bg-gray-50 dark:bg-[var(--bg-muted)] border-r border-gray-200 dark:border-[var(--border-subtle)] overflow-y-auto h-full flex-shrink-0">
                                <ul className="flex flex-col">
                                    {activeMobileMegaMenuItem.children.map((child) => {
                                        const isActive = activeMobileCategory === child.label;
                                        const activeBg = activeMobileMegaMenuItem.label?.toLowerCase() === 'servicios' ? 'bg-[#78e69d]' : 'bg-[#bde90d]';
                                        return (
                                            <li key={child.label}>
                                                <button
                                                    onClick={() => setActiveMobileCategory(child.label)}
                                                    className={`w-full text-left px-2.5 py-3.5 text-[10px] leading-tight font-black uppercase tracking-wider transition-all border-b border-gray-200/50 dark:border-sky-900/10 ${
                                                        isActive
                                                            ? `${activeBg} text-white shadow-sm`
                                                            : 'text-slate-700 dark:text-[var(--text-primary)] hover:bg-gray-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    {child.label}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </aside>
                        )}

                        <div className="flex-1 overflow-y-auto p-3.5 space-y-5 bg-white dark:bg-[var(--bg-secondary)] h-full">
                            {(() => {
                                const megaData = megaMenuData[activeMobileCategory] || Object.values(megaMenuData)[0];
                                if (!megaData) return null;

                                const circleColors = [
                                    'hover:text-[#B7E000]',
                                    'hover:text-[#8FD400]',
                                    'hover:text-[#66D6A8]',
                                    'hover:text-[#4EC7B8]',
                                    'hover:text-[#69BEEB]',
                                    'hover:text-[#5AAFE6]',
                                ];
                                const textHoverColors = [
                                    'group-hover:text-[#B7E000]',
                                    'group-hover:text-[#8FD400]',
                                    'group-hover:text-[#66D6A8]',
                                    'group-hover:text-[#4EC7B8]',
                                    'group-hover:text-[#69BEEB]',
                                    'group-hover:text-[#5AAFE6]',
                                ];

                                return (
                                    <>
                                        <div>
                                            <h3 className="text-[12px] font-bold text-slate-800 dark:text-[var(--text-primary)] uppercase tracking-wider mb-3">
                                                Comprar por categoría
                                            </h3>
                                            <div className="grid grid-cols-3 gap-2.5">
                                                {megaData.icons && megaData.icons.map((icon, idx) => (
                                                    <Link
                                                        key={icon.title}
                                                        href={icon.href}
                                                        onClick={() => setActiveMobileMegaMenuItem(null)}
                                                        className="group flex flex-col items-center text-center"
                                                    >
                                                        <div className={`w-16 h-16 rounded-full border border-gray-200 dark:border-sky-900/30 flex items-center justify-center shadow-sm overflow-hidden bg-white dark:bg-[var(--bg-secondary)] ${circleColors[idx % circleColors.length]}`}>
                                                            <Image
                                                                src={icon.img}
                                                                alt={icon.title}
                                                                width={64}
                                                                height={64}
                                                                className="w-full h-full object-contain scale-125"
                                                            />
                                                        </div>
                                                        <span className={`mt-1.5 text-[9px] leading-tight font-extrabold text-slate-700 dark:text-[var(--text-primary)] transition ${textHoverColors[idx % textHoverColors.length]}`}>
                                                            {icon.title}
                                                        </span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-px bg-lime-400/50"></div>

                                        {megaData.cols && megaData.cols.length > 0 && (
                                            <div className="space-y-4 pb-8">
                                                {megaData.cols.map((col, colIdx) => {
                                                    const relatedIcon = megaData.icons.find(
                                                        (icon) => icon.title.toUpperCase() === col.h
                                                    );
                                                    const isExpanded = expandedCols[col.h];
                                                    return (
                                                        <div key={`${col.h}-${colIdx}`} className="bg-gray-50/50 dark:bg-[var(--bg-muted)]/20 p-3 rounded-xl border border-gray-100 dark:border-[var(--border-subtle)]">
                                                            <Link
                                                                href={relatedIcon?.href || '#'}
                                                                onClick={() => setActiveMobileMegaMenuItem(null)}
                                                                className="text-[11px] font-black tracking-wide text-slate-800 dark:text-[var(--text-primary)] uppercase mb-2 block hover:text-[#6BAF7B] transition"
                                                            >
                                                                {col.h}
                                                            </Link>
                                                            <ul className="grid grid-cols-1 gap-1.5">
                                                                {(isExpanded ? col.items : col.items.slice(0, 4)).map((it, itemIdx) => {
                                                                    const item = typeof it === 'string' ? { name: it, href: '#' } : it;
                                                                    return (
                                                                        <li key={`${item.name}-${colIdx}-${itemIdx}`}>
                                                                            <Link
                                                                                href={item.href || '#'}
                                                                                onClick={() => setActiveMobileMegaMenuItem(null)}
                                                                                className="text-[11px] text-slate-500 dark:text-[var(--text-placeholder)] hover:text-[#6BAF7B] transition block py-0.5"
                                                                            >
                                                                                • {item.name}
                                                                            </Link>
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>

                                                            {col.items.length > 4 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleColumn(col.h)}
                                                                    className="mt-2.5 flex items-center gap-1 text-[10px] font-bold text-[#6BAF7B] hover:opacity-80 transition"
                                                                >
                                                                    <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
                                                                    <Icon
                                                                        name="ChevronDown"
                                                                        className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                    />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}