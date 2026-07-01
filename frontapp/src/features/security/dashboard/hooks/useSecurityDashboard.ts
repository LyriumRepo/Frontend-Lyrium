'use client';

import { useState, useEffect } from 'react';
import { adminSecurityRepository, SecurityStats, SecurityChartData, SecurityEventItem, LoginAttemptItem } from '@/shared/lib/api/adminSecurityRepository';

export function useSecurityDashboard() {
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [chartData, setChartData] = useState<SecurityChartData | null>(null);
  const [recentEvents, setRecentEvents] = useState<SecurityEventItem[]>([]);
  const [failedAttempts, setFailedAttempts] = useState<LoginAttemptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      adminSecurityRepository.getStats(),
      adminSecurityRepository.getChartData(),
      adminSecurityRepository.getActivity({ per_page: 5 }),
      adminSecurityRepository.getLoginAttempts({ status: 'failed', per_page: 5 }),
    ])
      .then(([statsRes, chartRes, activityRes, loginRes]) => {
        setStats(statsRes.data);
        setChartData(chartRes.data);
        setRecentEvents(activityRes.data);
        setFailedAttempts(loginRes.data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load() }, []);

  return { stats, chartData, recentEvents, failedAttempts, loading, error, refresh: load };
}
