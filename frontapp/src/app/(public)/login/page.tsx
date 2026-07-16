'use client';

import { AuthContainer } from '@/features/auth/components/AuthContainer';
import { GoogleOAuthWrapper } from '@/components/providers/GoogleOAuthWrapper';

export default function LoginPage() {
    return (
        <GoogleOAuthWrapper>
            <AuthContainer />
        </GoogleOAuthWrapper>
    );
}
