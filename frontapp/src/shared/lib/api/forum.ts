import {
  categories,
  topics as mockTopics,
  posts as mockPosts,
  getTopicById,
  getTopicsByCategory,
  getPostsByTopic,
  getStats,
} from '@/data/bioforo';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';

const API_BASE = '/api/bioforo';

export interface ForumTopic {
  id: number;
  topic_id?: number;
  title?: { rendered?: string };
  topic_subject?: string;
  topic_content?: string;
  content?: string;
  created?: string;
  topic_created?: string;
  author_name?: string;
  topic_author_name?: string;
  forum_id?: number;
  forum_name?: string;
  cat_nombre?: string;
  category_name?: string;
  likes_count?: number;
  love_count?: number;
  haha_count?: number;
  wow_count?: number;
  sad_count?: number;
  angry_count?: number;
  total_reacciones?: number;
  votes_count?: number;
  reply_count?: number;
  views?: number;
  user_reaction?: string | null;
  slug?: string;
  votes_up?: number;
  votes_down?: number;
}

export interface ForumPost {
  id: number;
  post_id?: number;
  topic_id?: number;
  author_name?: string;
  post_content?: string;
  content?: string;
  created?: string;
  topic_created?: string;
  reply_to?: number;
  reply_to_name?: string;
  reply_to_content?: string;
  likes_count?: number;
  angry_count?: number;
  votes_up?: number;
  votes_down?: number;
}

function mapTopicToForumTopic(topic: any): ForumTopic {
  return {
    id: topic.id,
    topic_id: topic.id,
    title: { rendered: topic.titulo },
    topic_subject: topic.titulo,
    topic_content: topic.contenido,
    content: topic.contenido,
    created: topic.created,
    topic_created: topic.created,
    author_name: topic.autor,
    topic_author_name: topic.autor,
    forum_id: topic.categoria_id,
    forum_name: topic.cat_nombre,
    cat_nombre: topic.cat_nombre,
    category_name: topic.cat_nombre,
    likes_count: topic.likes_count,
    love_count: topic.love_count,
    haha_count: topic.haha_count,
    wow_count: topic.wow_count,
    sad_count: topic.sad_count,
    angry_count: topic.angry_count,
    total_reacciones: topic.total_reacciones,
    votes_count: topic.total_reacciones,
    reply_count: topic.reply_count,
    views: topic.views,
    slug: `tema-${topic.id}`,
  };
}

export const forumApi = {
  getCategories: async () => {
    if (USE_MOCKS) {
      return Promise.resolve(categories);
    }
    const res = await fetch(`${API_BASE}/categories`);
    return res.json();
  },

  getTopics: async (params?: { forum?: number; page?: number }) => {
    if (USE_MOCKS) {
      const topicsList = getTopicsByCategory(params?.forum);
      return Promise.resolve(topicsList.map(mapTopicToForumTopic));
    }
    
    const query = new URLSearchParams();
    if (params?.forum) query.set('forum', params.forum.toString());
    if (params?.page) query.set('page', params.page.toString());
    
    const res = await fetch(`${API_BASE}/topics?${query}`);
    const data = await res.json();
    return data.map(mapTopicToForumTopic);
  },

  getTopic: async (id: number): Promise<ForumTopic | null> => {
    if (USE_MOCKS) {
      const topic = getTopicById(id);
      if (!topic) return null;
      return Promise.resolve(mapTopicToForumTopic(topic));
    }
    
    const res = await fetch(`${API_BASE}/topics/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return mapTopicToForumTopic(data);
  },

  createTopic: async (
    data: { forumid: number; title: string; content: string },
    cookie?: string
  ) => {
    if (USE_MOCKS) {
      console.log('Mock: Crear tema', data);
      return Promise.resolve({
        success: true,
        id: Date.now(),
        redirect: `?tema=${Date.now()}#tema-${Date.now()}`,
      });
    }
    
    const res = await fetch(`${API_BASE}/topics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(data),
    });
    
    return res.json();
  },

  getTopicPosts: async (topicId: number): Promise<ForumPost[]> => {
    if (USE_MOCKS) {
      const postsList = getPostsByTopic(topicId);
      return Promise.resolve(
        postsList.map((post) => ({
          id: post.id,
          post_id: post.id,
          topic_id: post.tema_id,
          author_name: post.autor,
          post_content: post.contenido,
          content: post.contenido,
          created: post.creado_en,
          topic_created: post.creado_en,
          reply_to: post.respuesta_a_id ?? undefined,
          reply_to_name: post.cita_autor,
          reply_to_content: post.cita_contenido,
          likes_count: post.likes_count,
          angry_count: post.angry_count,
          votes_up: post.likes_count,
          votes_down: post.angry_count,
        }))
      );
    }
    
    const res = await fetch(`${API_BASE}/topics/${topicId}/posts`);
    return res.json();
  },

  createPost: async (
    data: { topicid: number; content: string; reply_to?: number },
    cookie?: string
  ) => {
    if (USE_MOCKS) {
      console.log('Mock: Crear respuesta', data);
      return Promise.resolve({
        success: true,
        respuesta_id: Date.now(),
        autor: 'Usuario Demo',
        contenido: data.content,
        fecha: new Date().toISOString(),
        total_respuestas: 1,
      });
    }
    
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify(data),
    });
    
    return res.json();
  },

  setVote: async (
    postId: number,
    type: 'up' | 'down',
    cookie?: string
  ) => {
    if (USE_MOCKS) {
      console.log('Mock: Votar', postId, type);
      return Promise.resolve({
        success: true,
        action: 'added',
        user_reaction: type,
        counts: {
          likes_count: Math.floor(Math.random() * 10),
          angry_count: type === 'down' ? 1 : 0,
          total_reacciones: Math.floor(Math.random() * 15),
        },
      });
    }
    
    const res = await fetch(`${API_BASE}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { Cookie: cookie } : {}),
      },
      body: JSON.stringify({ post_id: postId, type }),
    });
    
    return res.json();
  },

  getCurrentUser: async () => {
    if (USE_MOCKS) {
      return Promise.resolve({
        id: 999,
        name: 'Usuario Demo',
        username: 'demo_user',
      });
    }
    
    const res = await fetch('/api/auth/session');
    return res.json();
  },

  getStats: async () => {
    if (USE_MOCKS) {
      return Promise.resolve(getStats());
    }
    
    const res = await fetch(`${API_BASE}/stats`);
    return res.json();
  },
};
