
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.NODE_ENV === 'production'
    ? `${process.env.EMAIL_FROM_NAME ?? 'Airbnb Clone'} <${process.env.EMAIL_FROM_ADDRESS}>`
    : 'Airbnb Clone <onboarding@resend.dev>'; // works without a verified domain in dev

const BASE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';


export async function sendVerificationEmail(
  email: string,
  firstName: string,
  token: string
): Promise<void> {
    
  const verifyUrl = `${BASE_URL}/api/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'Verify your email address',
    html: buildVerificationHtml(firstName, verifyUrl),
  });

  if (error) {
    console.error('[MAILER] Failed to send verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}

// ─── Send resend/new-token email ─────────────────────────────────────────────

export async function sendResendVerificationEmail(
  email: string,
  firstName: string,
  token: string
): Promise<void> {
  const verifyUrl = `${BASE_URL}/api/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: 'New verification link — Airbnb Clone',
    html: buildVerificationHtml(firstName, verifyUrl, true),
  });

  if (error) {
    console.error('[MAILER] Failed to resend verification email:', error);
    throw new Error('Failed to send verification email.');
  }
}

// ─── HTML template ───────────────────────────────────────────────────────────

function buildVerificationHtml(
  firstName: string,
  verifyUrl: string,
  isResend = false
): string {
  const heading = isResend ? 'New verification link' : 'Verify your email';
  const intro = isResend
    ? `You requested a new verification link. The previous one has been invalidated.`
    : `Thanks for signing up! Please verify your email address to activate your account.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:12px;padding:40px;box-shadow:0 1px 4px rgba(0,0,0,.08);">
          <tr>
            <td>
              <h1 style="margin:0 0 8px;font-size:22px;color:#111827;">${heading}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                Hi ${firstName},<br/><br/>${intro}
              </p>
              <a href="${verifyUrl}"
                 style="display:inline-block;padding:12px 28px;background:#e11d48;color:#ffffff;
                        font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">
                Verify email address
              </a>
              <p style="margin:24px 0 0;font-size:13px;color:#9ca3af;line-height:1.6;">
                This link expires in <strong>24 hours</strong>.<br/>
                If you didn't create an account, you can safely ignore this email.
              </p>
              <hr style="margin:32px 0;border:none;border-top:1px solid #f3f4f6;"/>
              <p style="margin:0;font-size:12px;color:#d1d5db;">
                Having trouble clicking the button? Copy and paste this URL:<br/>
                <span style="color:#6b7280;word-break:break-all;">${verifyUrl}</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}