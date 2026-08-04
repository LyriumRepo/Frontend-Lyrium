'use client';

import React, { useMemo } from 'react';
import SmartSidebar from '@/components/layout/shared/SmartSidebar';
import { sellerNavigation } from '@/shared/lib/constants/seller-nav';
import { useAuth } from '@/shared/lib/context/AuthContext';
import { useInventoryAlerts } from '@/features/seller/inventario/context/InventoryAlertsContext';
import { useNavNotificationBadges } from '@/shared/hooks/useNavNotificationBadges';
import { usePlanCapabilities } from '@/shared/lib/hooks/usePlanCapabilities';

interface SellerSidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
}

export default function SellerSidebar({ isMobileOpen, onClose }: SellerSidebarProps) {
    const { user } = useAuth();
    const { alertCount } = useInventoryAlerts();
    const notificationBadges = useNavNotificationBadges('seller');
    const { can, capabilitiesLoading } = usePlanCapabilities();

    const visibleNavigation = useMemo(() => {
        if (capabilitiesLoading) return sellerNavigation;
        return sellerNavigation.map(section => ({
            ...section,
            items: section.items.map(item => ({
                ...item,
                locked: !!item.requiredCapability && !can(item.requiredCapability),
            })),
        }));
    }, [capabilitiesLoading, can]);

    const sellerUser = {
        name: user?.display_name || 'Mi Tienda',
        role: user?.role === 'administrator' ? 'Administrador' : 'Vendedor Premium',
        avatar: user?.avatar,
    };

    const badges: Record<string, number> = {
        ...notificationBadges,
        ...(alertCount > 0 ? { inventario: alertCount } : {}),
    };

    return (
        <SmartSidebar
            navigation={visibleNavigation}
            user={sellerUser}
            brandColor="sky"
            storageKey="seller_sidebar_expanded"
            sectionTitle="Gestión Comercial"
            footerLabel="VENDOR PANEL © 2025"
            isMobileOpen={isMobileOpen}
            onClose={onClose}
            badges={badges}
        />
    );
}