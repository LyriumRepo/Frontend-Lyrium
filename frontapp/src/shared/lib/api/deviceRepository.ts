import { LARAVEL_API_URL } from '@/shared/lib/config/flags';
import { getAuthHeaders } from './token-store';

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

export const deviceApi = {
  register: async (fcmToken: string, platform?: string, deviceName?: string): Promise<void> => {
    await request('/devices', {
      method: 'POST',
      body: JSON.stringify({
        fcm_token: fcmToken,
        platform: platform || 'web',
        device_name: deviceName || undefined,
      }),
    });
  },

  unregister: async (fcmToken: string): Promise<void> => {
    await request('/devices', {
      method: 'DELETE',
      body: JSON.stringify({ fcm_token: fcmToken }),
    });
  },
};
