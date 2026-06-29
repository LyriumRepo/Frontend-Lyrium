import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import SettingsPageClient from '@/features/security/settings/SettingsPageClient';

export default async function SettingsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando configuración..." />}>
            <SettingsPageClient />
        </Suspense>
    );
}
