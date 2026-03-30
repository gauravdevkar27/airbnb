// middleware.ts  (root of project)

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // ── 1. Redirect logged-in users away from /login and /register ──────────
    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // ── 2. Block non-admins from /admin/* ───────────────────────────────────
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      // Logged in but not admin → 403 page (or redirect to home)
      return NextResponse.redirect(new URL('/?error=forbidden', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        const publicRoutes = [
          '/',
          '/login',
          '/register',
          '/api/auth',
          '/api/register',
          '/api/verify-email',
          '/api/resend-verification',
        ];

        const isPublic = publicRoutes.some((r) => pathname.startsWith(r));
        if (isPublic) return true;

        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};