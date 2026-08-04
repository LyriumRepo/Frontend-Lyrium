'use client';

import React from 'react';
import SmartSidebar from '@/components/layout/shared/SmartSidebar';
import { adminNavigation } from '@/shared/lib/constants/admin-nav';
import { useNavNotificationBadges } from '@/shared/hooks/useNavNotificationBadges';

interface AdminSidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isMobileOpen, onClose }: AdminSidebarProps) {
    const notificationBadges = useNavNotificationBadges('administrator');

    const adminUser = {
        name: 'Admin Marketplace',
        role: 'Super Administrador',
        avatar: undefined
    };

    const badges: Record<string, number> = { ...notificationBadges };

    return (
        <SmartSidebar
            navigation={adminNavigation}
            user={adminUser}
            brandColor="sky"
            storageKey="admin_sidebar_expanded"
            sectionTitle="Gestión de Plataforma"
            footerLabel="ADMIN PANEL © 2025"
            isMobileOpen={isMobileOpen}
            onClose={onClose}
            badges={badges}
        />
    );
}
