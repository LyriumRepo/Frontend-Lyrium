import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('laravel_token')?.value ?? null;

        if (!token) {
            return NextResponse.json({
                authenticated: false,
                user: null,
            });
        }

        const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL ?? 'http://127.0.0.1:8000/api';

        try {
            const response = await fetch(`${baseUrl}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${decodeURIComponent(token)}`,
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                return NextResponse.json({
                    authenticated: false,
                    user: null,
                });
            }

            const data = await response.json();
            const user = data.user || data;

            if (!user?.id) {
                return NextResponse.json({
                    authenticated: false,
                    user: null,
                });
            }

            return NextResponse.json({
                authenticated: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    nicename: user.nicename,
                    display_name: user.display_name,
                    role: user.role,
                    avatar: user.avatar,
                },
            });
        } catch (error) {
            console.error('[Session API] Validate request failed:', error);
            return NextResponse.json({
                authenticated: false,
                user: null,
            });
        }
    } catch (error) {
        console.error('[Session API] Unexpected error:', error);
        return NextResponse.json({
            authenticated: false,
            user: null,
        });
    }
}
