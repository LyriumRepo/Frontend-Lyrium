export interface SecurityStats {
  active_users: number;
  total_users: number;
  active_sessions: number;
  failed_logins_today: number;
  success_logins_today: number;
  banned_users: number;
  events_today: number;
  blocked_ips: number;
}

export interface SecuritySessionItem {
  id: string;
  user_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  device: string;
  browser: string;
  last_activity: string;
  is_active: boolean;
  user?: { id: number; name: string; email: string } | null;
}

export interface SecurityEventItem {
  id: number;
  event_type: string;
  description: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
}

export interface LoginAttemptItem {
  id: number;
  email: string;
  ip_address: string | null;
  status: 'success' | 'failed';
  created_at: string;
  user?: { id: number; name: string; email: string } | null;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}
