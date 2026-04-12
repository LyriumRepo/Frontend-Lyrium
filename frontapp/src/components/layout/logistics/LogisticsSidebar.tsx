'use client';

import React from 'react';
import SmartSidebar from '@/components/layout/shared/SmartSidebar';
import { logisticsNavigation } from '@/shared/lib/constants/logistics-nav';

interface LogisticsSidebarProps {
    isMobileOpen?: boolean;
    onClose?: () => void;
}

export default function LogisticsSidebar({ isMobileOpen = false, onClose }: LogisticsSidebarProps) {
    const logisticsUser = {
        name: 'Operador Logístico',
        role: 'Marketplace Lyrium',
        avatar: undefined // Fallback LO
    };

    return (
        <SmartSidebar
            navigation={logisticsNavigation}
            user={logisticsUser}
            brandColor="violet"
            storageKey="logistics_sidebar_expanded"
            sectionTitle="Gestión Logística"
            footerLabel="LYRIUM © 2025"
            isMobileOpen={isMobileOpen}
            onClose={onClose}
        />
    );
}
