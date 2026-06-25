'use client';

import React from 'react';
import SmartSidebar from '@/components/layout/shared/SmartSidebar';
import { securityNavigation } from '@/shared/lib/constants/security-nav';

interface SecuritySidebarProps {
    isMobileOpen: boolean;
    onClose: () => void;
}

export default function SecuritySidebar({ isMobileOpen, onClose }: SecuritySidebarProps) {
    const securityUser = {
        name: 'Admin Seguridad',
        role: 'Administrador de Seguridad',
        avatar: undefined
    };

    return (
        <SmartSidebar
            navigation={securityNavigation}
            user={securityUser}
            brandColor="amber"
            storageKey="security_sidebar_expanded"
            sectionTitle="Panel de Seguridad"
            footerLabel="SECURITY PANEL © 2025"
            isMobileOpen={isMobileOpen}
            onClose={onClose}
        />
    );
}
