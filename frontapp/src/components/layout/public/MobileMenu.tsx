'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import ThemeToggle from '@/components/layout/shared/ThemeToggle';
import { useCarritoStore } from '@/store/carritoStore';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
    isAuthenticated: boolean;
    user: { display_name?: string; username?: string; email?: string } | null;
    dashboardUrl: string;
}

interface MenuItem {
    label: string;
    href?: string;
    icon?: string;
    children?: MenuItem[];
}

// Icon name mapping for Lucide icons
const iconNameMap: Record<string, string> = {
    'shopping-bag': 'ShoppingBag',
    'headset': 'Headset',
    'info': 'Info',
    'newspaper': 'Newspaper',
    'chats-circle': 'MessageCircle',
    'storefront': 'Store',
    'buildings': 'Building2',
    'phone-call': 'PhoneCall',
    'house': 'Home',
};

export default function MobileMenu({ isOpen, onClose, menuItems, isAuthenticated, user, dashboardUrl }: MobileMenuProps) {
    // Navigation state: 0 = main, 1 = categories, 2 = subcategories, 3 = items
    const [menuLevel, setMenuLevel] = useState(0);
    const [activeParent, setActiveParent] = useState<MenuItem | null>(null);
    const [secondParent, setSecondParent] = useState<MenuItem | null>(null);
    const [thirdParent, setThirdParent] = useState<MenuItem | null>(null);
    const cartItemCount = useCarritoStore((s) => s.cartItems.reduce((sum, i) => sum + Number(i.cantidad ?? 0), 0));

    // PHP brand identity colors per drill-down level
    const levelColors: Record<number, string> = {
        0: '#ffffff',  // Nivel 0 - Blanco
        1: '#CEE86B',  // Nivel 1 - Verde Lima
        2: '#C0FDDF',  // Nivel 2 - Verde Menta
        3: '#7AC9EB',  // Nivel 3 - Azul
    };

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset to level 0 when menu closes
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setMenuLevel(0);
                setActiveParent(null);
                setSecondParent(null);
                setThirdParent(null);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Navigate to subcategories (advance one level)
    const goToSubcategories = useCallback((item: MenuItem) => {
        if (menuLevel === 0) {
            setActiveParent(item);
            setMenuLevel(1);
        } else if (menuLevel === 1) {
            setSecondParent(item);
            setMenuLevel(2);
        } else if (menuLevel === 2) {
            setThirdParent(item);
            setMenuLevel(3);
        }
    }, [menuLevel]);

    // Go back
    const goBack = useCallback(() => {
        if (menuLevel === 3) {
            setMenuLevel(2);
            setThirdParent(null);
        } else if (menuLevel === 2) {
            setMenuLevel(1);
            setSecondParent(null);
            setThirdParent(null);
        } else if (menuLevel === 1) {
            setMenuLevel(0);
            setActiveParent(null);
            setSecondParent(null);
            setThirdParent(null);
        }
    }, [menuLevel]);

    // Close and navigate
    const handleLinkClick = useCallback(() => {
        setTimeout(onClose, 200);
    }, [onClose]);

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
                role="presentation"
                aria-hidden="true"
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-[85vw] max-w-md bg-white dark:bg-[var(--bg-secondary)] z-[101] transform transition-transform duration-300 ease-out shadow-2xl dark:shadow-none lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* ===== 1. HEADER — Logo + Close ===== */}
                <div className="px-5 py-4 border-b border-gray-200 dark:border-[var(--border-subtle)] flex justify-between items-center shrink-0 bg-white dark:bg-[var(--bg-secondary)] z-20">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/img/iconologo.png"
                            alt="Lyrium Icono"
                            width={56}
                            height={56}
                            className="h-14 w-auto object-contain"
                        />
                        <Image
                            src="/img/nombrelogo.png"
                            alt="Lyrium Nombre"
                            width={120}
                            height={32}
                            className="h-8 w-auto object-contain"
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 dark:text-[var(--text-placeholder)] hover:text-gray-800 dark:hover:text-[#E8EDE9] text-3xl p-1"
                        aria-label="Cerrar menú"
                    >
                        <Icon name="X" />
                    </button>
                </div>

                {/* ===== 2. SECONDARY NAV HEADER — Back button (visible on level 1+) ===== */}
                {menuLevel > 0 && (
                    <div className="flex items-center px-5 py-3 bg-gray-50 dark:bg-[var(--bg-muted)] border-b border-gray-100 dark:border-[var(--border-subtle)] shrink-0">
                        <button
                            onClick={goBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors group"
                        >
                            <div
                                className="rounded-full p-1.5 transition-colors border"
                                style={{
                                    backgroundColor: menuLevel <= 1 ? '#ffffff' : 'transparent',
                                    borderColor: menuLevel <= 1 ? '#e5e7eb' : levelColors[menuLevel - 1],
                                }}
                            >
                                <Icon
                                    name="ChevronLeft"
                                    className="text-lg"
                                    style={{ color: menuLevel <= 1 ? '#4b5563' : levelColors[menuLevel - 1] }}
                                />
                            </div>
                            <span className="font-bold text-base text-gray-700 dark:text-[var(--text-primary)] group-hover:text-green-700">
                                {menuLevel === 1
                                    ? 'Menú'
                                    : menuLevel === 2 && secondParent
                                    ? activeParent?.label
                                    : menuLevel === 3 && thirdParent
                                    ? secondParent?.label
                                    : 'Menú principal'}
                            </span>
                        </button>
                    </div>
                )}

                {/* ===== 3. SCROLLABLE CONTENT ===== */}
                <div className="flex-1 overflow-y-auto relative bg-white dark:bg-[var(--bg-secondary)]">
                    {/* === LEVEL 0: Main Menu === */}
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-out overflow-y-auto"
                        style={{
                            transform: `translateX(${menuLevel === 0 ? '0%' : '-100%'})`,
                            opacity: menuLevel === 0 ? 1 : 0,
                            pointerEvents: menuLevel === 0 ? 'auto' : 'none',
                        }}
                    >
                        <div className="py-2">
                            {/* Inicio link */}
                            <Link
                                href="/"
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition group border-b border-gray-100 dark:border-[var(--bg-card)]"
                            >
                                <Icon name="Home" className="text-xl text-[#16a34a] dark:text-[var(--color-success)] group-hover:scale-110 transition-transform" />
                                <span className="text-gray-800 dark:text-[var(--text-primary)] text-[15px] font-medium">Inicio</span>
                            </Link>

                            {/* Menu items */}
                            {menuItems.map((item) => {
                                const iconName = item.icon ? iconNameMap[item.icon] || item.icon : 'ChevronRight';
                                const hasChildren = item.children && item.children.length > 0;

                                if (hasChildren) {
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => goToSubcategories(item)}
                                            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition group border-b border-gray-100 dark:border-[var(--bg-card)]"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon name={iconName} className="text-xl text-[#16a34a] dark:text-[var(--color-success)] group-hover:scale-110 transition-transform" />
                                                <span className="text-gray-800 dark:text-[var(--text-primary)] text-[15px] font-medium">{item.label}</span>
                                            </div>
                                            <Icon name="ChevronRight" className="text-gray-400 text-sm" />
                                        </button>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.label}
                                        href={item.href || '#'}
                                        onClick={handleLinkClick}
                                        className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition group border-b border-gray-100 dark:border-[var(--bg-card)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon name={iconName} className="text-xl text-[#16a34a] dark:text-[var(--color-success)] group-hover:scale-110 transition-transform" />
                                            <span className="text-gray-800 dark:text-[var(--text-primary)] text-[15px] font-medium">{item.label}</span>
                                        </div>
                                        <Icon name="ChevronRight" className="text-gray-400 dark:text-[var(--text-placeholder)] text-sm" />
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* === LEVEL 1: Subcategories === */}
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-out overflow-y-auto"
                        style={{
                            transform: `translateX(${menuLevel === 1 ? '0%' : menuLevel === 0 ? '100%' : '-100%'})`,
                            opacity: menuLevel === 1 ? 1 : 0,
                            pointerEvents: menuLevel === 1 ? 'auto' : 'none',
                        }}
                    >
                        {activeParent && (
                            <div className="py-0">
                                {/* Section header — colored banner (Level 1 = Verde Lima) */}
                                <div
                                    className="flex items-center justify-between px-5 py-4 sticky top-0 z-10 shadow-md"
                                    style={{ backgroundColor: levelColors[1] }}
                                >
                                    <span className="font-bold text-lg text-gray-800 dark:text-[var(--text-primary)]">{activeParent.label}</span>
                                    <Link
                                        href={activeParent.href || '#'}
                                        onClick={handleLinkClick}
                                        className="text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap hover:brightness-95 transform hover:scale-105 transition shadow-sm"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000000' }}
                                    >
                                        Ver todo
                                    </Link>
                                </div>

                                {/* Subcategory items — no extra "Ver todo" link needed */}

                                {/* Subcategory items */}
                                {activeParent.children?.map((child) => {
                                    const hasChildren = child.children && child.children.length > 0;

                                    if (hasChildren) {
                                        return (
                                            <button
                                                key={child.label}
                                                onClick={() => goToSubcategories(child)}
                                                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition group border-b border-gray-100 dark:border-[var(--bg-card)]"
                                            >
                                                <span className="text-gray-700 dark:text-[var(--text-primary)] text-[14px] font-medium">{child.label}</span>
                                                <Icon name="ChevronRight" className="text-gray-400 dark:text-[var(--text-placeholder)] text-sm" />
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={child.label}
                                            href={child.href || '#'}
                                            onClick={handleLinkClick}
                                            className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition border-b border-gray-100 dark:border-[var(--bg-card)]"
                                        >
                                            <span className="text-gray-700 dark:text-[var(--text-primary)] text-[14px] font-medium">{child.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* LEVEL 2: Subcategories (Verde Menta) */}
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-out overflow-y-auto"
                        style={{
                            transform: `translateX(${menuLevel === 2 ? '0%' : '100%'})`,
                            opacity: menuLevel === 2 ? 1 : 0,
                            pointerEvents: menuLevel === 2 ? 'auto' : 'none',
                        }}
                    >
                        {secondParent && menuLevel === 2 && (
                            <div className="py-0">
                                {/* Section header */}
                                <div
                                    className="flex items-center justify-between px-5 py-4 sticky top-0 z-10 shadow-md"
                                    style={{ backgroundColor: levelColors[2] }}
                                >
                                    <span className="font-bold text-lg text-gray-800 dark:text-[var(--text-primary)]">{secondParent.label}</span>
                                    <Link
                                        href={secondParent.href || '#'}
                                        onClick={handleLinkClick}
                                        className="text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap hover:brightness-95 transform hover:scale-105 transition shadow-sm"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000000' }}
                                    >
                                        Ver todo
                                    </Link>
                                </div>

                                {/* Sub-subcategory items */}
                                {secondParent.children?.map((child) => {
                                    const hasChildren = child.children && child.children.length > 0;

                                    if (hasChildren) {
                                        return (
                                            <button
                                                key={child.label}
                                                onClick={() => goToSubcategories(child)}
                                                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition group border-b border-gray-100 dark:border-[var(--bg-card)]"
                                            >
                                                <span className="text-gray-700 dark:text-[var(--text-primary)] text-[14px] font-medium">{child.label}</span>
                                                <Icon name="ChevronRight" className="text-gray-400 dark:text-[var(--text-placeholder)] text-sm" />
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={child.label}
                                            href={child.href || '#'}
                                            onClick={handleLinkClick}
                                            className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition border-b border-gray-100 dark:border-[var(--bg-card)]"
                                        >
                                            <span className="text-gray-700 dark:text-[var(--text-primary)] text-[14px] font-medium">{child.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* LEVEL 3: Final items list (Azul) */}
                    <div
                        className="absolute inset-0 transition-all duration-300 ease-out overflow-y-auto"
                        style={{
                            transform: `translateX(${menuLevel === 3 ? '0%' : '100%'})`,
                            opacity: menuLevel === 3 ? 1 : 0,
                            pointerEvents: menuLevel === 3 ? 'auto' : 'none',
                        }}
                    >
                        {thirdParent && menuLevel === 3 && (
                            <div className="py-0">
                                {/* Section header */}
                                <div
                                    className="flex items-center justify-between px-5 py-4 sticky top-0 z-10 shadow-md"
                                    style={{ backgroundColor: levelColors[3] }}
                                >
                                    <span className="font-bold text-lg text-gray-800 dark:text-[var(--text-primary)]">{thirdParent.label}</span>
                                    <Link
                                        href={thirdParent.href || '#'}
                                        onClick={handleLinkClick}
                                        className="text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wide whitespace-nowrap hover:brightness-95 transform hover:scale-105 transition shadow-sm"
                                        style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: '#000000' }}
                                    >
                                        Ver todo
                                    </Link>
                                </div>

                                {/* Final items list - simple list like PHP */}
                                {thirdParent.children?.map((child) => {
                                    const hasChildren = child.children && child.children.length > 0;

                                    if (hasChildren) {
                                        return (
                                            <button
                                                key={child.label}
                                                onClick={() => goToSubcategories(child)}
                                                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition group border-b border-gray-100 dark:border-[var(--bg-card)]"
                                            >
                                                <span className="text-gray-700 dark:text-[var(--text-primary)] text-[14px] font-medium">{child.label}</span>
                                                <Icon name="ChevronRight" className="text-gray-400 dark:text-[var(--text-placeholder)] text-sm" />
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={child.label}
                                            href={child.href || '#'}
                                            onClick={handleLinkClick}
                                            className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-[#182420] transition border-b border-gray-100 dark:border-[var(--bg-card)]"
                                        >
                                            <span className="text-gray-700 dark:text-[var(--text-primary)] text-[14px] font-medium">{child.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ===== 4. FOOTER — Account / Cart / Theme (visible on level 0) ===== */}
                {menuLevel === 0 && (
                    <div className="p-5 border-t border-gray-200 dark:border-[var(--border-subtle)] bg-gray-50 dark:bg-[var(--bg-secondary)] space-y-4 shrink-0">
                        {isAuthenticated && user ? (
                            <div className="flex flex-col gap-2">
                                <span className="flex items-center gap-3 text-gray-700 dark:text-[var(--text-primary)]">
                                    <Icon name="UserCircle" className="text-3xl text-sky-600 dark:text-[var(--color-success)]" />
                                    <span className="font-medium text-lg truncate max-w-[200px]">
                                        {user.display_name || user.username || user.email}
                                    </span>
                                </span>
                                <Link
                                    href={dashboardUrl}
                                    onClick={handleLinkClick}
                                    className="flex items-center gap-3 text-gray-700 dark:text-[var(--text-primary)] hover:text-sky-600 dark:hover:text-[#6BAF7B] transition group"
                                >
                                    <Icon name="LayoutDashboard" className="text-3xl text-sky-600 dark:text-[var(--color-success)] group-hover:scale-110 transition-transform" />
                                    <span className="font-medium text-lg">Mi Panel</span>
                                </Link>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                onClick={handleLinkClick}
                                className="flex items-center gap-3 text-gray-700 dark:text-[var(--text-primary)] hover:text-sky-600 dark:hover:text-[#6BAF7B] transition group"
                            >
                                <Icon name="UserCircle" className="text-3xl text-sky-600 dark:text-[var(--color-success)] group-hover:scale-110 transition-transform" />
                                <span className="font-medium text-lg">Mi Cuenta / Registrarse</span>
                            </Link>
                        )}

                        <Link
                            href="/carrito"
                            className="flex items-center gap-3 text-gray-700 dark:text-[var(--text-primary)] hover:text-sky-600 dark:hover:text-[#6BAF7B] transition group"
                        >
                            <div className="relative">
                                <Icon name="ShoppingCart" className="text-3xl text-sky-600 dark:text-[var(--color-success)] group-hover:scale-110 transition-transform" />
                                {cartItemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-sky-500 dark:bg-[var(--brand-green)] text-white text-[11px] rounded-full w-5 h-5 flex items-center justify-center">
                                        {cartItemCount}
                                    </span>
                                )}
                            </div>
                            <span className="font-medium text-lg dark:text-[var(--text-primary)]">Carrito</span>
                        </Link>

                        {/* Theme Toggle Mobile */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[var(--bg-card)] rounded-xl border border-gray-200 dark:border-[var(--border-subtle)] shadow-sm">
                            <ThemeToggle />
                            <span className="font-medium text-base text-gray-700 dark:text-[var(--text-primary)]">Modo oscuro</span>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
