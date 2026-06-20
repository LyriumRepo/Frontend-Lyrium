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
    article_id: number | null;
    author_name: string;
    author_email: string;
    content: string;
    is_approved: boolean;
    created_at: string;
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

    getComments: async (articleId: number): Promise<CommentApi[]> => {
        return fetchList<CommentApi>(`${API}/blog/comments?article_id=${articleId}`);
    },

    getVideos: async () => {
        return fetchList<any>(`${API}/blog/videos`);
    },

    getPodcasts: async () => {
        return fetchList<any>(`${API}/blog/podcasts`);
    },

    getShorts: async () => {
        return fetchList<any>(`${API}/blog/shorts`);
    },

    createComment: async (data: {
        article_id: number;
        author_name: string;
        author_email: string;
        content: string;
    }) => {
        try {
            const res = await fetch(`${API}/blog/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
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
