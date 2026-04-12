import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString()
    );
    return payload?.data?.user?.roles?.[0] ?? null;
  } catch {
    return null;
  }
}

const publicPaths = [
  '/',
  '/login',
  '/api/auth',
  '/api/webhooks',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token')?.value;
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRole = getRoleFromToken(authToken);
  if (!userRole) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin') && userRole !== 'administrator') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/seller') && userRole !== 'seller') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (pathname.startsWith('/logistics') && userRole !== 'logistics') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-role', userRole);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
