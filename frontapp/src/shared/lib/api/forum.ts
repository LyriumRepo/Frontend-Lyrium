'use client';

const API_BASE = '/backend/api/foro';

export interface ForumCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ForumTopic {
  id: number;
  title: string;
  content: string;
  created: string;
  author_name: string;
  forum_id: number;
  forum_name: string;
  reply_count: number;
  views: number;
  votes_up: number;
  votes_down: number;
  slug: string;
}

export interface ForumPost {
  id: number;
  topic_id: number;
  author_name: string;
  content: string;
  created: string;
  reply_to?: number;
  reply_to_name?: string;
  reply_to_content?: string;
  votes_up: number;
  votes_down: number;
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.error || json.message || `Error ${res.status}`);
  }

  return json.data as T;
}

export const forumApi = {
  getCategories: async (): Promise<ForumCategory[]> => {
    return apiFetch<ForumCategory[]>(`${API_BASE}/categorias`);
  },

  getTopics: async (params?: { forum?: number }): Promise<ForumTopic[]> => {
    const query = params?.forum ? `?forum=${params.forum}` : '';
    return apiFetch<ForumTopic[]>(`${API_BASE}/temas${query}`);
  },

  getTopic: async (id: number): Promise<ForumTopic | null> => {
    try {
      return await apiFetch<ForumTopic>(`${API_BASE}/temas/${id}`);
    } catch {
      return null;
    }
  },

  createTopic: async (
    data: { forumid: number; title: string; content: string },
  ): Promise<{ success: boolean; id?: number }> => {
    return apiFetch<{ success: boolean; id?: number }>(`${API_BASE}/temas`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTopicPosts: async (topicId: number): Promise<ForumPost[]> => {
    return apiFetch<ForumPost[]>(`${API_BASE}/temas/${topicId}/respuestas`);
  },

  createPost: async (
    data: { topicid: number; content: string; reply_to?: number },
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`${API_BASE}/respuestas`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  setVote: async (
    postId: number,
    type: 'up' | 'down',
  ): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`${API_BASE}/votos`, {
      method: 'POST',
      body: JSON.stringify({ post_id: postId, type }),
    });
  },

  getCurrentUser: async () => {
    try {
      const res = await fetch('/backend/api/user', { credentials: 'include' });
      const json = await res.json();
      return json.data || { id: null, name: null, username: null };
    } catch {
      return { id: null, name: null, username: null };
    }
  },

  getStats: async () => {
    const data = await apiFetch<{
      totalTopics: number;
      totalReplies: number;
      onlineUsers: number;
    }>(`${API_BASE}/estadisticas`);
    return data;
  },
};
