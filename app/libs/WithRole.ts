// app/libs/withRole.ts
// Wraps any API route handler with a role check.
// Usage: export const GET = withRole(handler, 'admin')
// export const POST = withRole(handler, ['user', 'admin'])

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

type Role = 'user' | 'admin';
type RouteHandler = (req: NextRequest, ctx: any) => Promise<NextResponse>;

export function withRole(
  handler: RouteHandler,
  allowedRoles: Role | Role[]
): RouteHandler {
  return async (req: NextRequest, ctx: any) => {
    const session = await getServerSession(authOptions);

    // ── 1. Not logged in ────────────────────────────────────────────────────
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role as Role;
    const roles    = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    // ── 2. Logged in but wrong role ─────────────────────────────────────────
    if (!roles.includes(userRole)) {
      return NextResponse.json(
        { error: 'Forbidden. You do not have permission to do this.' },
        { status: 403 }
      );
    }

    // ── 3. Attach session to request for use inside the handler ────────────
    (req as any).session = session;

    return handler(req, ctx);
  };
}

// ── Convenience helpers ───────────────────────────────────────────────────────

/** Only admins can call this route */
export const adminOnly = (handler: RouteHandler) =>
  withRole(handler, 'admin');

/** Any logged-in user can call this route */
export const authOnly = (handler: RouteHandler) =>
  withRole(handler, ['user', 'admin']);