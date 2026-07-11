import { LARAVEL_API_URL } from '@/shared/lib/config/flags';

// ─── Auth helper ───────────────────────────────────────────────────────────

let _tokenCache: { value: string | null; ts: number } | null = null;

async function getAuthToken(): Promise<string | null> {
    const now = Date.now();
    if (_tokenCache && now - _tokenCache.ts < 30_000) return _tokenCache.value;
    try {
        const res = await fetch('/api/auth-token', { credentials: 'include', cache: 'no-store' });
        if (!res.ok) return null;
        const { token } = await res.json();
        const clean = token?.replace(/^["']|["']$/g, '').trim() || null;
        _tokenCache = { value: clean, ts: now };
        return clean;
    } catch { return null; }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function buildQuery(params?: Record<string, string | number | undefined>): string {
    if (!params) return '';
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== '') q.set(k, String(v));
    }
    const qs = q.toString();
    return qs ? `?${qs}` : '';
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await getAuthToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json', Accept: 'application/json',
        ...((init.headers as Record<string, string>) ?? {}),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${LARAVEL_API_URL}${path}`, { ...init, headers });
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? `HTTP Error ${res.status}`);
    }
    return res.json();
}

// ─── Types ─────────────────────────────────────────────────────────────────

export interface BlogArticle {
    id: number; store_id: number; blog_category_id: number | null; title: string; slug: string;
    summary: string | null; content: string | null; main_image: string | null;
    meta_title: string | null; meta_description: string | null; keywords: string[] | null;
    status: string; is_featured?: boolean; published_at: string | null; views_count: number;
    created_at: string; updated_at: string;
}

export interface BlogPodcast {
    id: number; store_id: number; type: string; platform: string; url: string;
    title: string; description: string | null; cover_image: string | null; thumbnail: string | null;
    duration: number | null; metadata: any; tags: string[] | null; status: string;
    views_count: number; is_published: boolean; published_at: string | null;
    created_at: string; updated_at: string;
}

export interface BlogVideo {
    id: number; store_id: number; platform: string; url: string;
    title: string; description: string | null; thumbnail: string | null;
    duration: number | null; status: string; views_count: number;
    is_published: boolean; published_at: string | null;
    created_at: string; updated_at: string;
}

export interface BlogShort {
    id: number; store_id: number; blog_category_id: number | null; platform: string; url: string;
    title: string; description: string | null; thumbnail: string | null;
    duration: number | null; status: string; views_count: number;
    published_at: string | null; created_at: string; updated_at: string;
}

export interface BlogDashboard {
    kpi: { articles: number; podcasts: number; videos: number; shorts: number; total_views: number; forum_topics: number; forum_replies: number };
    recent: Array<{ id: number; type: string; title: string; status: string; published_at: string | null; created_at: string; views: number }>;
}

export interface ForumTopic {
    id: number; store_id: number; forum_category_id: number; user_id: number | null;
    title: string; content: string; status: string; reply_count: number; views: number;
    image: string | null;
    created_at: string; updated_at: string;
    category?: { id: number; name: string; slug: string };
    user?: { id: number; name: string };
    posts?: ForumPost[];
}

export interface ForumPost {
    id: number; forum_topic_id: number; user_id: number | null;
    content: string; reply_to_id: number | null; status: string;
    created_at: string; updated_at: string;
    user?: { id: number; name: string };
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: { current_page: number; per_page: number; total: number; total_pages: number };
}

// ─── API Objects ──────────────────────────────────────────────────────────

export const blogApi = {
    dashboard: () =>
        request<{ success: boolean; data: BlogDashboard }>('/blog/dashboard'),

    articles: {
        list: (params?: { status?: string; search?: string; per_page?: number }) =>
            request<PaginatedResponse<BlogArticle>>(`/blog/articles${buildQuery(params as any)}`),
        get: (id: number) => request<{ success: boolean; data: BlogArticle }>(`/blog/articles/${id}`),
        create: (data: Partial<BlogArticle>) => request<{ success: boolean; data: BlogArticle }>('/blog/articles', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<BlogArticle>) => request<{ success: boolean; data: BlogArticle }>(`/blog/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => request<{ success: boolean }>(`/blog/articles/${id}`, { method: 'DELETE' }),
    },

    podcasts: {
        list: (params?: { status?: string; per_page?: number }) =>
            request<PaginatedResponse<BlogPodcast>>(`/blog/podcasts${buildQuery(params as any)}`),
        get: (id: number) => request<{ success: boolean; data: BlogPodcast }>(`/blog/podcasts/${id}`),
        create: (data: Partial<BlogPodcast>) => request<{ success: boolean; data: BlogPodcast }>('/blog/podcasts', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<BlogPodcast>) => request<{ success: boolean; data: BlogPodcast }>(`/blog/podcasts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => request<{ success: boolean }>(`/blog/podcasts/${id}`, { method: 'DELETE' }),
    },

    videos: {
        list: (params?: { status?: string; per_page?: number }) =>
            request<PaginatedResponse<BlogVideo>>(`/blog/videos${buildQuery(params as any)}`),
        get: (id: number) => request<{ success: boolean; data: BlogVideo }>(`/blog/videos/${id}`),
        create: (data: Partial<BlogVideo>) => request<{ success: boolean; data: BlogVideo }>('/blog/videos', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<BlogVideo>) => request<{ success: boolean; data: BlogVideo }>(`/blog/videos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => request<{ success: boolean }>(`/blog/videos/${id}`, { method: 'DELETE' }),
    },

    urlMetadata: (url: string) =>
        request<{ success: boolean; data: { title?: string; thumbnail?: string; duration?: number; channel?: string; type?: string; platform?: string; description?: string } }>('/url-metadata', { method: 'POST', body: JSON.stringify({ url }) }),

    shorts: {
        list: (params?: { status?: string; per_page?: number }) =>
            request<PaginatedResponse<BlogShort>>(`/blog/shorts${buildQuery(params as any)}`),
        get: (id: number) => request<{ success: boolean; data: BlogShort }>(`/blog/shorts/${id}`),
        create: (data: Partial<BlogShort>) => request<{ success: boolean; data: BlogShort }>('/blog/shorts', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<BlogShort>) => request<{ success: boolean; data: BlogShort }>(`/blog/shorts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => request<{ success: boolean }>(`/blog/shorts/${id}`, { method: 'DELETE' }),
    },
};

// ─── Admin BioBlog Types ───────────────────────────────────────────────────

export interface AdminPendingItem {
    id: number;
    store_id: number;
    content_type: string;
    title: string;
    status: string;
    summary?: string | null;
    description?: string | null;
    main_image?: string | null;
    thumbnail?: string | null;
    platform?: string;
    url?: string;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    store?: { id: number; name: string; slug: string; logo?: string };
}

export interface AdminStats {
    pending_articles: number;
    pending_podcasts: number;
    pending_videos: number;
    pending_shorts: number;
    total_pending: number;
}

// ─── Admin BioBlog API ──────────────────────────────────────────────────────

export const adminBioBlogApi = {
    pending: () =>
        request<{ success: boolean; data: AdminPendingItem[] }>('/admin/bioblog/pending'),
    stats: () =>
        request<{ success: boolean; data: AdminStats }>('/admin/bioblog/stats'),
    approve: (type: string, id: number) =>
        request<{ success: boolean; message: string }>(`/admin/bioblog/${type}/${id}/approve`, { method: 'POST' }),
    reject: (type: string, id: number, note = '') =>
        request<{ success: boolean; message: string }>(`/admin/bioblog/${type}/${id}/reject`, { method: 'POST', body: JSON.stringify({ note }) }),
};

export const forumApi = {
    topics: {
        list: (params?: { status?: string; category_id?: number; per_page?: number }) =>
            request<PaginatedResponse<ForumTopic>>(`/forum/topics${buildQuery(params as any)}`),
        get: (id: number) => request<{ success: boolean; data: ForumTopic }>(`/forum/topics/${id}`),
        create: (data: { forum_category_id: number; title: string; content: string; status?: string; image?: string | null }) =>
            request<{ success: boolean; data: ForumTopic }>('/forum/topics', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<ForumTopic>) =>
            request<{ success: boolean; data: ForumTopic }>(`/forum/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => request<{ success: boolean }>(`/forum/topics/${id}`, { method: 'DELETE' }),
        replies: (topicId: number) =>
            request<PaginatedResponse<ForumPost>>(`/forum/topics/${topicId}/replies`),
        addReply: (topicId: number, data: { content: string; reply_to_id?: number }) =>
            request<{ success: boolean; data: ForumPost }>(`/forum/topics/${topicId}/replies`, { method: 'POST', body: JSON.stringify(data) }),
        hideReply: (topicId: number, postId: number) =>
            request<{ success: boolean }>(`/forum/topics/${topicId}/replies/${postId}/hide`, { method: 'POST' }),
        deleteReply: (topicId: number, postId: number) =>
            request<{ success: boolean }>(`/forum/topics/${topicId}/replies/${postId}`, { method: 'DELETE' }),
    },
};
