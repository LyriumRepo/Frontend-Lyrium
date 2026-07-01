import { Suspense } from 'react';
import BaseLoading from '@/components/ui/BaseLoading';
import SessionsPageClient from '@/features/security/sessions/SessionsPageClient';

export default async function SessionsPage() {
    return (
        <Suspense fallback={<BaseLoading message="Cargando sesiones..." />}>
            <SessionsPageClient />
        </Suspense>
    );
}
