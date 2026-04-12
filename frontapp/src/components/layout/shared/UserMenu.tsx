'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/shared/lib/context/AuthContext';

function getPanelBasePath(role: string | undefined | null): string {
    switch (role) {
        case 'customer':
            return '/customer';
        case 'seller':
            return '/seller';
        case 'administrator':
            return '/admin';
        case 'logistics_operator':
            return '/logistics';
        default:
            return '/customer';
    }
}

export default function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (!user) return null;

    const panelBase = getPanelBasePath(user.role);
    const isCustomer = user.role === 'customer';

    const getInitials = (name: string | undefined | null) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 sm:gap-3 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors"
            >
                <div className="flex items-center gap-2 sm:gap-3">
                    {user.avatar ? (
                        <Image
                            src={user.avatar}
                            alt={user.display_name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                            {getInitials(user.display_name || user.username)}
                        </div>
                    )}
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                            {user.display_name || user.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] capitalize">
                            {user.role}
                        </p>
                    </div>
                </div>
                <svg
                    className={`hidden sm:block w-4 h-4 text-gray-500 dark:text-[var(--text-secondary)] transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div
                        role="button"
                        tabIndex={0}
                        aria-label="Cerrar menú"
                        className="fixed inset-0 z-10 cursor-default"
                        onClick={() => setIsOpen(false)}
                        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[var(--bg-card)] rounded-lg shadow-lg border border-gray-200 dark:border-[var(--border-subtle)] z-20">
                        <div className="p-3 border-b border-gray-200 dark:border-[var(--border-subtle)]">
                            <p className="text-sm font-medium text-gray-900 dark:text-[var(--text-primary)]">
                                {user.display_name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-[var(--text-secondary)] mt-1">
                                {user.email}
                            </p>
                        </div>
                        <div className="py-2">
                            <Link
                                href={`${panelBase}/profile`}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)]"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Mi Perfil
                            </Link>
                            <Link
                                href={`${panelBase}/settings`}
                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)]"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Configuración
                            </Link>
                            {isCustomer && (
                                <Link
                                    href={`${panelBase}/help`}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-[var(--text-secondary)] hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)]"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Ayuda
                                </Link>
                            )}
                        </div>
                        <div className="border-t border-gray-200 dark:border-[var(--border-subtle)] py-2">
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[var(--bg-muted)] transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
