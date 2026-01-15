
import { toggleLike, getLikeCount, isLikedByUser } from '~/models/like/like.model';
import { requireAuth } from '~/lib/auth/session';

/**
 * Handle like toggle
 * POST /api/likes/:tweetId
 */
export async function handleToggleLike(request: Request, tweetId: string): Promise<Response> {
  try {
    // Require authentication
    const userId = await requireAuth(request);

    // Toggle the like
    const liked = await toggleLike(tweetId, userId);

    // Get updated like count
    const likeCount = await getLikeCount(tweetId);

    return Response.json({
      success: true,
      liked,
      likeCount,
      message: liked ? 'Tweet liked' : 'Tweet unliked',
    });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to toggle like' }, { status: 500 });
  }
}

/**
 * Handle get like status
 * GET /api/likes/:tweetId
 */
export async function handleGetLikeStatus(
  request: Request,
  tweetId: string
): Promise<Response> {
  try {
    // Get user ID (optional auth)
    const userId = await requireAuth(request).catch(() => null);

    // Get like count
    const likeCount = await getLikeCount(tweetId);

    // Check if current user has liked (if authenticated)
    let liked = false;
    if (userId) {
      liked = await isLikedByUser(tweetId, userId);
    }

    return Response.json({
      likeCount,
      liked,
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch like status' }, { status: 500 });
  }
}
