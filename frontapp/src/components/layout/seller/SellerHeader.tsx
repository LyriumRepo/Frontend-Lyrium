'use client';

import ThemeToggle from '@/components/layout/shared/ThemeToggle';
import NotificationBell from '@/components/layout/shared/NotificationBell';
import UserMenu from '@/components/layout/shared/UserMenu';
import Breadcrumb from '@/components/layout/shared/Breadcrumb';
import { useAutoBreadcrumb } from '@/shared/hooks/useAutoBreadcrumb';
import { Menu } from 'lucide-react';

export default function SellerHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
    const breadcrumbs = useAutoBreadcrumb();

    return (
        <header className="h-16 bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] sticky top-0 z-50">
            <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">

                {/* ── Izquierda: Menú + Marca + Breadcrumb ── */}
                <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    <button
                        onClick={onOpenMenu}
                        className="lg:hidden p-2.5 -ml-2.5 rounded-lg hover:bg-[var(--bg-hover)] active:bg-[var(--bg-hover)] transition-colors"
                        aria-label="Abrir menú"
                    >
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--text-secondary)]" />
                    </button>

                    {/* "Mi Panel" — aparece desde tablet en adelante (768px+), 
                        en móvil ocupa espacio que necesita el breadcrumb/acciones */}
                    <span className="hidden md:inline-block px-3 py-1 bg-sky-500 dark:bg-[#8FC3A1] text-white text-xs font-bold uppercase rounded-full whitespace-nowrap shrink-0">
                        Mi Panel
                    </span>

                    {/* Breadcrumb — visible desde tablet pequeño (640px).
                        min-w-0 + overflow-hidden evita que un breadcrumb largo
                        empuje los íconos de la derecha fuera de pantalla. */}
                    <div className="hidden sm:block min-w-0 overflow-hidden">
                        <Breadcrumb items={breadcrumbs} />
                    </div>
                </div>

                {/* ── Derecha: Estado + Métricas + Acciones ── */}
                <div className="flex items-center gap-1.5 sm:gap-3 md:gap-4 shrink-0">

                    {/* Métricas rápidas — solo en desktop amplio (1024px+).
                        En tablet no caben sin truncar o forzar dos líneas,
                        así que se reservan para cuando hay espacio real. */}
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

                    {/* Separador antes de Theme/Bell — visible desde tablet.
                        Como los elementos lg-only colapsan a 0px en pantallas
                        más chicas, este separador queda pegado correctamente
                        junto al Connection Status (o al borde si ese también
                        está oculto), sin dejar huecos huérfanos. */}
                    <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-[var(--border-subtle)]" />

                    {/* Theme Toggle — SIEMPRE visible, incluido móvil.
                        El modo oscuro es un feature central de esta app
                        (toda la UI tiene variantes dark cuidadosamente
                        diseñadas), así que ocultarlo en móvil le quita
                        control al usuario justo donde más navega. */}
                    <ThemeToggle />

                    <NotificationBell />

                    <div className="hidden sm:block h-8 w-px bg-gray-200 dark:bg-[var(--border-subtle)]" />

                    <UserMenu />
                </div>
            </div>
        </header>
    );
}