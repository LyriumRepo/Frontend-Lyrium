export type AuditSeverity = 'info' | 'warning' | 'critical';

export type AuditSource = 'web' | 'api' | 'queue' | 'scheduler' | 'system';

export interface AuditActor {
  id: number | null;
  email: string | null;
  role: string | null;
}

export interface AuditAuditable {
  type: string;
  id: number;
}

export interface AuditLog {
  id: number;
  event: string;
  module: string;
  severity: AuditSeverity | null;
  description: string;
  source: AuditSource | null;
  session_id: string | null;
  request_method: string | null;
  request_url: string | null;
  response_code: number | null;
  correlation_id: string | null;
  ip_address: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: AuditActor;
  auditable: AuditAuditable | null;
}

export interface AuditLogFilters {
  module?: string;
  event?: string;
  severity?: AuditSeverity;
  ip?: string;
  source?: AuditSource;
  success?: boolean;
  user_id?: number;
  from?: string;
  to?: string;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface AuditStats {
  total: number;
  today: number;
  unique_ips_today: number;
  by_severity: Record<string, number>;
  by_module: Record<string, number>;
}

export interface AuditModule {
  module: string;
  events_count: number;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface AuditRealtimeResponse {
  events: AuditLog[];
  total: number;
}
