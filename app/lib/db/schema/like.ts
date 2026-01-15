import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { profiles } from './profile';
import { tweets } from './tweet';

export const likes = pgTable('likes', {
  tweetId: uuid('tweet_id')
    .references(() => tweets.id, { onDelete: 'cascade' })
    .notNull(),
  profileId: uuid('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.tweetId, table.profileId] }),
}));

export type Like = typeof likes.$inferSelect;
export type NewLike = typeof likes.$inferInsert;
