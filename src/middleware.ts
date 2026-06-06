import { NextRequest, NextResponse } from 'next/server';

// Routes that logged-in users should NOT be able to access
const AUTH_ROUTES = ['/signin', '/signin/forgot-password'];

// Public routes that everyone can access regardless of auth
const PUBLIC_ROUTES = ['/', '/about', '/services', '/contact', '/demo'];

// Routes that require a valid token
const PROTECTED_PREFIX = ['/home', '/users', '/finance', '/workers', '/projects', '/store', '/department', '/account'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('graville_token')?.value;

  // Logged-in user trying to access auth pages 
  // Redirect them to /home immediately
  if (token && AUTH_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Logged-in user on public/landing pages
  // Redirect them to /home so they can't go back to landing
  if (token && PUBLIC_ROUTES.some((r) => pathname === r)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Unauthenticated user trying to access protected routes 
  // Redirect them to /signin
  if (!token && PROTECTED_PREFIX.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all routes except static files and API routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};