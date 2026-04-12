'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import SellerSidebar from '@/components/layout/seller/SellerSidebar';
import SellerHeader from '@/components/layout/seller/SellerHeader';
import { DashboardLayout } from '@/components/layout/shared/DashboardLayout';
import { useUIStore } from '@/store/uiStore';

interface SellerLayoutClientProps {
    children: React.ReactNode;
}

export function SellerLayoutClient({ children }: SellerLayoutClientProps) {
    const { sidebarOpen, toggleSidebar, closeSidebar } = useUIStore();
    const router = useRouter();
    const pathname = usePathname();
    const [storeChecked, setStoreChecked] = useState(false);

    useEffect(() => {
        // Skip check if already on pending page
        if (pathname === '/seller/pending') {
            setStoreChecked(true);
            return;
        }

        const checkStoreStatus = async () => {
            try {
                const LARAVEL_API = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
                
                // Parse cookie more robustly
                const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                    const [key, ...vals] = cookie.trim().split('=');
                    if (key) acc[key] = decodeURIComponent(vals.join('='));
                    return acc;
                }, {} as Record<string, string>);
                
                const token = cookies['laravel_token'];
                console.log('[SellerLayout] Token found:', !!token);

                if (!token) {
                    setStoreChecked(true);
                    return;
                }

                const response = await fetch(`${LARAVEL_API}/stores/me`, {
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                console.log('[SellerLayout] /stores/me response status:', response.status);

                if (response.status === 403) {
                    console.log('[SellerLayout] 403 - Store not approved, redirecting to pending');
                    router.replace('/seller/pending');
                    return;
                }

                if (response.status === 404) {
                    // Store doesn't exist yet
                    console.log('[SellerLayout] 404 - No store found, redirecting to pending');
                    router.replace('/seller/pending');
                    return;
                }

                if (response.ok) {
                    const data = await response.json();
                    const store = data.data;
                    console.log('[SellerLayout] Store status:', store?.status);
                    
                    if (!store || store.status !== 'approved') {
                        console.log('[SellerLayout] Store not approved, redirecting to pending');
                        router.replace('/seller/pending');
                        return;
                    }
                }
            } catch (err) {
                console.error('[SellerLayout] Error checking store status:', err);
                // If network error, allow access (will fail later with better error)
            }
            setStoreChecked(true);
        };

        checkStoreStatus();
    }, [pathname, router]);

    // Show nothing while checking (avoids flash of seller content)
    if (!storeChecked && pathname !== '/seller/pending') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[var(--bg-secondary)]">
                <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout
            header={<SellerHeader onOpenMenu={toggleSidebar} />}
            sidebar={<SellerSidebar isMobileOpen={sidebarOpen} onClose={closeSidebar} />}
            sidebarOpen={sidebarOpen}
            onSidebarClose={closeSidebar}
            className="bg-[var(--bg-secondary)]"
            mainClassName="p-4 md:p-8"
        >
            {children}
        </DashboardLayout>
    );
}

