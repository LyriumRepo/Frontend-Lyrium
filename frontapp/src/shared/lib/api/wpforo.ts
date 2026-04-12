const WP_FORO_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://lyriumbiomarketplace.com/wp-json';

async function wpForoFetch(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${WP_FORO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Error ${res.status}`);
  }
  
  return res.json();
}

export const wpForoApi = {
  baseUrl: WP_FORO_API_URL,

  // Foros/Categorías
  async getForums() {
    return wpForoFetch('/wpforo/v1/forums');
  },

  // Temas - Listar
  async getTopics(params?: { forum?: number; page?: number }) {
    const query = new URLSearchParams();
    if (params?.forum) query.set('forum', params.forum.toString());
    if (params?.page) query.set('page', params.page.toString());
    
    return wpForoFetch(`/wpforo/v1/topics?${query}`);
  },

  // Tema - Obtener uno
  async getTopic(topicId: number) {
    return wpForoFetch(`/wpforo/v1/topics/${topicId}`);
  },

  // Tema - Crear nuevo
  async createTopic(data: { forumid: number; title: string; content: string }, cookie?: string) {
    return wpForoFetch('/wpforo/v1/topics', {
      method: 'POST',
      headers: cookie ? { Cookie: cookie } : {},
      body: JSON.stringify(data),
    });
  },

  // Posts/Respuestas - Listar
  async getPosts(topicId: number) {
    return wpForoFetch(`/wpforo/v1/posts?topic_id=${topicId}`);
  },

  // Posts - Crear respuesta
  async createPost(data: { topicid: number; content: string; reply_to?: number }, cookie?: string) {
    return wpForoFetch('/wpforo/v1/posts', {
      method: 'POST',
      headers: cookie ? { Cookie: cookie } : {},
      body: JSON.stringify(data),
    });
  },

  // Votos/Reacciones
  async setVote(postId: number, type: 'up' | 'down', cookie?: string) {
    return wpForoFetch('/wpforo/v1/votes', {
      method: 'POST',
      headers: cookie ? { Cookie: cookie } : {},
      body: JSON.stringify({
        post_id: postId,
        type,
      }),
    });
  },

  // Usuario actual
  async getCurrentUser() {
    return wpForoFetch('/wp/v2/users/me');
  },
};
