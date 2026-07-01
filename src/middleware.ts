import { NextRequest, NextResponse } from 'next/server';

const AUTH_ROUTES     = ['/signin', '/signin/forgot-password'];
const PUBLIC_ROUTES   = ['/', '/about', '/services', '/contact', '/demo'];
const PROTECTED_PREFIX = ['/home', '/users', '/finance', '/workers', '/projects', '/store', '/department', '/account'];

/**
 * Checks whether the token is present AND not expired.
 * The cookie already contains full timezone info (e.g. +03:00),
 * so we parse it directly — do NOT append 'Z'.
 */
function isTokenValid(token: string | undefined, expiresAt: string | undefined): boolean {
  if (!token) return false;
  if (!expiresAt) return true; // no expiry info — let client-side check catch it

  // ✅ Parse directly — already has timezone offset, appending Z would corrupt it
  const expiry = new Date(expiresAt);
  if (isNaN(expiry.getTime())) return true; // malformed — don't block on it

  return new Date() < expiry;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token     = request.cookies.get('graville_token')?.value;
  const expiresAt = request.cookies.get('graville_expires_at')?.value;
  const isValid   = isTokenValid(token, expiresAt);

  // Valid session trying to access auth pages → redirect to /home
  if (isValid && AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Valid session on public/landing pages → redirect to /home
  if (isValid && PUBLIC_ROUTES.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // No valid session on protected routes → redirect to /signin and clear stale cookies
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