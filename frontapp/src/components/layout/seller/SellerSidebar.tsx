'use client';

import React from 'react';
import SmartSidebar from '@/components/layout/shared/SmartSidebar';
import { sellerNavigation } from '@/shared/lib/constants/seller-nav';
import { useAuth } from '@/shared/lib/context/AuthContext';

interface SellerSidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
}

export default function SellerSidebar({ isMobileOpen, onClose }: SellerSidebarProps) {
    const { user } = useAuth();

    const sellerUser = {
        name: user?.display_name || "Mi Tienda",
        role: user?.role === 'administrator' ? 'Administrador' : 'Vendedor Premium',
        avatar: user?.avatar
    };

    return (
        <SmartSidebar
            navigation={sellerNavigation}
            user={sellerUser}
            brandColor="sky"
            storageKey="seller_sidebar_expanded"
            sectionTitle="Gestión Comercial"
            footerLabel="VENDOR PANEL © 2025"
            isMobileOpen={isMobileOpen}
            onClose={onClose}
        />
    );
}
