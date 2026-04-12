import { NextResponse } from 'next/server';

const WP_API = process.env.NEXT_PUBLIC_WP_API_URL || 'https://lyriumbiomarketplace.com/wp-json';

export async function GET() {
  try {
    const res = await fetch(`${WP_API}/wpforo/v1/forums`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
