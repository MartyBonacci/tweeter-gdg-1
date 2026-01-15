import * as authHandlers from './handlers/auth.handler';
import * as tweetHandlers from './handlers/tweet.handler';
import * as likeHandlers from './handlers/like.handler';
import * as profileHandlers from './handlers/profile.handler';

export interface ApiRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: (request: Request, ...params: string[]) => Promise<Response>;
}

export const apiRoutes: ApiRoute[] = [
  // Auth routes
  { method: 'POST', path: '/api/auth/signup', handler: authHandlers.handleSignup },
  { method: 'POST', path: '/api/auth/login', handler: authHandlers.handleLogin },
  { method: 'POST', path: '/api/auth/logout', handler: authHandlers.handleLogout },
  { method: 'GET', path: '/api/auth/verify-email', handler: authHandlers.handleVerifyEmail },

  // Tweet routes
  { method: 'POST', path: '/api/tweets', handler: tweetHandlers.handleCreateTweet },
  { method: 'GET', path: '/api/tweets', handler: tweetHandlers.handleGetFeed },
  { method: 'GET', path: '/api/tweets/user/:userId', handler: tweetHandlers.handleGetUserTweets },
  { method: 'DELETE', path: '/api/tweets/:tweetId', handler: tweetHandlers.handleDeleteTweet },

  // Like routes
  { method: 'POST', path: '/api/likes/:tweetId', handler: likeHandlers.handleToggleLike },
  { method: 'GET', path: '/api/likes/:tweetId', handler: likeHandlers.handleGetLikeStatus },

  // Profile routes
  { method: 'GET', path: '/api/profile/me', handler: profileHandlers.handleGetOwnProfile },
  { method: 'GET', path: '/api/profile/:username', handler: profileHandlers.handleGetProfile },
  { method: 'PATCH', path: '/api/profile', handler: profileHandlers.handleUpdateProfile },
  { method: 'POST', path: '/api/profile/avatar', handler: profileHandlers.handleUploadAvatar },
];

/**
 * Match a request path against a route pattern
 * @param pattern - Route pattern (e.g., "/api/tweets/:id")
 * @param path - Request path (e.g., "/api/tweets/123")
 * @returns Parameters if match, null otherwise
 */
function matchRoute(pattern: string, path: string): string[] | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: string[] = [];

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      // Dynamic parameter
      params.push(pathPart);
    } else if (patternPart !== pathPart) {
      // Static part doesn't match
      return null;
    }
  }

  return params;
}

/**
 * Find matching route and handler for a request
 * @param method - HTTP method
 * @param path - Request path
 * @returns Matched route with params, or null
 */
export function findRoute(
  method: string,
  path: string
): { route: ApiRoute; params: string[] } | null {
  for (const route of apiRoutes) {
    if (route.method === method) {
      const params = matchRoute(route.path, path);
      if (params !== null) {
        return { route, params };
      }
    }
  }

  return null;
}
