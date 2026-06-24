import { Suspense } from 'react';
import { BlogShortsClient } from '@/features/seller/blog/BlogShortsClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function BlogShortsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando shorts..." />}>
            <BlogShortsClient />
        </Suspense>
    );
}
