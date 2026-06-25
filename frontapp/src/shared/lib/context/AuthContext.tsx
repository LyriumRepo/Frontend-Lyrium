'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/shared/types/auth';
import {
  loginAction,
  logoutAction,
  loginWithSocialAction,
} from '@/shared/lib/actions/auth';
import { getRoleBasedRoute } from '@/shared/lib/config/auth';

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: {
    username: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loginWithSocial: (
    provider: string,
    credential: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fetchSession = async (): Promise<{
  authenticated: boolean;
  user: User | null;
}> => {
  const token = localStorage.getItem('laravel_token');

  if (!token) {
    return { authenticated: false, user: null };
  }

  const response = await fetch(`${LARAVEL_API_URL}/auth/validate`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.log('[Auth] Session fetch failed:', response.status);
    return { authenticated: false, user: null };
  }

  const data = await response.json();
  console.log('[Auth] Session fetch result:', data);

  return { authenticated: true, user: data };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false); // ← nuevo
  const router = useRouter();
  const pathname = usePathname();

  const { isLoading: loading, data: sessionData } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Sincroniza el user con la query
  useEffect(() => {
    if (!loading) {
      setIsHydrated(true);
      if (sessionData?.authenticated && sessionData.user) {
        setUser(sessionData.user);
      } else {
        setUser(null);
      }
    }
  }, [loading, sessionData]);

  // Redirecciones — solo actúa cuando la query ya hidrat ó
  useEffect(() => {
    if (!loading && isHydrated) {
      // ← espera a que fetchSession haya respondido
      const effectiveUser = sessionData?.authenticated
        ? sessionData.user
        : user;
      const isAuthPath = pathname === '/login';
      const isProtectedPath =
        pathname.startsWith('/admin') ||
        pathname.startsWith('/seller') ||
        pathname.startsWith('/customer') ||
        pathname.startsWith('/logistics') ||
        pathname.startsWith('/security');

      if (!effectiveUser && isProtectedPath) {
        router.push('/login');
      } else if (effectiveUser && isAuthPath) {
        const targetRoute = getRoleBasedRoute(effectiveUser.role);
        router.push(targetRoute);
      }
    }
  }, [pathname, user, loading, isHydrated, router, sessionData]);

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
        localStorage.setItem('laravel_token', result.token);
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
      // Continúa aunque falle el server action
    }
    localStorage.removeItem('laravel_token');
    setUser(null);
    setIsHydrated(false); // ← resetea para el próximo login
    window.location.href = '/login';
  };

  const loginWithSocial = async (provider: string, credential: string) => {
    try {
      const result = await loginWithSocialAction(provider, credential);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      if (result.user && result.token) {
        localStorage.setItem('laravel_token', result.token);
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
    <AuthContext.Provider
      value={{
        user,
        loading: loading || !isHydrated, // ← loading verdadero hasta que hidrate
        isAuthenticated: !!user,
        login,
        logout,
        loginWithSocial,
      }}
    >
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
