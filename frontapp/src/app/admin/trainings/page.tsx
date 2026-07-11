import { Suspense } from 'react';
import { TrainingsPageClient } from '@/features/admin/trainings/TrainingsPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function AdminTrainingsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando capacitaciones..." />}>
            <TrainingsPageClient />
        </Suspense>
    );
}
