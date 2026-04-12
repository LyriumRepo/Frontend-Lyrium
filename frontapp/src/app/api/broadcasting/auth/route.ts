import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    const token = (await cookies()).get('laravel_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL?.replace('/api', '') ?? 'http://127.0.0.1:8000';

    const res = await fetch(`${baseUrl}/broadcasting/auth`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        return NextResponse.json({ error: 'Broadcasting auth unavailable' }, { status: 503 });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}