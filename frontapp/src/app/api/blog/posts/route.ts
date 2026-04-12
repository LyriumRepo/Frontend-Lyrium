import { NextRequest, NextResponse } from 'next/server';
import { blogApi } from '@/shared/lib/api/blog';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;

    try {
        const posts = await blogApi.getPosts(category);
        return NextResponse.json(posts);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
