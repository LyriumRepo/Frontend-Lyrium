import { Suspense } from 'react';
import { PagosPageClient } from '@/features/admin/payments/PagosPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function PagosPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando transacciones..." />}>
            <PagosPageClient />
        </Suspense>
    );
}
