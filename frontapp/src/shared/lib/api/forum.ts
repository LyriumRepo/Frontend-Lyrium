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
  image: string | null;
  created: string;
  author_name: string;
  user_id: number | null;
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
  user_id: number | null;
  author_name: string;
  content: string;
  created: string;
  reply_to?: number;
  reply_to_name?: string;
  reply_to_content?: string;
  votes_up: number;
  votes_down: number;
}

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
  const now = Date.now();
  if (_tokenCache && now - _tokenCache.ts < 30_000) return _tokenCache.value;
  try {
    const local = typeof window !== 'undefined' ? localStorage.getItem('laravel_token') : null;
    if (local) {
      const clean = local.replace(/^["']|["']$/g, '').trim() || null;
      if (clean) { _tokenCache = { value: clean, ts: now }; return clean; }
    }
    const res = await fetch('/api/auth-token', { credentials: 'include', cache: 'no-store' });
    if (!res.ok) return null;
    const { token } = await res.json();
    const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
    if (clean) _tokenCache = { value: clean, ts: now };
    return clean;
  } catch { return null; }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const token = await getAuthToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, {
    headers,
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

  updatePost: async (postId: number, content: string): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`${API_BASE}/respuestas/${postId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  deletePost: async (postId: number): Promise<{ success: boolean }> => {
    return apiFetch<{ success: boolean }>(`${API_BASE}/respuestas/${postId}`, {
      method: 'DELETE',
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
      const token = await getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/backend/api/users/me', { headers });
      const json = await res.json();
      if (json.data) return json.data;
      return { id: json.id ?? null, name: json.display_name ?? json.nicename ?? null, username: json.username ?? null };
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
