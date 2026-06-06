// src/shared/hooks/useAuth.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const checkSession = useCallback(async () => {
    try {
      const LARAVEL_API =
        process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://127.0.0.1:8000/api';
      const token = localStorage.getItem('laravel_token');

      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch(`${LARAVEL_API}/auth/validate`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error de red al validar sesión:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return { isAuthenticated, loading, revalidateAuth: checkSession };
}
