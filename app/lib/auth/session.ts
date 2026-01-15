import { createCookieSessionStorage, redirect } from 'react-router';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET environment variable is required');
}

// Create session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

/**
 * Create a user session and redirect
 * @param userId - User ID to store in session
 * @param redirectTo - URL to redirect to after login
 */
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set('userId', userId);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

/**
 * Get user ID from session
 * @param request - Request object
 * @returns User ID or null if not authenticated
 */
export async function getUserId(request: Request): Promise<string | null> {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');

  if (!userId || typeof userId !== 'string') {
    return null;
  }

  return userId;
}

/**
 * Require authentication - throws redirect if not authenticated
 * @param request - Request object
 * @returns User ID
 */
export async function requireAuth(request: Request): Promise<string> {
  const userId = await getUserId(request);

  if (!userId) {
    const url = new URL(request.url);
    const redirectTo = url.pathname + url.search;
    throw redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  return userId;
}

/**
 * Logout user and destroy session
 * @param request - Request object
 */
export async function logout(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get('Cookie'));

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
