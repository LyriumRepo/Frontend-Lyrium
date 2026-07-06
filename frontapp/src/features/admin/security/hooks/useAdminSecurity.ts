'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  adminSecurityRepository,
  SecurityStats,
  SecuritySessionItem,
  SecurityEventItem,
  LoginAttemptItem,
  PaginationMeta,
  SecurityChartData,
} from '@/shared/lib/api/adminSecurityRepository';

interface UseAdminSecurityReturn {
  stats: SecurityStats | null;
  statsLoading: boolean;
  statsError: string | null;

  chartData: SecurityChartData | null;
  chartLoading: boolean;

  sessions: SecuritySessionItem[];
  sessionsPagination: PaginationMeta | null;
  sessionsLoading: boolean;
  sessionsError: string | null;
  fetchSessions: (params?: Record<string, string | number | boolean | undefined>) => void;
  revokeSession: (id: string) => Promise<void>;

  events: SecurityEventItem[];
  eventsPagination: PaginationMeta | null;
  eventsLoading: boolean;
  eventsError: string | null;
  fetchEvents: (params?: Record<string, string | number | boolean | undefined>) => void;

  loginAttempts: LoginAttemptItem[];
  loginAttemptsPagination: PaginationMeta | null;
  loginAttemptsLoading: boolean;
  loginAttemptsError: string | null;
  fetchLoginAttempts: (params?: Record<string, string | number | boolean | undefined>) => void;

  refresh: () => void;
}

export function useAdminSecurity(): UseAdminSecurityReturn {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [chartData, setChartData] = useState<SecurityChartData | null>(null);
  const [chartLoading, setChartLoading] = useState(false);

  const [sessions, setSessions] = useState<SecuritySessionItem[]>([]);
  const [sessionsPagination, setSessionsPagination] = useState<PaginationMeta | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState<string | null>(null);

  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [eventsPagination, setEventsPagination] = useState<PaginationMeta | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [loginAttempts, setLoginAttempts] = useState<LoginAttemptItem[]>([]);
  const [loginAttemptsPagination, setLoginAttemptsPagination] = useState<PaginationMeta | null>(null);
  const [loginAttemptsLoading, setLoginAttemptsLoading] = useState(false);
  const [loginAttemptsError, setLoginAttemptsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const res = await adminSecurityRepository.getStats();
      setStats(res.data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Error al cargar estadísticas');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      const res = await adminSecurityRepository.getChartData();
      setChartData(res.data);
    } catch {
      // silently fail for charts
    } finally {
      setChartLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async (params?: Record<string, string | number | boolean | undefined>) => {
    setSessionsLoading(true);
    setSessionsError(null);
    try {
      const res = await adminSecurityRepository.getSessions(params);
      setSessions(res.data);
      setSessionsPagination(res.pagination);
    } catch (err) {
      setSessionsError(err instanceof Error ? err.message : 'Error al cargar sesiones');
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const revokeSession = useCallback(async (id: string) => {
    await adminSecurityRepository.revokeSession(id);
    await fetchSessions();
  }, [fetchSessions]);

  const fetchEvents = useCallback(async (params?: Record<string, string | number | boolean | undefined>) => {
    setEventsLoading(true);
    setEventsError(null);
    try {
      const res = await adminSecurityRepository.getActivity(params);
      setEvents(res.data);
      setEventsPagination(res.pagination);
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Error al cargar actividad');
    } finally {
      setEventsLoading(false);
    }
  }, []);

  const fetchLoginAttempts = useCallback(async (params?: Record<string, string | number | boolean | undefined>) => {
    setLoginAttemptsLoading(true);
    setLoginAttemptsError(null);
    try {
      const res = await adminSecurityRepository.getLoginAttempts(params);
      setLoginAttempts(res.data);
      setLoginAttemptsPagination(res.pagination);
    } catch (err) {
      setLoginAttemptsError(err instanceof Error ? err.message : 'Error al cargar intentos de login');
    } finally {
      setLoginAttemptsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    loadStats();
    loadChartData();
    fetchSessions({ per_page: 10 });
    fetchEvents({ per_page: 10 });
    fetchLoginAttempts({ per_page: 10 });
  }, [loadStats, loadChartData, fetchSessions, fetchEvents, fetchLoginAttempts]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    stats,
    statsLoading,
    statsError,
    chartData,
    chartLoading,
    sessions,
    sessionsPagination,
    sessionsLoading,
    sessionsError,
    fetchSessions,
    revokeSession,
    events,
    eventsPagination,
    eventsLoading,
    eventsError,
    fetchEvents,
    loginAttempts,
    loginAttemptsPagination,
    loginAttemptsLoading,
    loginAttemptsError,
    fetchLoginAttempts,
    refresh,
  };
}
