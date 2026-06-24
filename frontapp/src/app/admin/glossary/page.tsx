import { Suspense } from 'react';
import { GlossaryPageClient } from '@/features/admin/glossary/GlossaryPageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function GlossaryPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando glosario..." />}>
            <GlossaryPageClient />
        </Suspense>
    );
}
