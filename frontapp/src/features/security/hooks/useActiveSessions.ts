'use client';

import { useState, useEffect, useCallback } from 'react';

const LARAVEL_API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

export interface ActiveSession {
  id: number;
  name: string;
  last_used_at: string | null;
  created_at: string;
  is_current: boolean;
}

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('laravel_token') ?? '';
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Sin actividad reciente';
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Hace un momento';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}

function detectDevice(name: string): { dispositivo: string; icon: 'Monitor' | 'Smartphone' | 'Globe' } {
  const n = name.toLowerCase();
  if (n.includes('mobile') || n.includes('android') || n.includes('ios') || n.includes('iphone')) {
    return { dispositivo: 'Móvil', icon: 'Smartphone' };
  }
  if (n.includes('social') || n.includes('google')) {
    return { dispositivo: 'Google OAuth', icon: 'Globe' };
  }
  return { dispositivo: 'Navegador web', icon: 'Monitor' };
}

export function useActiveSessions() {
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    try {
      const res = await fetch(`${LARAVEL_API_URL}/users/profile/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        setSessions(json.data ?? []);
      }
    } catch {
      setError('No se pudieron cargar las sesiones.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const revokeSession = useCallback(async (id: number) => {
    const token = getToken();
    if (!token) return;

    setRevoking(id);
    try {
      const res = await fetch(`${LARAVEL_API_URL}/users/profile/sessions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
      } else {
        const json = await res.json();
        setError(json.message ?? 'No se pudo cerrar la sesión.');
      }
    } catch {
      setError('Error de conexión.');
    } finally {
      setRevoking(null);
    }
  }, []);

  const enriched = sessions.map(s => ({
    ...s,
    tiempo: s.is_current ? 'Sesión actual' : formatRelativeTime(s.last_used_at),
    ...detectDevice(s.name),
  }));

  return { sessions: enriched, loading, revoking, error, refresh: fetchSessions, revokeSession };
}
