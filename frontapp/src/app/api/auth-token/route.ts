import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const token = request.cookies.get('laravel_token')?.value ?? null;
    return NextResponse.json({ token });
}
