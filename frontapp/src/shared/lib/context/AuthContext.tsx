'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  showCheckoutModal: boolean;
  setShowCheckoutModal: (v: boolean) => void;
  invalidateTokenCache: () => void;
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(`${LARAVEL_API_URL}/auth/validate`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    clearTimeout(timer);

    if (!response.ok) {
      return { authenticated: false, user: null };
    }

    const data = await response.json();
    try { localStorage.setItem('lyrium_user_cache', JSON.stringify(data)); } catch {}
    return { authenticated: true, user: data };
  } catch {
    clearTimeout(timer);
    // API offline o timeout — usar datos de usuario en caché si existen
    try {
      const cached = localStorage.getItem('lyrium_user_cache');
      if (cached) {
        return { authenticated: true, user: JSON.parse(cached) as User };
      }
    } catch {}
    return { authenticated: false, user: null };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const wasAuthenticatedRef = useRef(false);

  const { isLoading: loading, data: sessionData } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: fetchSession,
    staleTime: 5 * 60_000,
    retry: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    // Polling de respaldo: detecta una sesión revocada aunque el usuario
    // no haga click en nada y el WebSocket (Reverb) no haya conectado.
    refetchInterval: 30_000,
  });

  // Sincroniza el user con la query
  useEffect(() => {
    if (!loading) {
      setIsHydrated(true);
      if (sessionData?.authenticated && sessionData.user) {
        wasAuthenticatedRef.current = true;
        setUser(sessionData.user);
      } else {
        // Si veníamos autenticados y el validate ahora dice que no,
        // la sesión fue revocada (o expiró) — expulsar sin depender de un click.
        if (wasAuthenticatedRef.current) {
          wasAuthenticatedRef.current = false;
          localStorage.removeItem('laravel_token');
          localStorage.removeItem('lyrium_user_cache');
          setUser(null);
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?reason=revoked';
          }
          return;
        }
        setUser(null);
      }
    }
  }, [loading, sessionData]);

  // Fallback global: si CUALQUIER request a la API Laravel devuelve 401
  // (token revocado/expirado), cierra sesión y redirige a /login.
  // No depende del WebSocket (Reverb) — cubre el caso en que el evento
  // en tiempo real de SessionRevoked no llegó (Reverb caído, socket
  // desconectado, host mal configurado, etc.).
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch.bind(window);

    window.fetch = async (...args: Parameters<typeof fetch>) => {
      const response = await originalFetch(...args);

      if (response.status === 401) {
        const input = args[0];
        const url = typeof input === 'string'
          ? input
          : input instanceof Request
            ? input.url
            : input.toString();

        const hadToken = !!localStorage.getItem('laravel_token');

        if (url.startsWith(LARAVEL_API_URL) && hadToken) {
          localStorage.removeItem('laravel_token');
          localStorage.removeItem('lyrium_user_cache');
          setUser(null);

          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login?reason=revoked';
          }
        }
      }

      return response;
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Redirecciones — solo actúa cuando la query ya hidrat ó
  useEffect(() => {
    if (!loading && isHydrated) {
      // ← espera a que fetchSession haya respondido
      const effectiveUser = sessionData?.authenticated
        ? sessionData.user
        : user;
      const isVendorRegistration =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('mode') === 'vendor';
      const isAuthPath = pathname === '/login' && !isVendorRegistration;
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

  const login = useCallback(async (credentials: { username: string; password: string }) => {
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
        try { localStorage.setItem('lyrium_user_cache', JSON.stringify(result.user)); } catch {}
        const targetRoute = getRoleBasedRoute(result.user.role);
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
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutAction();
    } catch {
      // Continúa aunque falle el server action
    }
    localStorage.removeItem('laravel_token');
    localStorage.removeItem('lyrium_user_cache');
    setUser(null);
    setIsHydrated(false); // ← resetea para el próximo login
    window.location.href = '/login';
  }, []);

  const loginWithSocial = useCallback(async (provider: string, credential: string) => {
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
  }, []);

  const invalidateTokenCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
  }, [queryClient]);

  const contextValue = useMemo(() => ({
    user,
    loading: loading || !isHydrated,
    isAuthenticated: !!user,
    showCheckoutModal,
    setShowCheckoutModal,
    invalidateTokenCache,
    login,
    logout,
    loginWithSocial,
  }), [user, loading, isHydrated, showCheckoutModal, setShowCheckoutModal, invalidateTokenCache, login, logout, loginWithSocial]);

  return (
    <AuthContext.Provider value={contextValue}>
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
