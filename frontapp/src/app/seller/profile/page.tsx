import { Suspense } from 'react';
import { ProfilePageClient } from '@/features/seller/profile/ProfilePageClient';
import BaseLoading from '@/components/ui/BaseLoading';

export default async function ProfilePage() {
    // TODO Tarea 3: Cuando se implemente la API real, obtener datos aquí
    
    return (
        <Suspense fallback={<BaseLoading message="Cargando perfil..." />}>
            <ProfilePageClient />
        </Suspense>
    );
}
