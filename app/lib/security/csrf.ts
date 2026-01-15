import { randomBytes } from 'crypto';

/**
 * Generate a CSRF token
 * @returns Random CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate CSRF token from request
 * @param request - Request object
 * @param sessionToken - Token stored in session
 * @returns True if valid, false otherwise
 */
export async function validateCsrfToken(request: Request, sessionToken: string): Promise<boolean> {
  if (request.method === 'GET') {
    return true; // CSRF only needed for state-changing operations
  }

  const formData = await request.clone().formData();
  const requestToken = formData.get('csrf_token');

  if (!requestToken || typeof requestToken !== 'string') {
    return false;
  }

  return requestToken === sessionToken;
}
