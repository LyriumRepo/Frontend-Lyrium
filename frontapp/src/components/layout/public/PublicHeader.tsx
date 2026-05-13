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
                    <Link href="/" className="flex items-center gap-2 group relative">

                        {/* Logo NORMAL (no se toca tamaño) */}
                        <Image
                            src="/img/iconologo.png"
                            alt="Lyrium Icono"
                            width={80}
                            height={80}
                            className="h-16 md:h-20 w-auto object-contain relative z-10 transition-transform duration-700 ease-out group-hover:rotate-[360deg]"
                        />

                        {/* Círculo blanco DETRÁS */}
                        <div className="absolute left-2 md:left-2 w-14 h-14 md:w-15 md:h-14 bg-white rounded-full z-0" />

                        <Image
                            src="/img/nombrelogo.png"
                            alt="Lyrium Nombre"
                            width={160}
                            height={40}
                            className="h-8 md:h-10 w-auto object-contain mt-1"
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
                                    <Link href="/login" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors flex items-center justify-center"
                                    >
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
