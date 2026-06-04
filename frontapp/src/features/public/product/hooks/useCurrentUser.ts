// hooks/useCurrentUser.ts
'use client';

import { useState, useEffect } from 'react';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// Reutiliza tu mismo mecanismo de token
let _tokenCache: { value: string | null; ts: number } | null = null;

async function getClientToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) return _tokenCache.value;
  try {
    const res = await fetch('/api/auth-token', {
      credentials: 'include',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    _tokenCache = { value: clean, ts: now };
    return clean;
  } catch {
    return null;
  }
}

export interface CurrentUser {
  id: number;
  name: string;
  avatar?: string;
  role?: string;
  roles?: string[];
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const token = await getClientToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${LARAVEL_API_URL}/users/me`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });
        if (res.ok) setUser(await res.json());
      } catch {
        /* silencioso */
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { user, loading };
}
