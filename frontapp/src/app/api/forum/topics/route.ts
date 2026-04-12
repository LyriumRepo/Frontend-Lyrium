import { NextRequest, NextResponse } from 'next/server';

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://lyriumbiomarketplace.com/wp-json';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const forum = searchParams.get('forum');
  const page = searchParams.get('page') || '1';

  try {
    let url = `${WP_API}/wpforo/v1/topics?page=${page}`;
    if (forum) url += `&forum=${forum}`;

    const res = await fetch(url);
    const data = await res.json();

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
