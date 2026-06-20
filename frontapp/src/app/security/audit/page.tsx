import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import AuditPageClient from '@/features/security/audit/AuditPageClient';

export default async function AuditPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando auditoría..." />}>
            <AuditPageClient />
        </Suspense>
    );
}
