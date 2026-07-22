import { NextRequest, NextResponse } from 'next/server';
import { AUTH_ROUTES, PUBLIC_ROUTES, PROTECTED_PREFIX } from './lib/routes';

function isTokenValid(token: string | undefined, expiresAt: string | undefined): boolean {
  if (!token) return false;
  if (!expiresAt) return true; 

  const expiry = new Date(expiresAt);
  if (isNaN(expiry.getTime())) return true;

  return new Date() < expiry;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token     = request.cookies.get('graville_token')?.value;
  const expiresAt = request.cookies.get('graville_expires_at')?.value;
  const isValid   = isTokenValid(token, expiresAt);

  if (isValid && AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (isValid && PUBLIC_ROUTES.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  if (!isValid && PROTECTED_PREFIX.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete('graville_token');
    response.cookies.delete('graville_role');
    response.cookies.delete('graville_user');
    response.cookies.delete('graville_expires_at');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};