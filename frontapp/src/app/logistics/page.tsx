import { Suspense } from 'react';
import { LogisticsPageClient } from './LogisticsPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function LogisticsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando logística..." />}>
            <LogisticsPageClient />
        </Suspense>
    );
}
