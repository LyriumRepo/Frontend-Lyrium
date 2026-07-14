'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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

const iconNameMap: Record<string, string> = {
    'shopping-bag': 'ShoppingBag',
    'headset': 'Headset',
    'info': 'Info',
    'newspaper': 'Newspaper',
    'chats-circle': 'ChatCircle',
    'storefront': 'Storefront',
    'buildings': 'Buildings',
    'phone-call': 'PhoneCall',
};

export default function PublicHeader() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activeMobileMegaMenuItem, setActiveMobileMegaMenuItem] = useState<MenuItem | null>(null);
    const [activeMobileCategory, setActiveMobileCategory] = useState<string>('');
    const [expandedCols, setExpandedCols] = useState<Record<string, boolean>>({});
    const cartItemCount = useCarritoStore((s) => s.cartItems.reduce((sum, i) => sum + Number(i.cantidad ?? 0), 0));

    const { menuItems: apiMenuItems, megaMenuData: apiMegaMenuData, hasData } = useMegaMenu();
    const { user, isAuthenticated, logout } = useAuth();
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
                <div className="max-w-7xl mx-auto flex items-center justify-between px-2.5 md:px-4 py-2 gap-1 min-[360px]:gap-2 md:gap-6">
                    <Link href="/" className="flex items-center gap-1 md:gap-2 group relative">
                        <LogoLyrium
                            frontImg="/img/iconologo.png"
                            sideImg="/img/nombrelogo.png"
                        />
                    </Link>

                    <div className="flex items-center gap-2 min-[360px]:gap-3 sm:gap-5 text-xs lg:text-[13px] text-sky-600 dark:text-[var(--color-success)]">
                        {isAuthenticated && user ? (
                            <>
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="flex items-center gap-1 sm:gap-3 p-1 min-[360px]:p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] active:scale-95 transition-all"
                                    >
                                        <Icon name="UserCircle" className="text-base min-[360px]:text-[18px]" />
                                        <span className="hidden sm:block whitespace-nowrap truncate max-w-[110px] text-xs lg:text-[13px] text-sky-600 dark:text-[var(--color-success)]">
                                            {user.display_name || user.username || user.email}
                                        </span>
                                    </button>
                                    {userMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setUserMenuOpen(false)}
                                            />
                                            <div className="absolute right-0 mt-2 w-48 max-w-[calc(100vw-2rem)] bg-white dark:bg-[var(--bg-card)] rounded-xl shadow-lg border border-gray-200 dark:border-[var(--border-subtle)] z-50 py-1">
                                                <div className="px-3 py-2 border-b border-gray-100 dark:border-[var(--border-subtle)]">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-[var(--text-primary)] truncate">
                                                        {user.display_name || user.username}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-[var(--text-muted)] truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => { setUserMenuOpen(false); logout(); }}
                                                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs text-red-500 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-[var(--bg-muted)] transition-colors"
                                                >
                                                    <Icon name="LogOut" className="w-3.5 h-3.5" />
                                                    Cerrar Sesión
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <Link
                                    href={dashboardUrl}
                                    className="flex items-center gap-1.5 p-1 min-[360px]:p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] active:scale-95 transition-all text-sky-600 dark:text-[var(--color-success)]"
                                >
                                    <Icon name="LayoutDashboard" className="text-base min-[360px]:text-[18px]" />
                                    <span className="hidden sm:block whitespace-nowrap text-xs lg:text-[13px]">Mi Panel</span>
                                </Link>
                            </>
                        ) : (
                            <div className="relative group">
                                <Link href="/login" className="p-1 min-[360px]:p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center">
                                    <Icon name="UserCircle" className="text-base min-[360px]:text-[18px]" />
                                </Link>
                                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-[#333333] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
                                    Iniciar sesión
                                </span>
                            </div>
                        )}

                        <div className="relative group">
                            <Link href="/carrito" className="p-1 min-[360px]:p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center">
                                <Icon name="ShoppingCart" className="text-base min-[360px]:text-[18px]" />
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

                        <ThemeToggle
                            buttonClassName="p-1.5 min-[360px]:p-2 sm:p-2.5 rounded-xl"
                            imageClassName="w-7 h-7 min-[360px]:w-8 min-[360px]:h-8 sm:w-9 sm:h-9 object-contain"
                        />

                        {/* Hamburger button (mobile/tablet) */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-1 min-[360px]:p-2 lg:hidden text-2xl min-[360px]:text-3xl text-sky-600 dark:text-[var(--color-success)] flex items-center justify-center"
                            aria-label="Menú"
                        >
                            <Icon name="Menu" />
                        </button>
                    </div>
                </div>

                <div className="lg:hidden w-full border-t border-gray-100 dark:border-[var(--border-subtle)] bg-white dark:bg-[var(--bg-secondary)] overflow-x-auto scrollbar-none py-2 px-2 min-[360px]:py-2.5 min-[360px]:px-3.5 flex items-center justify-start gap-3.5 min-[360px]:gap-5 sm:gap-6">
                    {menuItems.map((item) => {
                        const iconName = item.icon ? iconNameMap[item.icon] : null;
                        return (
                            <Link
                                key={item.label}
                                href={item.href || '#'}
                                onClick={(e) => {
                                    if (item.children) {
                                        e.preventDefault();
                                        handleMobileMegaMenuOpen(item);
                                    }
                                }}
                                className="flex items-center gap-1 min-[360px]:gap-1.5 text-[9px] min-[360px]:text-[10px] font-black text-slate-700 dark:text-[var(--text-primary)] whitespace-nowrap hover:text-sky-500 dark:hover:text-[var(--color-success)] transition-colors uppercase tracking-wider flex-shrink-0"
                            >
                                {iconName && <Icon name={iconName} className="text-[11px] min-[360px]:text-[13px] text-slate-500 dark:text-[var(--text-placeholder)]" />}
                                <span>{item.label}</span>
                                {item.children && <Icon name="ChevronDown" className="w-2 h-2 min-[360px]:w-2.5 min-[360px]:h-2.5 text-slate-400" />}
                            </Link>
                        );
                    })}
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
                onOpenMegaMenu={handleMobileMegaMenuOpen}
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
                                    'border-[#B7E000]',
                                    'border-[#8FD400]',
                                    'border-[#66D6A8]',
                                    'border-[#4EC7B8]',
                                    'border-[#69BEEB]',
                                    'border-[#5AAFE6]',
                                ];

                                const itemsToRender: Array<{
                                    title: string;
                                    img: string | null;
                                    href: string;
                                    items: any[];
                                    colKey: string | null;
                                }> = [];
                                const matchedColHeaders = new Set<string>();

                                if (megaData.icons) {
                                    megaData.icons.forEach((icon) => {
                                        const matchingCol = megaData.cols?.find(
                                            (col) => col.h.toUpperCase() === icon.title.toUpperCase() ||
                                                     col.h.toUpperCase().includes(icon.title.toUpperCase()) ||
                                                     icon.title.toUpperCase().includes(col.h.toUpperCase())
                                        );
                                        if (matchingCol) {
                                            matchedColHeaders.add(matchingCol.h);
                                        }
                                        itemsToRender.push({
                                            title: icon.title,
                                            img: icon.img,
                                            href: icon.href,
                                            items: matchingCol ? matchingCol.items : [],
                                            colKey: matchingCol ? matchingCol.h : null,
                                        });
                                    });
                                }

                                if (megaData.cols) {
                                    megaData.cols.forEach((col) => {
                                        if (!matchedColHeaders.has(col.h)) {
                                            itemsToRender.push({
                                                title: col.h,
                                                img: null,
                                                href: '#',
                                                items: col.items,
                                                colKey: col.h,
                                            });
                                        }
                                    });
                                }

                                return (
                                    <div className="space-y-3 pb-8">
                                        {itemsToRender.map((item, idx) => {
                                            const isExpanded = item.colKey ? expandedCols[item.colKey] : false;
                                            return (
                                                <div
                                                    key={`${item.title}-${idx}`}
                                                    className="bg-gray-50/50 dark:bg-[var(--bg-muted)]/20 p-3 rounded-2xl border border-gray-100 dark:border-[var(--border-subtle)] flex items-start gap-3.5"
                                                >
                                                    {item.img ? (
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => setActiveMobileMegaMenuItem(null)}
                                                            className="flex-shrink-0"
                                                        >
                                                            <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-sm overflow-hidden bg-white dark:bg-[var(--bg-secondary)] ${circleColors[idx % circleColors.length]}`}>
                                                                <Image
                                                                    src={item.img}
                                                                    alt={item.title}
                                                                    width={56}
                                                                    height={56}
                                                                    className="w-full h-full object-contain scale-125"
                                                                />
                                                            </div>
                                                        </Link>
                                                    ) : (
                                                        <div className={`w-14 h-14 rounded-full border-2 flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden bg-slate-50 dark:bg-[var(--bg-secondary)] ${circleColors[idx % circleColors.length]}`}>
                                                            <span className="text-[12px] font-black text-slate-400 uppercase">
                                                                {item.title.slice(0, 2)}
                                                            </span>
                                                        </div>
                                                    )}

                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={item.href}
                                                            onClick={() => setActiveMobileMegaMenuItem(null)}
                                                            className="text-[11px] font-black tracking-wide text-slate-800 dark:text-[var(--text-primary)] uppercase mb-1.5 block hover:text-[#6BAF7B] transition truncate"
                                                        >
                                                            {item.title}
                                                        </Link>

                                                        {item.items && item.items.length > 0 && (
                                                            <>
                                                                <ul className="grid grid-cols-1 gap-1">
                                                                    {(isExpanded ? item.items : item.items.slice(0, 3)).map((it, itemIdx) => {
                                                                        const subItem = typeof it === 'string' ? { name: it, href: '#' } : it;
                                                                        return (
                                                                            <li key={`${subItem.name}-${idx}-${itemIdx}`}>
                                                                                <Link
                                                                                    href={subItem.href || '#'}
                                                                                    onClick={() => setActiveMobileMegaMenuItem(null)}
                                                                                    className="text-[10px] text-slate-500 dark:text-[var(--text-placeholder)] hover:text-[#6BAF7B] transition block py-0.5"
                                                                                >
                                                                                    • {subItem.name}
                                                                                </Link>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>

                                                                {item.items.length > 3 && item.colKey && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleColumn(item.colKey!)}
                                                                        className="mt-1.5 flex items-center gap-0.5 text-[9px] font-bold text-[#6BAF7B] hover:opacity-80 transition"
                                                                    >
                                                                        <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
                                                                        <Icon
                                                                            name="ChevronDown"
                                                                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                                                        />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}