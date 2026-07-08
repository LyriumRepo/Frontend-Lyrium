export interface CloudflareZone {
    id: string;
    name: string;
    status: string;
    paused: boolean;
    type: string;
    name_servers: string[];
    plan: string | null;
    created_on: string;
    modified_on: string;
}

export interface CloudflareAnalyticsTotals {
    requests: number;
    bandwidth: number;
    threats: number;
    page_views: number;
    uniques: number;
    requests_cached: number;
    requests_uncached: number;
    status_200: number;
    status_300: number;
    status_400: number;
    status_500: number;
}

export interface CloudflareAnalyticsTimeseries {
    since: string;
    until: string;
    requests: number;
    bandwidth: number;
    threats: number;
    page_views: number;
    uniques: number;
}

export interface CloudflareAnalytics {
    totals: CloudflareAnalyticsTotals;
    timeseries: CloudflareAnalyticsTimeseries[];
    since: string;
    until: string;
}

export interface CloudflareFirewallEvent {
    id: string;
    action: string;
    kind: string;
    source: string;
    ip_address: string;
    country: string | null;
    ray_id: string;
    host: string;
    method: string;
    path: string;
    protocol: string;
    user_agent: string | null;
    http_response_code: number;
    occurred_at: string;
}

export interface CloudflareDNSRecord {
    id: string;
    type: string;
    name: string;
    content: string;
    ttl: number;
    proxied: boolean;
    priority: number | null;
    created_on: string;
    modified_on: string;
    comment: string | null;
    tags: string[];
}

export interface CloudflareSecurity {
    total_threats: number;
    total_blocked: number;
    total_challenges: number;
    unique_ips: number;
    recent_event_count: number;
    recent_events: CloudflareFirewallEvent[];
    since: string;
    until: string;
}

export interface CloudflareStatus {
    status: string;
    zone: string;
    zone_status: string;
    account_id: string;
    permissions: string[];
}

export interface CloudflareDashboard {
    status: CloudflareStatus | null;
    zone: CloudflareZone | null;
    analytics: CloudflareAnalytics | null;
    security: CloudflareSecurity | null;
    loading: boolean;
    error: string | null;
}
