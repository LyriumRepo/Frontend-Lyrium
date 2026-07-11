const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://localhost:8000/api';

export interface BlogPostApi {
    id: number;
    title: string;
    slug: string;
    summary: string;
    content: string;
    featured_image: string | null;
    author_name: string;
    is_published: boolean;
    is_featured: boolean;
    published_at: string | null;
    category: { id: number; name: string; slug: string } | null;
    store: { id: number; name: string; slug: string } | null;
    created_at: string | null;
}

export interface CommentApi {
    id: number;
    user_id: number | null;
    article_id: number | null;
    video_id: number | null;
    podcast_id: number | null;
    short_id: number | null;
    author_name: string;
    author_email: string;
    content: string;
    is_approved: boolean;
    created_at: string;
    can_edit?: boolean;
    can_delete?: boolean;
    user?: { id: number; display_name: string; avatar?: string | null } | null;
}

function cleanUrl(url: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('/storage/')) return `${LARAVEL_API_URL.replace('/api', '')}${url}`;
    if (url.startsWith('storage/')) return `${LARAVEL_API_URL.replace('/api', '')}/${url}`;
    return url;
}

function fixContentImageUrls(html: string): string {
    const baseUrl = LARAVEL_API_URL.replace('/api', '');
    return html.replace(/(<img[^>]+src\s*=\s*["'])\/(?!\/)/gi, `$1${baseUrl}/`);
}

function mapArticleFromApi(article: any): BlogPostApi {
    return {
        id: article.id,
        title: article.title,
        slug: article.slug,
        summary: article.summary ?? '',
        content: article.content ? fixContentImageUrls(article.content) : '',
        featured_image: cleanUrl(article.featured_image ?? null),
        author_name: article.author_name ?? article.store?.name ?? 'Lyrium BioMarketplace',
        is_published: article.is_published ?? false,
        is_featured: article.is_featured ?? false,
        published_at: article.published_at ?? null,
        category: article.category ?? null,
        store: article.store ?? null,
        created_at: article.created_at ?? null,
    };
}

async function fetchList<T>(url: string): Promise<T[]> {
    try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
            console.warn(`[blogApi] HTTP ${res.status} on GET ${url}`);
            return [];
        }
        const json = await res.json();
        if (!json.success) {
            console.warn(`[blogApi] !success on GET ${url}`);
            return [];
        }
        const data = json.data;
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        console.warn(`[blogApi] unexpected shape on GET ${url}`, json);
        return [];
    } catch (err) {
        console.warn(`[blogApi] fetch error on GET ${url}`, err);
        return [];
    }
}

async function fetchSingle<T>(url: string): Promise<T | null> {
    try {
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!res.ok) {
            console.warn(`[blogApi] HTTP ${res.status} on GET ${url}`);
            return null;
        }
        const json = await res.json();
        if (!json.success) {
            console.warn(`[blogApi] !success on GET ${url}`);
            return null;
        }
        return json.data ?? null;
    } catch (err) {
        console.warn(`[blogApi] fetch error on GET ${url}`, err);
        return null;
    }
}

const API = LARAVEL_API_URL;

export const blogApi = {
    getCategories: async () => {
        return fetchList<any>(`${API}/blog/categories`);
    },

    getPosts: async (categorySlug?: string): Promise<BlogPostApi[]> => {
        const params = new URLSearchParams({ per_page: '50' });
        if (categorySlug && categorySlug !== 'todos') params.set('category', categorySlug);
        const data = await fetchList<any>(`${API}/blog/posts?${params}`);
        return data.map(mapArticleFromApi);
    },

    getRecentPosts: async (limit: number = 6): Promise<BlogPostApi[]> => {
        const data = await fetchList<any>(`${API}/blog/posts/recent?limit=${limit}`);
        return data.map(mapArticleFromApi);
    },

    getFeaturedPosts: async (limit: number = 4): Promise<BlogPostApi[]> => {
        const data = await fetchList<any>(`${API}/blog/posts/featured?limit=${limit}`);
        return data.map(mapArticleFromApi);
    },

    getPostBySlug: async (slug: string): Promise<BlogPostApi | null> => {
        const article = await fetchSingle<any>(`${API}/blog/posts/${slug}`);
        return article ? mapArticleFromApi(article) : null;
    },

    getComments: async (params: { article_id?: number; post_id?: number; video_id?: number; podcast_id?: number; short_id?: number }): Promise<CommentApi[]> => {
        const query = new URLSearchParams();
        if (params.article_id) query.set('article_id', String(params.article_id));
        if (params.post_id) query.set('post_id', String(params.post_id));
        if (params.video_id) query.set('video_id', String(params.video_id));
        if (params.podcast_id) query.set('podcast_id', String(params.podcast_id));
        if (params.short_id) query.set('short_id', String(params.short_id));
        const headers: Record<string, string> = { 'Accept': 'application/json' };
        const token = typeof window !== 'undefined' ? localStorage.getItem('laravel_token') : null;
        if (token) headers['Authorization'] = `Bearer ${token}`;
        try {
            const res = await fetch(`${API}/blog/comments?${query}`, { headers });
            if (!res.ok) return [];
            const json = await res.json();
            if (!json.success) return [];
            const data = json.data;
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            return [];
        } catch {
            return [];
        }
    },

    getVideos: async () => {
        return fetchList<any>(`${API}/blog/videos`);
    },

    getVideo: async (id: number) => {
        return fetchSingle<any>(`${API}/blog/published-videos/${id}`);
    },

    getPodcasts: async () => {
        return fetchList<any>(`${API}/blog/podcasts`);
    },

    getPodcast: async (id: number) => {
        return fetchSingle<any>(`${API}/blog/published-podcasts/${id}`);
    },

    getShorts: async () => {
        return fetchList<any>(`${API}/blog/shorts`);
    },

    getShort: async (id: number) => {
        return fetchSingle<any>(`${API}/blog/published-shorts/${id}`);
    },

    createComment: async (data: {
        article_id?: number;
        video_id?: number;
        podcast_id?: number;
        short_id?: number;
        author_name?: string;
        author_email?: string;
        content: string;
    }) => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('laravel_token') : null;
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API}/blog/comments`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });
            return await res.json();
        } catch {
            return null;
        }
    },

    updateComment: async (id: number, data: { content: string }) => {
        try {
            const token = localStorage.getItem('laravel_token');
            if (!token) throw new Error('No autenticado');
            const res = await fetch(`${API}/blog/comments/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(data),
            });
            return await res.json();
        } catch {
            return null;
        }
    },

    deleteComment: async (id: number) => {
        try {
            const token = localStorage.getItem('laravel_token');
            if (!token) throw new Error('No autenticado');
            const res = await fetch(`${API}/blog/comments/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            return await res.json();
        } catch {
            return null;
        }
    },

    registerArticleView: async (id: number): Promise<void> => {
        navigator.sendBeacon(`${API}/blog/articles/${id}/view`, '');
    },

    registerVideoView: async (id: number): Promise<void> => {
        navigator.sendBeacon(`${API}/blog/videos/${id}/view`, '');
    },

    registerShortView: async (id: number): Promise<void> => {
        navigator.sendBeacon(`${API}/blog/shorts/${id}/view`, '');
    },
};
