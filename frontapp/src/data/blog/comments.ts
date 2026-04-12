export interface Comment {
    id: number;
    post_id: number;
    author_name: string;
    author_email: string;
    content: string;
    created_at: string;
    parent_id: number | null;
    status: 'pending' | 'approved' | 'spam';
}

export const comments: Comment[] = [
    {
        id: 1,
        post_id: 1,
        author_name: 'Juan Pérez',
        author_email: 'juan@email.com',
        content: 'Excelente artículo, la meditación ha cambiado mi vida.',
        created_at: '2025-05-05T10:30:00Z',
        parent_id: null,
        status: 'approved',
    },
    {
        id: 2,
        post_id: 1,
        author_name: 'María López',
        author_email: 'maria@email.com',
        content: 'Gracias por compartir estos consejos. Muy útiles.',
        created_at: '2025-05-06T14:20:00Z',
        parent_id: null,
        status: 'approved',
    },
    {
        id: 3,
        post_id: 2,
        author_name: 'Carlos García',
        author_email: 'carlos@email.com',
        content: 'Muy completo, me ayudó a elegir mi pasarela de pago.',
        created_at: '2025-04-25T09:15:00Z',
        parent_id: null,
        status: 'approved',
    },
];

export const getCommentsByPostId = (postId: number): Comment[] => {
    return comments.filter((c) => c.post_id === postId && c.status === 'approved');
};

export const addComment = (comment: Omit<Comment, 'id' | 'created_at' | 'status'>): Comment => {
    const newComment: Comment = {
        ...comment,
        id: comments.length + 1,
        created_at: new Date().toISOString(),
        status: 'pending',
    };
    comments.push(newComment);
    return newComment;
};
