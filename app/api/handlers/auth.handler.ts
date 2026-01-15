
import { signupUser, authenticateUser, verifyEmail } from '~/models/auth/auth.model';
import { createUserSession, logout } from '~/lib/auth/session';
import { sendVerificationEmail } from '~/lib/email/mailgun';
import { signupRateLimiter, loginRateLimiter, getClientIp } from '~/lib/security/rate-limit';

/**
 * Handle user signup
 * POST /api/auth/signup
 */
export async function handleSignup(request: Request): Promise<Response> {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await signupRateLimiter(clientIp);

    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Create user
    const { userId, verificationToken } = await signupUser(body);

    // Send verification email (non-fatal - don't fail signup if email fails)
    try {
      // Get base URL from request
      const url = new URL(request.url);
      const baseUrl = `${url.protocol}//${url.host}`;
      await sendVerificationEmail(body.email, verificationToken, baseUrl);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with signup even if email fails
    }

    return Response.json(
      {
        message: 'Account created. Please check your email to verify.',
        userId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

/**
 * Handle user login
 * POST /api/auth/login
 */
export async function handleLogin(request: Request): Promise<Response> {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await loginRateLimiter(clientIp);

    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    // Authenticate user
    const user = await authenticateUser(email, password);

    if (!user) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Create session and redirect
    const redirectTo = new URL(request.url).searchParams.get('redirectTo') || '/home';
    return await createUserSession(user.id, redirectTo);
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to login' }, { status: 500 });
  }
}

/**
 * Handle user logout
 * POST /api/auth/logout
 */
export async function handleLogout(request: Request): Promise<Response> {
  return await logout(request);
}

/**
 * Handle email verification
 * GET /api/auth/verify?token=xxx
 */
export async function handleVerifyEmail(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return Response.json({ error: 'Verification token is required' }, { status: 400 });
    }

    await verifyEmail(token);

    return Response.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to verify email' }, { status: 500 });
  }
}
