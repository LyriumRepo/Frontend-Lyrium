import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import AlertsPageClient from '@/features/security/alerts/AlertsPageClient';

export default async function AlertsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando alertas..." />}>
            <AlertsPageClient />
        </Suspense>
    );
}
