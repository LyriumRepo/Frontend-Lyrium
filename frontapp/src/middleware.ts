import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const roleProtectedPrefixes = ['/admin', '/seller', '/customer', '/logistics'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isRoleProtected = roleProtectedPrefixes.some(prefix => pathname.startsWith(prefix));

  if (!isRoleProtected) {
    return NextResponse.next();
  }

  // Sanctum plainTextToken has format "1|xxxx" (NOT a JWT).
  // We can only check cookie presence here; role-based access is
  // enforced client-side by AuthContext after /auth/validate.
  const authToken = request.cookies.get('laravel_token')?.value;
  if (!authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
