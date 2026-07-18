import { Suspense } from 'react';
import { NubefactPageClient } from '@/features/admin/invoices/NubefactPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function AdminRapifacPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando comprobantes..." />}>
            <NubefactPageClient />
        </Suspense>
    );
}
