
import crypto from 'crypto';
import prisma from '@/app/libs/getPrismdb';
import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

// ─── GET /api/verify-email?token=<raw_token> ──────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawToken = searchParams.get('token');

    // ── 1. Token present ────────────────────────────────────────────────────
    if (!rawToken || rawToken.trim() === '') {
      return NextResponse.redirect(
        `${BASE_URL}/login?error=missing_token`
      );
    }

    // ── 2. Hash the incoming token to compare against DB ───────────────────
    const hashed = crypto.createHash('sha256').update(rawToken).digest('hex');

    // ── 3. Look up user by hashed token ────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email_verify_token: hashed },
      select: {
        user_id: true,
        email_verified: true,
        token_expires_at: true,
        status: true,
      },
    });

    // ── 4. Token not found ──────────────────────────────────────────────────
    if (!user) {
      return NextResponse.redirect(
        `${BASE_URL}/login?error=invalid_token`
      );
    }

    // ── 5. Already verified ─────────────────────────────────────────────────
    if (user.email_verified) {
      return NextResponse.redirect(
        `${BASE_URL}/login?info=already_verified`
      );
    }

    // ── 6. Token expired ────────────────────────────────────────────────────
    if (!user.token_expires_at || new Date() > user.token_expires_at) {
      return NextResponse.redirect(
        `${BASE_URL}/login?error=token_expired`
      );
    }

    // ── 7. Account banned or inactive ───────────────────────────────────────
    if (user.status === 'banned') {
      return NextResponse.redirect(
        `${BASE_URL}/login?error=account_suspended`
      );
    }

    // ── 8. Mark as verified and clear token fields ──────────────────────────
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        email_verified: true,
        email_verify_token: null,
        token_expires_at: null,
      },
    });

    // ── 9. Redirect to login with success flag ──────────────────────────────
    return NextResponse.redirect(
      `${BASE_URL}/login?verified=true`
    );

  } catch (error) {
    console.error('[VERIFY_EMAIL_ERROR]', error);
    return NextResponse.redirect(
      `${BASE_URL}/login?error=server_error`
    );
  }
}