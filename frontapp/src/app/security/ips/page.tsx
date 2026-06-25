import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import IpsPageClient from '@/features/security/ips/IpsPageClient';

export default async function IpsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando gestión de IPs..." />}>
            <IpsPageClient />
        </Suspense>
    );
}
