import { Suspense } from 'react';
import { BlogPodcastsClient } from '@/features/seller/blog/BlogPodcastsClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function BlogPodcastsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando podcasts..." />}>
            <BlogPodcastsClient />
        </Suspense>
    );
}
