
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If someone lands on /login or /register while already logged in
    // redirect them to home
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (token && (pathname === '/login' || pathname === '/register')) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true = allow through, false = redirect to /login
      authorized({ token, req }) {
        const { pathname } = req.nextUrl;

        // Public routes — always allowed
        const publicRoutes = ['/', '/login', '/register', '/api/auth', '/api/register', '/api/verify-email', '/api/resend-verification'];
        const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

        if (isPublic) return true;

        // Everything else requires a token
        return !!token;
      },
    },
  }
);

export const config = {
  // Run middleware on all routes except static files and next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public/).*)'],
};