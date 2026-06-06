import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';
import type { ApiResponse } from './base-client';

export interface NotificationSettings {
  id: number;
  user_id: number;
  email_order: boolean;
  email_promotions: boolean;
  email_newsletter: boolean;
  push_notifications: boolean;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${LARAVEL_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      ...headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
    throw new Error(error.message || error.error || `API Error: ${response.status}`);
  }
  if (response.status === 204) return {} as T;
  const text = await response.text();
  return text ? JSON.parse(text) : {} as T;
}

export const settingsApi = {
  get: async (): Promise<NotificationSettings> => {
    const response = await request<ApiResponse<NotificationSettings>>('/users/settings');
    return response.data!;
  },

  update: async (payload: Partial<NotificationSettings>): Promise<NotificationSettings> => {
    const response = await request<ApiResponse<NotificationSettings>>('/users/settings', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return response.data!;
  },
};
