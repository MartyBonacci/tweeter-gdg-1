import Mailgun from 'mailgun.js';
import FormData from 'form-data';

if (!process.env.MAILGUN_API_KEY || !process.env.MAILGUN_DOMAIN) {
  throw new Error('MAILGUN_API_KEY and MAILGUN_DOMAIN environment variables are required');
}

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

/**
 * Send email verification link to user
 * @param email - Recipient email address
 * @param token - Verification token
 * @param baseUrl - Base URL of the application (optional, will use BASE_URL env var or default)
 */
export async function sendVerificationEmail(email: string, token: string, baseUrl?: string): Promise<void> {
  const verificationUrl = `${baseUrl || process.env.BASE_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const fromEmail = process.env.MAILGUN_FROM_EMAIL || `noreply@${process.env.MAILGUN_DOMAIN}`;
  const fromName = process.env.MAILGUN_FROM_NAME || 'Tweeter';

  try {
    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: 'Verify your Tweeter account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #1DA1F2; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome to Tweeter!</h1>
            <p>Thank you for signing up. Please verify your email address to activate your account.</p>
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all;">${verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <div class="footer">
              <p>If you didn't create an account, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Tweeter!

        Thank you for signing up. Please verify your email address to activate your account.

        Click here to verify: ${verificationUrl}

        This link will expire in 24 hours.

        If you didn't create an account, you can safely ignore this email.
      `,
    });
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw new Error('Failed to send verification email');
  }
}
