'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '363073868682-tvls3e7t1lmr101js5sah0phn5aueeja.apps.googleusercontent.com';

export function GoogleOAuthWrapper({ children }: { children: React.ReactNode }) {
    if (!GOOGLE_CLIENT_ID) {
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            {children}
        </GoogleOAuthProvider>
    );
}
