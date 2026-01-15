
import { createTweet, getFeed, getTweetsByUserId, deleteTweet } from '~/models/tweet/tweet.model';
import { requireAuth } from '~/lib/auth/session';
import { tweetRateLimiter, getClientIp } from '~/lib/security/rate-limit';

/**
 * Handle tweet creation
 * POST /api/tweets
 */
export async function handleCreateTweet(request: Request): Promise<Response> {
  try {
    // Require authentication
    const userId = await requireAuth(request);

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await tweetRateLimiter(clientIp);

    if (!rateLimit.allowed) {
      return Response.json(
        { error: 'Too many tweets. Please slow down.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();

    // Create tweet
    const tweet = await createTweet(userId, body);

    return Response.json(tweet, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create tweet' }, { status: 500 });
  }
}

/**
 * Handle feed fetch
 * GET /api/tweets?limit=20&offset=0
 */
export async function handleGetFeed(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const tweets = await getFeed(limit, offset);

    return Response.json({ tweets });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch feed' }, { status: 500 });
  }
}

/**
 * Handle user tweets fetch
 * GET /api/tweets/user/:userId
 */
export async function handleGetUserTweets(request: Request, userId: string): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const tweets = await getTweetsByUserId(userId, limit, offset);

    return Response.json({ tweets });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch tweets' }, { status: 500 });
  }
}

/**
 * Handle tweet deletion
 * DELETE /api/tweets/:tweetId
 */
export async function handleDeleteTweet(request: Request, tweetId: string): Promise<Response> {
  try {
    // Require authentication
    const userId = await requireAuth(request);

    // Attempt to delete the tweet
    const deleted = await deleteTweet(tweetId, userId);

    if (!deleted) {
      return Response.json(
        { error: 'Tweet not found or you are not authorized to delete it' },
        { status: 404 }
      );
    }

    return Response.json({ success: true, message: 'Tweet deleted successfully' });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to delete tweet' }, { status: 500 });
  }
}
