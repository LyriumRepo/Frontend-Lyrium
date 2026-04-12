import { apiClient } from './apiClient';

export interface Notification {
  id: string;
  type: string;
  read_at: string | null;
  created_at: string;
  ticket_id: number | null;
  ticket_number: string | null;
  subject: string | null;
  message_preview: string | null;
  sender_name: string | null;
  old_status: string | null;
  new_status: string | null;
  priority: string | null;
  category: string | null;
  vendor_name: string | null;
  is_read: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unread_count: number;
  meta: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

const emptyResponse: NotificationsResponse = {
  success: true,
  data: [],
  unread_count: 0,
  meta: {
    current_page: 1,
    last_page: 1,
    total: 0,
  },
};

const handleApiError = <T>(error: unknown, fallback: T): T => {
  console.error('Notification API Error:', error);
  return fallback;
};

export const notificationRepository = {
  getAll: async (): Promise<NotificationsResponse> => {
    try {
      return await apiClient<NotificationsResponse>('/notifications');
    } catch (error) {
      return handleApiError(error, emptyResponse);
    }
  },

  getById: async (id: string): Promise<{ success: boolean; data: Notification } | null> => {
    try {
      return await apiClient<{ success: boolean; data: Notification }>(`/notifications/${id}`);
    } catch (error) {
      return handleApiError(error, null);
    }
  },

  markAsRead: async (id: string): Promise<{ success: boolean; message: string } | null> => {
    try {
      return await apiClient<{ success: boolean; message: string }>(`/notifications/${id}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      return handleApiError(error, null);
    }
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string } | null> => {
    try {
      return await apiClient<{ success: boolean; message: string }>('/notifications/read-all', {
        method: 'POST',
      });
    } catch (error) {
      return handleApiError(error, null);
    }
  },

  delete: async (id: string): Promise<{ success: boolean; message: string } | null> => {
    try {
      return await apiClient<{ success: boolean; message: string }>(`/notifications/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      return handleApiError(error, null);
    }
  },
};
