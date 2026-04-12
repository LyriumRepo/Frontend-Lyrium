import { NextRequest, NextResponse } from 'next/server';

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://lyriumbiomarketplace.com/wp-json';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  try {
    const [topicRes, postsRes] = await Promise.all([
      fetch(`${WP_API}/wpforo/v1/topics/${id}`),
      fetch(`${WP_API}/wpforo/v1/posts?topic_id=${id}`),
    ]);

    const topic = await topicRes.json();
    const posts = await postsRes.json();

    return NextResponse.json({ topic, posts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
