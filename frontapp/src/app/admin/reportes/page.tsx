import { Suspense } from 'react';
import { ReportesPageClient } from '@/features/admin/reportes/ReportesPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ReportesPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando reportes..." />}>
            <ReportesPageClient />
        </Suspense>
    );
}
