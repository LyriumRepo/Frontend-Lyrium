import { Suspense } from 'react';
import { ForumClient } from '@/features/seller/forum/ForumClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ForumPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando foro..." />}>
            <ForumClient />
        </Suspense>
    );
}
