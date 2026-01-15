import { eq } from 'drizzle-orm';
import { db } from '~/lib/db/connection';
import { profiles } from '~/lib/db/schema';

export interface PublicProfile {
  id: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: Date;
}

/**
 * Get user by ID
 * @param userId - User ID
 * @returns Public profile or null
 */
export async function getUserById(userId: string): Promise<PublicProfile | null> {
  const results = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  return results[0] || null;
}

/**
 * Get user by username
 * @param username - Username
 * @returns Public profile or null
 */
export async function getUserByUsername(username: string): Promise<PublicProfile | null> {
  const results = await db
    .select({
      id: profiles.id,
      username: profiles.username,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  return results[0] || null;
}

/**
 * Update user profile
 * @param userId - User ID
 * @param data - Profile data to update (bio and/or avatarUrl)
 * @returns Updated profile or null if user not found
 */
export async function updateProfile(
  userId: string,
  data: { bio?: string; avatarUrl?: string }
): Promise<PublicProfile | null> {
  // Build update object with only provided fields
  const updateData: Partial<typeof profiles.$inferInsert> = {};
  if (data.bio !== undefined) {
    updateData.bio = data.bio;
  }
  if (data.avatarUrl !== undefined) {
    updateData.avatarUrl = data.avatarUrl;
  }

  if (Object.keys(updateData).length === 0) {
    // No updates provided, return current profile
    return getUserById(userId);
  }

  const results = await db
    .update(profiles)
    .set(updateData)
    .where(eq(profiles.id, userId))
    .returning({
      id: profiles.id,
      username: profiles.username,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      createdAt: profiles.createdAt,
    });

  return results[0] || null;
}

/**
 * Check if username exists
 * @param username - Username to check
 * @returns true if exists, false otherwise
 */
export async function usernameExists(username: string): Promise<boolean> {
  const results = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.username, username))
    .limit(1);

  return results.length > 0;
}
