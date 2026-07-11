import { Suspense } from 'react';
import { TrainingClient } from '@/features/seller/training/TrainingClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function SellerTrainingPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando capacitaciones..." />}>
            <TrainingClient />
        </Suspense>
    );
}
