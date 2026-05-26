import { Suspense } from 'react';
import { ForgotPasswordPageClient } from '@/features/auth/forgot-password/ForgotPasswordPageClient';

export const metadata = {
    title: 'Recuperar contraseña | Lyrium Biomarketplace',
};

export default function ForgotPasswordPage() {
    return (
        <Suspense>
            <ForgotPasswordPageClient />
        </Suspense>
    );
}