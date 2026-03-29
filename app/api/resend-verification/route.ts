// app/api/resend-verification/route.ts

import crypto from 'crypto';
import prisma from '@/app/libs/getPrismdb';
import { NextResponse } from 'next/server';
import { sendResendVerificationEmail } from '@/app/libs/mailer';

// Rate-limit guard: in-memory store (use Redis in production)
// Keyed by email → timestamp of last resend request
const resendLog = new Map<string, number>();
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between requests

function generateVerificationToken(): { raw: string; hashed: string; expiresAt: Date } {
  const raw = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(raw).digest('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return { raw, hashed, expiresAt };
}

// ─── POST /api/resend-verification ───────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // ── 1. Validate input ───────────────────────────────────────────────────
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // ── 2. Rate limiting ────────────────────────────────────────────────────
    const lastSent = resendLog.get(cleanEmail);
    if (lastSent && Date.now() - lastSent < RESEND_COOLDOWN_MS) {
      const waitSecs = Math.ceil((RESEND_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
      return NextResponse.json(
        { error: `Please wait ${waitSecs} seconds before requesting another link.` },
        { status: 429 }
      );
    }

    // ── 3. Find user ────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        user_id: true,
        first_name: true,
        email_verified: true,
        status: true,
      },
    });

    // ── 4. Always respond the same whether user exists or not (prevents enumeration)
    if (!user || user.email_verified || user.status === 'banned') {
      // We silently return success to not leak whether the email is registered.
      return NextResponse.json(
        { message: 'If that email is registered and unverified, a new link has been sent.' },
        { status: 200 }
      );
    }

    // ── 5. Generate fresh token ─────────────────────────────────────────────
    const { raw, hashed, expiresAt } = generateVerificationToken();

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        email_verify_token: hashed,
        token_expires_at: expiresAt,
      },
    });

    // ── 6. Send email ───────────────────────────────────────────────────────
    await sendResendVerificationEmail(cleanEmail, user.first_name, raw);

    // ── 7. Update rate-limit log ────────────────────────────────────────────
    resendLog.set(cleanEmail, Date.now());

    return NextResponse.json(
      { message: 'If that email is registered and unverified, a new link has been sent.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('[RESEND_VERIFICATION_ERROR]', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}