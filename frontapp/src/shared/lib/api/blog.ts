import {
    categories as mockCategories,
    posts as mockPosts,
    getPostBySlug,
    getPostsByCategory,
    getRecentPosts,
    getFeaturedPosts,
    getCommentsByPostId,
    addComment,
    BlogPost,
    Comment,
} from '@/data/blog';

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== 'false';
const LARAVEL_API_URL = process.env.LARAVEL_API_URL || 'http://localhost:8000/api';

export interface BlogPostApi {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    category_id: number;
    category_name: string;
    author: string;
    published_at: string;
    views: number;
    comments_count: number;
}

export interface CommentApi {
    id: number;
    post_id: number;
    author_name: string;
    content: string;
    created_at: string;
}

function mapPostToApi(post: any): BlogPostApi {
    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        featured_image: post.featured_image,
        category_id: post.category_id,
        category_name: post.category_name,
        author: post.author,
        published_at: post.published_at,
        views: post.views,
        comments_count: post.comments_count,
    };
}

export const blogApi = {
    getCategories: async () => {
        if (USE_MOCKS) {
            return Promise.resolve(mockCategories);
        }
        const res = await fetch(`${LARAVEL_API_URL}/blog/categories`);
        return res.json();
    },

    getPosts: async (categorySlug?: string): Promise<BlogPostApi[]> => {
        if (USE_MOCKS) {
            const posts = getPostsByCategory(categorySlug);
            return Promise.resolve(posts.map(mapPostToApi));
        }
        
        const query = categorySlug && categorySlug !== 'todos' 
            ? `?category=${categorySlug}` 
            : '';
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts${query}`);
        const data = await res.json();
        return data.map(mapPostToApi);
    },

    getRecentPosts: async (limit: number = 6): Promise<BlogPostApi[]> => {
        if (USE_MOCKS) {
            const posts = getRecentPosts(limit);
            return Promise.resolve(posts.map(mapPostToApi));
        }
        
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts/recent?limit=${limit}`);
        const data = await res.json();
        return data.map(mapPostToApi);
    },

    getFeaturedPosts: async (limit: number = 4): Promise<BlogPostApi[]> => {
        if (USE_MOCKS) {
            const posts = getFeaturedPosts(limit);
            return Promise.resolve(posts.map(mapPostToApi));
        }
        
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts/featured?limit=${limit}`);
        const data = await res.json();
        return data.map(mapPostToApi);
    },

    getPostBySlug: async (slug: string): Promise<BlogPostApi | null> => {
        if (USE_MOCKS) {
            const post = getPostBySlug(slug);
            if (!post) return Promise.resolve(null);
            return Promise.resolve(mapPostToApi(post));
        }
        
        const res = await fetch(`${LARAVEL_API_URL}/blog/posts/${slug}`);
        if (!res.ok) return null;
        const data = await res.json();
        return mapPostToApi(data);
    },

    getComments: async (postId: number): Promise<CommentApi[]> => {
        if (USE_MOCKS) {
            const comments = getCommentsByPostId(postId);
            return Promise.resolve(comments.map((c: Comment) => ({
                id: c.id,
                post_id: c.post_id,
                author_name: c.author_name,
                content: c.content,
                created_at: c.created_at,
            })));
        }
        
        const res = await fetch(`${LARAVEL_API_URL}/blog/comments?post_id=${postId}`);
        return res.json();
    },

    createComment: async (data: {
        post_id: number;
        author_name: string;
        author_email: string;
        content: string;
        parent_id?: number;
    }) => {
        if (USE_MOCKS) {
            const newComment = addComment({
                post_id: data.post_id,
                author_name: data.author_name,
                author_email: data.author_email,
                content: data.content,
                parent_id: data.parent_id || null,
            });
            console.log('Mock: Comment created', newComment);
            return Promise.resolve({
                success: true,
                comment: newComment,
            });
        }
        
        const res = await fetch(`${LARAVEL_API_URL}/blog/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
};
