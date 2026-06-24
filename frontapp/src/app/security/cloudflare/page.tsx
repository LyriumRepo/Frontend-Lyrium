import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import CloudflarePageClient from '@/features/security/cloudflare/CloudflarePageClient';

export default async function CloudflarePage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando Cloudflare..." />}>
            <CloudflarePageClient />
        </Suspense>
    );
}
