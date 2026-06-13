import { Suspense } from 'react';
import { BlogArticlesClient } from '@/features/seller/blog/BlogArticlesClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function BlogArticlesPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando artículos..." />}>
            <BlogArticlesClient />
        </Suspense>
    );
}
