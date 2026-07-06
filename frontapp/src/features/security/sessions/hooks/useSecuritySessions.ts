'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminSecurityRepository, SecuritySessionItem, PaginationMeta } from '@/shared/lib/api/adminSecurityRepository';

export function useSecuritySessions() {
  const [sessions, setSessions] = useState<SecuritySessionItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback((params: Record<string, string | number | boolean | undefined> = {}) => {
    setLoading(true);
    setError(null);
    adminSecurityRepository.getSessions({ per_page: 15, ...params })
      .then((res) => { setSessions(res.data); setPagination(res.pagination) })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch() }, [fetch]);

  const revoke = useCallback(async (id: string) => {
    await adminSecurityRepository.revokeSession(id);
    fetch();
  }, [fetch]);

  return { sessions, pagination, loading, error, fetch, revoke };
}
