import { Suspense } from 'react';
import { ForumTopicClient } from '@/features/seller/forum/ForumTopicClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ForumTopicPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando tema..." />}>
            <ForumTopicClient />
        </Suspense>
    );
}
