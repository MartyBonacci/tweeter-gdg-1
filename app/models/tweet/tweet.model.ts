import { eq, desc } from 'drizzle-orm';
import db from '~/lib/db/connection';
import { tweets, profiles } from '~/lib/db/schema';
import { tweetSchema, type TweetData } from './tweet.schema';

export interface TweetWithAuthor {
  id: string;
  content: string;
  createdAt: Date;
  profileId: string;
  author: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };
  likeCount?: number;
  isLiked?: boolean;
}

/**
 * Create a new tweet
 * @param profileId - ID of the user creating the tweet
 * @param data - Tweet data
 * @returns Created tweet
 */
export async function createTweet(profileId: string, data: TweetData) {
  // Validate content
  const validated = tweetSchema.parse(data);

  // Insert tweet
  const [tweet] = await db
    .insert(tweets)
    .values({
      profileId,
      content: validated.content,
    })
    .returning();

  return tweet;
}

/**
 * Get global tweet feed (all tweets, newest first)
 * @param limit - Maximum number of tweets to return
 * @param offset - Number of tweets to skip
 * @returns Array of tweets with author information
 */
export async function getFeed(limit = 20, offset = 0): Promise<TweetWithAuthor[]> {
  const results = await db
    .select({
      id: tweets.id,
      content: tweets.content,
      createdAt: tweets.createdAt,
      profileId: tweets.profileId,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(tweets)
    .innerJoin(profiles, eq(tweets.profileId, profiles.id))
    .orderBy(desc(tweets.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

/**
 * Get tweets by a specific user
 * @param userId - User ID
 * @param limit - Maximum number of tweets to return
 * @param offset - Number of tweets to skip
 * @returns Array of user's tweets
 */
export async function getTweetsByUserId(userId: string, limit = 20, offset = 0): Promise<TweetWithAuthor[]> {
  const results = await db
    .select({
      id: tweets.id,
      content: tweets.content,
      createdAt: tweets.createdAt,
      profileId: tweets.profileId,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(tweets)
    .innerJoin(profiles, eq(tweets.profileId, profiles.id))
    .where(eq(tweets.profileId, userId))
    .orderBy(desc(tweets.createdAt))
    .limit(limit)
    .offset(offset);

  return results;
}

/**
 * Get a single tweet by ID
 * @param tweetId - Tweet ID
 * @returns Tweet with author information or null
 */
export async function getTweetById(tweetId: string): Promise<TweetWithAuthor | null> {
  const results = await db
    .select({
      id: tweets.id,
      content: tweets.content,
      createdAt: tweets.createdAt,
      profileId: tweets.profileId,
      author: {
        id: profiles.id,
        username: profiles.username,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(tweets)
    .innerJoin(profiles, eq(tweets.profileId, profiles.id))
    .where(eq(tweets.id, tweetId))
    .limit(1);

  return results[0] || null;
}

/**
 * Delete a tweet
 * @param tweetId - Tweet ID
 * @param userId - ID of the user attempting to delete
 * @returns True if deleted, false if tweet not found or user not authorized
 */
export async function deleteTweet(tweetId: string, userId: string): Promise<boolean> {
  // First, verify the tweet exists and belongs to the user
  const tweet = await db
    .select({
      id: tweets.id,
      profileId: tweets.profileId,
    })
    .from(tweets)
    .where(eq(tweets.id, tweetId))
    .limit(1);

  if (tweet.length === 0) {
    return false; // Tweet not found
  }

  if (tweet[0].profileId !== userId) {
    return false; // User is not the author
  }

  // Delete the tweet (likes will be cascade deleted by DB)
  await db.delete(tweets).where(eq(tweets.id, tweetId));

  return true;
}
