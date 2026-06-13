import { Suspense } from 'react';
import { BlogDashboardClient } from '@/features/seller/blog/BlogDashboardClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function BlogDashboardPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando BioBlog..." />}>
            <BlogDashboardClient />
        </Suspense>
    );
}
