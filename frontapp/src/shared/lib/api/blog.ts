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

function mapPostFromApi(post: any): BlogPostApi {
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        summary: post.summary ?? '',
        content: post.content ?? '',
        featured_image: post.featured_image ?? null,
        author_name: post.author_name ?? 'Lyrium BioMarketplace',
        is_published: post.is_published ?? true,
        is_featured: post.is_featured ?? false,
        published_at: post.published_at ?? null,
        category: post.category ?? null,
        store: post.store ?? null,
        created_at: post.created_at ?? null,
    };
}

export const blogApi = {
    getCategories: async () => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/categories`);
        const json = await res.json();
        return json.data ?? [];
    },

    getPosts: async (categorySlug?: string): Promise<BlogPostApi[]> => {
        const query = categorySlug && categorySlug !== 'todos' 
            ? `?category=${categorySlug}` 
            : '';
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts${query}`);
        const json = await res.json();
        return (json.data?.data ?? json.data ?? []).map(mapPostFromApi);
    },

    getRecentPosts: async (limit: number = 6): Promise<BlogPostApi[]> => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts/recent?limit=${limit}`);
        const json = await res.json();
        return (json.data ?? []).map(mapPostFromApi);
    },

    getFeaturedPosts: async (limit: number = 4): Promise<BlogPostApi[]> => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts/featured?limit=${limit}`);
        const json = await res.json();
        return (json.data ?? []).map(mapPostFromApi);
    },

    getPostBySlug: async (slug: string): Promise<BlogPostApi | null> => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts/${slug}`);
        if (!res.ok) return null;
        const json = await res.json();
        return json.data ? mapPostFromApi(json.data) : null;
    },

    getComments: async (articleId: number): Promise<CommentApi[]> => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/comments?article_id=${articleId}`);
        const json = await res.json();
        return json.data ?? [];
    },

    getVideos: async () => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/videos`);
        const json = await res.json();
        return json.data ?? [];
    },

    getPodcasts: async () => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/podcasts`);
        const json = await res.json();
        return json.data ?? [];
    },

    getShorts: async () => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/shorts`);
        const json = await res.json();
        return json.data ?? [];
    },

    createComment: async (data: {
        article_id: number;
        author_name: string;
        author_email: string;
        content: string;
    }) => {
        const res = await fetch(`${LARAVEL_API_URL}/blog/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const json = await res.json();
        return json;
    },
};
