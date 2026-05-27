'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/shared/types/auth';
import { loginAction, logoutAction, loginWithSocialAction } from '@/shared/lib/actions/auth';
import { getRoleBasedRoute } from '@/shared/lib/config/auth';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (credentials: { username: string; password: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    loginWithSocial: (provider: string, credential: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchSession = async (): Promise<{ authenticated: boolean; user: User | null }> => {
    const response = await fetch('/api/auth/session');
    if (!response.ok) {
        console.log('[Auth] Session fetch failed:', response.status);
        return { authenticated: false, user: null };
    }
    const data = await response.json();
    console.log('[Auth] Session fetch result:', data);
    return data;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const { isLoading: loading, data: sessionData, refetch } = useQuery({
        queryKey: ['auth', 'session'],
        queryFn: fetchSession,
        staleTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    useEffect(() => {
        console.log('[Auth] Session effect - loading:', loading, 'sessionData:', sessionData);
        if (!loading && sessionData) {
            if (sessionData.authenticated && sessionData.user) {
                console.log('[Auth] Setting user from session:', sessionData.user);
                setUser(sessionData.user);
            } else {
                console.log('[Auth] Clearing user - not authenticated');
                setUser(null);
            }
        }
    }, [loading, sessionData]);

    useEffect(() => {
        if (!loading) {
            // Use sessionData as source of truth — it's in sync with `loading`.
            // `user` state lags one render behind sessionData due to setUser being async.
            const effectiveUser = sessionData?.authenticated ? sessionData.user : user;
            const isAuthPath = pathname === '/login';
            const isProtectedPath = pathname.startsWith('/admin') ||
                               pathname.startsWith('/seller') ||
                               pathname.startsWith('/customer') ||
                               pathname.startsWith('/logistics');

            if (!effectiveUser && isProtectedPath) {
                router.push('/login');
            } else if (effectiveUser && isAuthPath) {
                const targetRoute = getRoleBasedRoute(effectiveUser.role);
                router.push(targetRoute);
            }
        }
    }, [pathname, user, loading, router, sessionData]);

    const login = async (credentials: { username: string; password: string }) => {
        setIsAuthLoading(true);
        try {
            console.log('[Auth] Starting login...');
            const result = await loginAction(credentials);
            console.log('[Auth] Login result:', result);
            
            if (!result.success) {
                return { success: false, error: result.error };
            }
            
            if (result.user && result.token) {
                console.log('[Auth] Server action set httpOnly cookies, verifying...');
                
                const targetRoute = getRoleBasedRoute(result.user.role);
                console.log('[Auth] Redirecting to:', targetRoute);
                
                setUser(result.user);
                window.location.href = targetRoute;
            }
            
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Error de conexión' };
        } finally {
            setIsAuthLoading(false);
        }
    };

    const logout = async () => {
        try {
            await logoutAction();
        } catch {
            // Continue even if server action fails
        }
        setUser(null);
        window.location.href = '/login';
    };

    const loginWithSocial = async (provider: string, credential: string) => {
        try {
            const result = await loginWithSocialAction(provider, credential);

            if (!result.success) {
                return { success: false, error: result.error };
            }

            if (result.user && result.token) {
                setUser(result.user);
                const targetRoute = getRoleBasedRoute(result.user.role);
                window.location.href = targetRoute;
            }

            return { success: true };
        } catch (error) {
            console.error('Social login error:', error);
            return { success: false, error: 'Error de conexión' };
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            isAuthenticated: !!user, 
            login, 
            logout,
            loginWithSocial
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
