import { Suspense } from 'react';
import { AdminSecurityPageClient } from '@/features/admin/security/AdminSecurityPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function AdminSecurityPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando panel de seguridad..." />}>
            <AdminSecurityPageClient />
        </Suspense>
    );
}
