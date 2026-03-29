
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '@/app/libs/getPrismdb';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/app/libs/mailer';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8)
        return { valid: false, message: 'Password must be at least 8 characters.' };
    if (!/[A-Z]/.test(password))
        return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    if (!/[a-z]/.test(password))
        return { valid: false, message: 'Password must contain at least one lowercase letter.' };
    if (!/[0-9]/.test(password))
        return { valid: false, message: 'Password must contain at least one number.' };
    return { valid: true };
}

function sanitize(value: string): string {
    return value.trim().replace(/\s+/g, ' ');
}

/** Generate a secure, URL-safe token and its SHA-256 hash to store in DB. */
function generateVerificationToken(): { raw: string; hashed: string; expiresAt: Date } {
    const raw = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    return { raw, hashed, expiresAt };
}

// ─── POST /api/register ───────────────────────────────────────────────────────

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, first_name, last_name, password, phone_number, date_of_birth, about } = body;

        // ── 1. Required fields ──────────────────────────────────────────────────
        const missing = ['email', 'first_name', 'last_name', 'password'].filter((f) => !body[f]);
        if (missing.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missing.join(', ')}` },
                { status: 400 }
            );
        }

        // ── 2. Type safety ──────────────────────────────────────────────────────
        if (
            typeof email !== 'string' ||
            typeof first_name !== 'string' ||
            typeof last_name !== 'string' ||
            typeof password !== 'string'
        ) {
            return NextResponse.json({ error: 'All fields must be strings.' }, { status: 400 });
        }

        // ── 3. Sanitise ─────────────────────────────────────────────────────────
        const cleanEmail = sanitize(email).toLowerCase();
        const cleanFirst = sanitize(first_name);
        const cleanLast = sanitize(last_name);

        // ── 4. Validate email ───────────────────────────────────────────────────
        if (!isValidEmail(cleanEmail)) {
            return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
        }

        // ── 5. Validate names ───────────────────────────────────────────────────
        if (cleanFirst.length < 2 || cleanFirst.length > 50) {
            return NextResponse.json(
                { error: 'First name must be between 2 and 50 characters.' },
                { status: 400 }
            );
        }
        if (cleanLast.length < 2 || cleanLast.length > 50) {
            return NextResponse.json(
                { error: 'Last name must be between 2 and 50 characters.' },
                { status: 400 }
            );
        }

        // ── 6. Password strength ────────────────────────────────────────────────
        const pwCheck = isStrongPassword(password);
        if (!pwCheck.valid) {
            return NextResponse.json({ error: pwCheck.message }, { status: 400 });
        }

        // ── 7. Optional phone ───────────────────────────────────────────────────
        if (phone_number != null) {
            if (typeof phone_number !== 'string') {
                return NextResponse.json({ error: 'Phone number must be a string.' }, { status: 400 });
            }
            if (!/^\+?[1-9]\d{6,14}$/.test(phone_number.replace(/[\s\-()]/g, ''))) {
                return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 });
            }
        }

        // ── 8. Optional date of birth ───────────────────────────────────────────
        let parsedDob: Date | undefined;
        if (date_of_birth != null) {
            parsedDob = new Date(date_of_birth);
            if (isNaN(parsedDob.getTime())) {
                return NextResponse.json(
                    { error: 'Invalid date_of_birth. Use ISO 8601 (e.g. 1990-05-15).' },
                    { status: 400 }
                );
            }
            const age = new Date().getFullYear() - parsedDob.getFullYear();
            if (age < 18) {
                return NextResponse.json(
                    { error: 'You must be at least 18 years old to register.' },
                    { status: 400 }
                );
            }
        }

        // ── 9. Duplicate email check ────────────────────────────────────────────
        const existing = await prisma.user.findUnique({
            where: { email: cleanEmail },
            select: { user_id: true, status: true, email_verified: true },
        });

        if (existing) {
            if (!existing.email_verified) {
                // Account exists but was never verified — let them re-register by
                // issuing a fresh token rather than blocking them.
                const { raw, hashed, expiresAt } = generateVerificationToken();

                await prisma.user.update({
                    where: { email: cleanEmail },
                    data: {
                        password: await bcrypt.hash(password, 12),
                        email_verify_token: hashed,
                        token_expires_at: expiresAt,
                    },
                });

                await sendVerificationEmail(cleanEmail, existing as any, raw);

                return NextResponse.json(
                    {
                        message:
                            'An account with this email already exists but was never verified. ' +
                            'A new verification link has been sent.',
                    },
                    { status: 200 }
                );
            }

            if (existing.status === 'inactive') {
                return NextResponse.json(
                    {
                        error: 'This account is deactivated. Contact support to reactivate.',
                        code: 'ACCOUNT_DEACTIVATED',
                    },
                    { status: 403 }
                );
            }

            if (existing.status === 'banned') {
                return NextResponse.json({ error: 'This account has been suspended.' }, { status: 403 });
            }

            return NextResponse.json(
                { error: 'An account with this email already exists.' },
                { status: 409 }
            );
        }

        // ── 10. Hash password + generate token ──────────────────────────────────
        const [hashedPassword, { raw, hashed, expiresAt }] = await Promise.all([
            bcrypt.hash(password, 12),
            Promise.resolve(generateVerificationToken()),
        ]);

        // ── 11. Create user ─────────────────────────────────────────────────────
        const user = await prisma.user.create({
            data: {
                email: cleanEmail,
                first_name: cleanFirst,
                last_name: cleanLast,
                password: hashedPassword,
                phone_number: phone_number ?? null,
                date_of_birth: parsedDob ?? null,
                about: about ?? null,
                status: 'active',
                email_verified: false,
                email_verify_token: hashed,   // store the HASHED token in DB
                token_expires_at: expiresAt,
            },
            select: {
                user_id: true,
                email: true,
                first_name: true,
                last_name: true,
                status: true,
                email_verified: true,
                created_at: true,
            },
        });

        // ── 12. Send verification email (non-blocking — don't fail registration) ─
        try {
            await sendVerificationEmail(cleanEmail, cleanFirst, raw); // send the RAW token
        } catch (mailErr) {
            console.error('[REGISTER] Email send failed (user still created):', mailErr);
            // User is created; they can use /api/resend-verification to get a new link.
        }

        return NextResponse.json(
            {
                message: 'Account created. Please check your email to verify your account.',
                user,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        console.error('[REGISTER_ERROR]', error);

        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json(
                { error: 'An account with this email already exists.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error. Please try again later.' },
            { status: 500 }
        );
    }
}