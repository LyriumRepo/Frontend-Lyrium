export type SecurityModule = 'audit' | 'sessions' | 'protection' | 'ips' | 'alerts' | 'cloudflare' | 'settings';

export interface SecurityStatus {
  status: 'operational' | 'warning' | 'critical';
  role: string;
  modules: SecurityModule[];
}
