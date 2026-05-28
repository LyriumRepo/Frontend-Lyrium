// src/store/authStore.ts
import { create } from 'zustand';
import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Mismo cache de token que useCurrentUser ─────────────────────────────────
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

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  showCheckoutModal: boolean;
  validate: () => Promise<void>;
  invalidateCache: () => void;
  setShowCheckoutModal: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  loading: true,
  showCheckoutModal: false,

  validate: async () => {
    set({ loading: true });
    try {
      // 1. Leer token desde cookie HttpOnly via Route Handler de Next.js
      const token = await getClientToken();

      if (!token) {
        // Sin token = no autenticado, sin necesidad de llamar a Laravel
        set({ isAuthenticated: false, loading: false });
        return;
      }

      // 2. Validar con Bearer token, igual que adminSellerRepository
      const res = await fetch(`${LARAVEL_API_URL}/auth/validate`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        cache: 'no-store',
      });

      set({ isAuthenticated: res.ok, loading: false });
    } catch {
      set({ isAuthenticated: false, loading: false });
    }
  },

  // Llamar después del login para forzar re-fetch del token
  invalidateCache: () => {
    _tokenCache = null;
  },

  setShowCheckoutModal: (v) => set({ showCheckoutModal: v }),
}));
