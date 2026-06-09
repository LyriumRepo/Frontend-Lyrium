import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('laravel_token')?.value ?? null;

    if (!token) {
        return NextResponse.json({ token: null }, { status: 200 });
    }

    return NextResponse.json({ token });
}
