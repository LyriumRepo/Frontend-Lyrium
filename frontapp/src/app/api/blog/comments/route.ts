import { NextRequest, NextResponse } from 'next/server';
import { blogApi } from '@/shared/lib/api/blog';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('post_id');

    if (!postId) {
        return NextResponse.json({ error: 'post_id is required' }, { status: 400 });
    }

    try {
        const comments = await blogApi.getComments(parseInt(postId));
        return NextResponse.json(comments);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { post_id, author_name, author_email, content, parent_id } = body;

        if (!post_id || !author_name || !content) {
            return NextResponse.json(
                { error: 'post_id, author_name, and content are required' },
                { status: 400 }
            );
        }

        const result = await blogApi.createComment({
            post_id,
            author_name,
            author_email: author_email || '',
            content,
            parent_id,
        });

        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
