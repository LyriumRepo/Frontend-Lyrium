'use client';

import {
  categories as mockCategories,
  topics as mockTopics,
  posts as mockPosts,
  getTopicById,
  getTopicsByCategory,
  getPostsByTopic,
  getStats as getMockStats,
} from '@/data/bioforo';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';
const API_BASE = '/api/forum';

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

function mapMockCategory(cat: any): ForumCategory {
  return {
    id: cat.id,
    name: cat.nombre || cat.name || '',
    slug: cat.slug || '',
  };
}

function mapMockTopic(topic: any): ForumTopic {
  return {
    id: topic.id,
    title: topic.titulo || topic.title || '',
    content: topic.contenido || topic.content || '',
    created: topic.created || '',
    author_name: topic.autor || topic.author_name || topic.anonimo_nombre || 'Anónimo',
    forum_id: topic.categoria_id || topic.forum_id,
    forum_name: topic.cat_nombre || topic.forum_name || '',
    reply_count: topic.reply_count || 0,
    views: topic.views || 0,
    votes_up: topic.likes_count || topic.votes_up || 0,
    votes_down: topic.angry_count || topic.votes_down || 0,
    slug: topic.slug || `tema-${topic.id}`,
  };
}

function mapMockPost(post: any): ForumPost {
  return {
    id: post.id,
    topic_id: post.tema_id || post.topic_id,
    author_name: post.autor || post.author_name || post.anonimo_nombre || 'Anónimo',
    content: post.contenido || post.content || '',
    created: post.creado_en || post.created || '',
    reply_to: post.respuesta_a_id || post.reply_to || undefined,
    reply_to_name: post.cita_autor || post.reply_to_name || undefined,
    reply_to_content: post.cita_contenido || post.reply_to_content || undefined,
    votes_up: post.likes_count || post.votes_up || 0,
    votes_down: post.angry_count || post.votes_down || 0,
  };
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

  // Handle both { success: true, data: ... } and raw response format
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const forumApi = {
  getCategories: async (): Promise<ForumCategory[]> => {
    if (USE_MOCKS) {
      return Promise.resolve(mockCategories.map(mapMockCategory));
    }
    return apiFetch<ForumCategory[]>(`${API_BASE}/categories`);
  },

  getTopics: async (params?: { forum?: number }): Promise<ForumTopic[]> => {
    if (USE_MOCKS) {
      const topicsList = getTopicsByCategory(params?.forum);
      return Promise.resolve(topicsList.map(mapMockTopic));
    }
    const query = params?.forum ? `?forum=${params.forum}` : '';
    return apiFetch<ForumTopic[]>(`${API_BASE}/topics${query}`);
  },

  getTopic: async (id: number): Promise<ForumTopic | null> => {
    if (USE_MOCKS) {
      const topic = getTopicById(id);
      if (!topic) return null;
      return Promise.resolve(mapMockTopic(topic));
    }
    try {
      return await apiFetch<ForumTopic>(`${API_BASE}/topics/${id}`);
    } catch {
      return null;
    }
  },

  createTopic: async (
    data: { forumid: number; title: string; content: string },
  ): Promise<{ success: boolean; id?: number }> => {
    if (USE_MOCKS) {
      console.log('Mock: Crear tema', data);
      const newTopic = {
        id: Date.now(),
        categoria_id: data.forumid,
        usuario_id: 999,
        anonimo_nombre: null,
        rol: 'vendedor',
        titulo: data.title,
        contenido: data.content,
        created: new Date().toISOString().replace('T', ' ').substring(0, 19),
        estado: 'activo',
        likes_count: 0,
        love_count: 0,
        haha_count: 0,
        wow_count: 0,
        sad_count: 0,
        angry_count: 0,
        total_reacciones: 0,
        reply_count: 0,
        views: 1,
        cat_nombre: mockCategories.find(c => c.id === data.forumid)?.nombre || 'General',
        autor: 'Usuario Demo',
      };
      mockTopics.push(newTopic);
      return Promise.resolve({ success: true, id: newTopic.id });
    }
    return apiFetch<{ success: boolean; id?: number }>(`${API_BASE}/topics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTopicPosts: async (topicId: number): Promise<ForumPost[]> => {
    if (USE_MOCKS) {
      const postsList = getPostsByTopic(topicId);
      return Promise.resolve(postsList.map(mapMockPost));
    }
    return apiFetch<ForumPost[]>(`${API_BASE}/topics/${topicId}/posts`);
  },

  createPost: async (
    data: { topicid: number; content: string; reply_to?: number },
  ): Promise<{ success: boolean }> => {
    if (USE_MOCKS) {
      console.log('Mock: Crear respuesta', data);
      const newPost = {
        id: Date.now(),
        tema_id: data.topicid,
        usuario_id: 999,
        anonimo_nombre: null,
        rol: 'vendedor',
        contenido: data.content,
        respuesta_a_id: data.reply_to || null,
        creado_en: new Date().toISOString().replace('T', ' ').substring(0, 19),
        estado: 'activo',
        likes_count: 0,
        angry_count: 0,
        autor: 'Usuario Demo',
        cita_autor: data.reply_to ? (mockPosts.find(p => p.id === data.reply_to)?.autor || 'Anónimo') : undefined,
        cita_contenido: data.reply_to ? (mockPosts.find(p => p.id === data.reply_to)?.contenido || '') : undefined,
      };
      mockPosts.push(newPost);
      
      const topic = mockTopics.find(t => t.id === data.topicid);
      if (topic) {
        topic.reply_count = (topic.reply_count || 0) + 1;
      }
      return Promise.resolve({ success: true });
    }
    return apiFetch<{ success: boolean }>(`${API_BASE}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  setVote: async (
    postId: number,
    type: 'up' | 'down',
  ): Promise<{ success: boolean }> => {
    if (USE_MOCKS) {
      console.log('Mock: Votar', postId, type);
      const post = mockPosts.find(p => p.id === postId);
      if (post) {
        if (type === 'up') {
          post.likes_count = (post.likes_count || 0) + 1;
        } else {
          post.angry_count = (post.angry_count || 0) + 1;
        }
      } else {
        const topic = mockTopics.find(t => t.id === postId);
        if (topic) {
          if (type === 'up') {
            topic.likes_count = (topic.likes_count || 0) + 1;
            topic.total_reacciones = (topic.total_reacciones || 0) + 1;
          } else {
            topic.angry_count = (topic.angry_count || 0) + 1;
            topic.total_reacciones = (topic.total_reacciones || 0) + 1;
          }
        }
      }
      return Promise.resolve({ success: true });
    }
    return apiFetch<{ success: boolean }>(`${API_BASE}/reactions`, {
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
    if (USE_MOCKS) {
      const mockStats = getMockStats();
      return Promise.resolve({
        totalTopics: mockStats.total_topics,
        totalReplies: mockStats.total_posts,
        onlineUsers: mockStats.usuarios_en_linea,
      });
    }
    const data = await apiFetch<{
      totalTopics: number;
      totalReplies: number;
      onlineUsers: number;
    }>(`${API_BASE}/stats`);
    return data;
  },
};
