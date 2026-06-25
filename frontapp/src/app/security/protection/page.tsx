import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import ProtectionPageClient from '@/features/security/protection/ProtectionPageClient';

export default async function ProtectionPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando protección..." />}>
            <ProtectionPageClient />
        </Suspense>
    );
}
