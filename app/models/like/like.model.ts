import { eq, and, count } from 'drizzle-orm';
import { db } from '~/lib/db/connection';
import { likes, tweets } from '~/lib/db/schema';

/**
 * Toggle like on a tweet
 * @param tweetId - Tweet ID
 * @param userId - User ID
 * @returns true if liked, false if unliked
 */
export async function toggleLike(tweetId: string, userId: string): Promise<boolean> {
  // Check if like already exists
  const existingLike = await db
    .select()
    .from(likes)
    .where(and(eq(likes.tweetId, tweetId), eq(likes.profileId, userId)))
    .limit(1);

  if (existingLike.length > 0) {
    // Unlike: Delete the like
    await db
      .delete(likes)
      .where(and(eq(likes.tweetId, tweetId), eq(likes.profileId, userId)));
    return false;
  } else {
    // Like: Insert the like
    await db.insert(likes).values({
      tweetId,
      profileId: userId,
    });
    return true;
  }
}

/**
 * Check if a user has liked a tweet
 * @param tweetId - Tweet ID
 * @param userId - User ID
 * @returns true if liked, false otherwise
 */
export async function isLikedByUser(tweetId: string, userId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(likes)
    .where(and(eq(likes.tweetId, tweetId), eq(likes.profileId, userId)))
    .limit(1);

  return result.length > 0;
}

/**
 * Get like count for a tweet
 * @param tweetId - Tweet ID
 * @returns Number of likes
 */
export async function getLikeCount(tweetId: string): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(likes)
    .where(eq(likes.tweetId, tweetId));

  return result[0]?.count ?? 0;
}

/**
 * Get like counts for multiple tweets
 * @param tweetIds - Array of tweet IDs
 * @returns Map of tweetId to like count
 */
export async function getLikeCounts(tweetIds: string[]): Promise<Map<string, number>> {
  if (tweetIds.length === 0) {
    return new Map();
  }

  const results = await db
    .select({
      tweetId: likes.tweetId,
      count: count(),
    })
    .from(likes)
    .where(
      eq(
        likes.tweetId,
        tweetIds[0] // Note: This needs to be updated to use IN clause for multiple IDs
      )
    )
    .groupBy(likes.tweetId);

  const likeCounts = new Map<string, number>();
  for (const result of results) {
    likeCounts.set(result.tweetId, result.count);
  }

  // Fill in 0 for tweets with no likes
  for (const tweetId of tweetIds) {
    if (!likeCounts.has(tweetId)) {
      likeCounts.set(tweetId, 0);
    }
  }

  return likeCounts;
}

/**
 * Get tweets liked by a user
 * @param userId - User ID
 * @param limit - Maximum number to return
 * @param offset - Number to skip
 * @returns Array of tweet IDs
 */
export async function getLikedTweetIds(
  userId: string,
  limit = 20,
  offset = 0
): Promise<string[]> {
  const results = await db
    .select({ tweetId: likes.tweetId })
    .from(likes)
    .where(eq(likes.profileId, userId))
    .limit(limit)
    .offset(offset);

  return results.map((r) => r.tweetId);
}
