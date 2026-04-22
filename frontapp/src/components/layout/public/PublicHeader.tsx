'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Icon from '@/components/ui/Icon';
import ThemeToggle from '@/components/layout/shared/ThemeToggle';
import TopBanner from './TopBanner';
import DesktopNav from './DesktopNav';
import MobileMenu from './MobileMenu';
import { menuItems as fallbackMenuItems, megaMenuData as fallbackMegaMenuData } from '@/data/menuData';
import { useMegaMenu } from '@/shared/hooks/useMegaMenu';
import { useCarritoStore } from '@/store/carritoStore';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { AUTH_CONFIG } from '@/shared/lib/config/auth';
import LogoLyrium from '@/components/LogoLyrium';

export default function PublicHeader() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const cartItemCount = useCarritoStore((s) => s.cartItems.reduce((sum, i) => sum + Number(i.cantidad ?? 0), 0));
    const { menuItems: apiMenuItems, megaMenuData: apiMegaMenuData, hasData } = useMegaMenu();
    const { user, isAuthenticated } = useAuth();
    const dashboardUrl = isAuthenticated && user?.role
        ? (AUTH_CONFIG.routes[user.role as keyof typeof AUTH_CONFIG.routes] ?? '/login')
        : '/login';

    // Combinar: items de API (PRODUCTOS/SERVICIOS) + items estáticos (NOSOTROS, CONTACTO, etc.)
    const staticItems = fallbackMenuItems.filter(item => !item.children);
    const menuItems = hasData ? [...apiMenuItems, ...staticItems] : fallbackMenuItems;
    const megaMenuData = hasData ? apiMegaMenuData : fallbackMegaMenuData;

    return (
        <>
            <TopBanner />
            <header className="bg-white dark:bg-[var(--bg-secondary)] shadow-md dark:shadow-none sticky top-0 z-50 border-b border-gray-100 dark:border-[var(--border-subtle)]">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 gap-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <LogoLyrium
                        frontImg="/img/iconologo.png"
                        sideImg="/img/nombrelogo.png"
                        />
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Desktop: Session / Cart */}
                        <div className="hidden md:flex items-center gap-5 text-xs lg:text-[13px] text-sky-600 dark:text-[var(--color-success)]">
                            {isAuthenticated && user ? (
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <Icon name="UserCircle" className="text-[18px]" />
                                        <span className="whitespace-nowrap truncate max-w-[110px]">
                                            {user.display_name || user.username || user.email}
                                        </span>
                                    </span>
                                    <Link href={dashboardUrl} className="flex items-center gap-1 hover:underline font-medium">
                                        <Icon name="LayoutDashboard" className="text-[18px]" />
                                        <span className="whitespace-nowrap">Mi Panel</span>
                                    </Link>
                                </div>
                            ) : (
                                <Link href="/login" className="flex items-center gap-1 hover:underline">
                                    <Icon name="UserCircle" className="text-[18px]" />
                                    <span className="whitespace-nowrap">Iniciar Sesión | Registrarse</span>
                                </Link>
                            )}

                            <Link href="/carrito" className="flex items-center gap-1 hover:underline">
                                <Icon name="ShoppingCart" className="text-[18px]" />
                                <span>Carrito</span>
                                {cartItemCount > 0 && (
                                    <span className="bg-sky-500 dark:bg-[var(--brand-green)] text-white dark:text-[var(--text-primary)] text-[11px] rounded-full px-2 py-0.5">{cartItemCount}</span>
                                )}
                            </Link>

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

                {/* Desktop Nav con MegaMenu */}
                <DesktopNav menuItems={menuItems} megaMenuData={megaMenuData} />
            </header>

            {/* Mobile Menu (drawer con drill-down) */}
            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                menuItems={menuItems}
                isAuthenticated={isAuthenticated}
                user={user}
                dashboardUrl={dashboardUrl}
            />

            {/* WhatsApp floating button (mobile only) */}
            <Link
                href="https://wa.me/51999999999?text=Hola,%20tengo%20una%20consulta"
                target="_blank"
                className="fixed bottom-6 right-6 z-50 lg:hidden"
            >
                <div className="bg-green-500 dark:bg-[#2E7D32] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-green-600 dark:hover:bg-[#1B5E20] transition-all duration-300 hover:scale-110">
                    <Icon name="MessageCircle" className="text-3xl" />
                </div>
            </Link>
        </>
    );
}
