interface RateLimitOptions {
  max: number; // Maximum requests
  window: number; // Time window in milliseconds
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory storage (for production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Create a rate limiter function
 * @param options - Rate limit configuration
 * @returns Rate limiter function
 */
export function createRateLimiter(options: RateLimitOptions) {
  return async (identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // Clean up expired entries
    if (entry && entry.resetTime < now) {
      rateLimitStore.delete(identifier);
    }

    // Get or create entry
    const current = rateLimitStore.get(identifier) || {
      count: 0,
      resetTime: now + options.window,
    };

    // Check if allowed
    if (current.count >= options.max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: current.resetTime,
      };
    }

    // Increment count
    current.count++;
    rateLimitStore.set(identifier, current);

    return {
      allowed: true,
      remaining: options.max - current.count,
      resetTime: current.resetTime,
    };
  };
}

// Pre-configured rate limiters
export const loginRateLimiter = createRateLimiter({
  max: 5,
  window: 15 * 60 * 1000, // 15 minutes
});

export const signupRateLimiter = createRateLimiter({
  max: 3,
  window: 60 * 60 * 1000, // 1 hour
});

export const tweetRateLimiter = createRateLimiter({
  max: 10,
  window: 60 * 1000, // 1 minute
});

/**
 * Get client IP from request
 * @param request - Request object
 * @returns Client IP address
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
