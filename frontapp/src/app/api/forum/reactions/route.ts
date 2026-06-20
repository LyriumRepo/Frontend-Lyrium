import { NextRequest, NextResponse } from 'next/server';

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://lyriumbiomarketplace.com/wp-json';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookie = request.headers.get('cookie') || '';

    const res = await fetch(`${WP_API}/wpforo/v1/votes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookie,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
