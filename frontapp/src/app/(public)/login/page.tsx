'use client';

import { useSearchParams } from 'next/navigation';
import { AuthContainer } from '@/features/auth/components/AuthContainer';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const reason = searchParams.get('reason');

    return (
        <GoogleOAuthWrapper>
            <AuthContainer revokedReason={reason === 'revoked' ? 'Tu sesión fue revocada por un administrador.' : undefined} />
        </GoogleOAuthWrapper>
    );
}
