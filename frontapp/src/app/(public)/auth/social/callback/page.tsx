'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Esta página ya no se usa para Google Auth (ahora usa Google Identity Services).
 * Se mantiene como fallback que redirige al login.
 */
export default function SocialCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[var(--bg-primary)]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
                <p className="text-gray-600 dark:text-[var(--text-secondary)]">
                    Redirigiendo...
                </p>
            </div>
        </div>
    );
}
