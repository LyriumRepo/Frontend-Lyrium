'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '@/shared/lib/context/AuthContext';
import type { SocialProvider } from '@/shared/lib/api/socialAuthRepository';

interface SocialLoginButtonProps {
    provider: SocialProvider;
    onSuccess?: () => void;
    onError?: (error: string) => void;
    className?: string;
}

export function SocialLoginButton({
    provider,
    onSuccess,
    onError,
    className = '',
}: SocialLoginButtonProps) {
    const { loginWithSocial } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (provider === 'google') {
        return (
            <div className={`space-y-2 ${className}`}>
                <div className="flex justify-center">
                    <GoogleLogin
                        onSuccess={async (credentialResponse: CredentialResponse) => {
                            if (!credentialResponse.credential) {
                                const msg = 'No se recibió credencial de Google';
                                setError(msg);
                                onError?.(msg);
                                return;
                            }

                            setIsLoading(true);
                            setError(null);

                            try {
                                const result = await loginWithSocial('google', credentialResponse.credential);
                                if (result.success) {
                                    onSuccess?.();
                                } else {
                                    const errorMsg = result.error || 'Error de autenticación';
                                    setError(errorMsg);
                                    onError?.(errorMsg);
                                }
                            } catch (err) {
                                const errorMsg = err instanceof Error ? err.message : 'Error de autenticación';
                                setError(errorMsg);
                                onError?.(errorMsg);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        onError={() => {
                            const msg = 'Error al iniciar sesión con Google';
                            setError(msg);
                            onError?.(msg);
                        }}
                        width="400"
                        text="continue_with"
                        shape="rectangular"
                        size="large"
                    />
                </div>
                {isLoading && (
                    <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Conectando...</span>
                    </div>
                )}
                {error && (
                    <p className="text-red-500 text-xs text-center">{error}</p>
                )}
            </div>
        );
    }

    // Facebook — placeholder (no implementado aún)
    return (
        <div className={`space-y-2 ${className}`}>
            <button
                type="button"
                disabled
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm border transition-all duration-300 bg-[#1877F2] text-white border-[#1877F2] opacity-50 cursor-not-allowed"
            >
                <FacebookIcon className="w-5 h-5" />
                <span>Continuar con Facebook (próximamente)</span>
            </button>
        </div>
    );
}

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}
