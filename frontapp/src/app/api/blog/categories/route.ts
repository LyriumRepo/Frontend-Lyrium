import { NextResponse } from 'next/server';
import { blogApi } from '@/shared/lib/api/blog';

export async function GET() {
    try {
        const categories = await blogApi.getCategories();
        return NextResponse.json(categories);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
