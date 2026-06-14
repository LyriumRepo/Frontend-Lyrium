import { Suspense } from 'react';
import { BlogVideosClient } from '@/features/seller/blog/BlogVideosClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function BlogVideosPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando videos..." />}>
            <BlogVideosClient />
        </Suspense>
    );
}
