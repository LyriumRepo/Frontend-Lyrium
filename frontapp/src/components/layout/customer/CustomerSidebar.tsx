'use client';

import React from 'react';
import SmartSidebar from '@/components/layout/shared/SmartSidebar';
import { customerNavigation } from '@/shared/lib/constants/customer-nav';
import { useAuth } from '@/shared/lib/context/AuthContext';

interface CustomerSidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
}

export default function CustomerSidebar({ isMobileOpen, onClose }: CustomerSidebarProps) {
    const { user } = useAuth();

    const customerUser = {
        name: user?.display_name || "Mi Cuenta",
        role: user?.role === 'customer' ? 'Cliente' : 'Usuario',
        avatar: user?.avatar
    };

    return (
        <SmartSidebar
            navigation={customerNavigation}
            user={customerUser}
            brandColor="sky"
            storageKey="customer_sidebar_expanded"
            sectionTitle="Mi Cuenta"
            footerLabel="CUSTOMER PANEL © 2025"
            isMobileOpen={isMobileOpen}
            onClose={onClose}
        />
    );
}
