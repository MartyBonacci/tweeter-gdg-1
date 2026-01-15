import { z } from 'zod';

export const updateProfileSchema = z.object({
  bio: z.string().max(160, 'Bio cannot exceed 160 characters').optional(),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
