import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import SecurityDashboardPageClient from '@/features/security/dashboard/SecurityDashboardPageClient';

export default async function SecurityPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando panel de seguridad..." />}>
            <SecurityDashboardPageClient />
        </Suspense>
    );
}
