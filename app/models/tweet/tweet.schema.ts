import { z } from 'zod';

export const tweetSchema = z.object({
  content: z
    .string()
    .min(1, 'Tweet cannot be empty')
    .max(140, 'Tweet cannot exceed 140 characters'),
});

export type TweetData = z.infer<typeof tweetSchema>;
