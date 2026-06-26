import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES = ['/signin', '/signin/forgot-password'];
const PUBLIC_ROUTES = ['/', '/about', '/services', '/contact', '/demo'];
const PROTECTED_PREFIX = ['/home', '/users', '/finance', '/workers', '/projects', '/store', '/department', '/account'];

/**
 * Checks whether the token is present AND not expired.
 * expiresAt is the backend's naive datetime string (no timezone) — we
 * append 'Z' to treat it as UTC, matching the fix already applied in
 * protected-route.tsx on the client.
 */
function isTokenValid(token: string | undefined, expiresAt: string | undefined): boolean {
  if (!token) return false;
  if (!expiresAt) return true; 

  const expiryStr = expiresAt.endsWith('Z') ? expiresAt : expiresAt + 'Z';
  const expiry = new Date(expiryStr);

  if (isNaN(expiry.getTime())) return true; // malformed value — don't block on it

  return new Date() < expiry;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('graville_token')?.value;
  const expiresAt = request.cookies.get('graville_expires_at')?.value;
  const isValid = isTokenValid(token, expiresAt);

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