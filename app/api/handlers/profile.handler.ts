
import { getUserById, getUserByUsername, updateProfile } from '~/models/user/user.model';
import { updateProfileSchema } from '~/models/user/user.schema';
import { requireAuth } from '~/lib/auth/session';
import { uploadToCloudinary } from '~/lib/upload/cloudinary';

/**
 * Handle get profile by username
 * GET /api/profile/:username
 */
export async function handleGetProfile(
  request: Request,
  username: string
): Promise<Response> {
  try {
    const profile = await getUserByUsername(username);

    if (!profile) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/**
 * Handle update own profile
 * PATCH /api/profile
 */
export async function handleUpdateProfile(request: Request): Promise<Response> {
  try {
    // Require authentication
    const userId = await requireAuth(request);

    // Parse request body
    const body = await request.json();

    // Validate data
    const validated = updateProfileSchema.parse(body);

    // Update profile
    const updatedProfile = await updateProfile(userId, validated);

    if (!updatedProfile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json({ profile: updatedProfile });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

/**
 * Handle get own profile
 * GET /api/profile/me
 */
export async function handleGetOwnProfile(request: Request): Promise<Response> {
  try {
    // Require authentication
    const userId = await requireAuth(request);

    const profile = await getUserById(userId);

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }

    return Response.json({ profile });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

/**
 * Handle avatar upload
 * POST /api/profile/avatar
 */
export async function handleUploadAvatar(request: Request): Promise<Response> {
  console.log('[handleUploadAvatar] Called');
  try {
    // Require authentication
    const userId = await requireAuth(request);
    console.log('[handleUploadAvatar] User authenticated:', userId);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    console.log('[handleUploadAvatar] File received:', file ? 'yes' : 'no');

    if (!file) {
      console.log('[handleUploadAvatar] No file, returning error');
      return Response.json({ error: 'No file provided' }, { status: 200 });
    }

    // Validate file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return Response.json({ error: 'File size exceeds 5MB limit' }, { status: 200 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return Response.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 200 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const avatarUrl = await uploadToCloudinary(buffer, 'avatars');

    // Update profile with new avatar URL
    const updatedProfile = await updateProfile(userId, { avatarUrl });

    if (!updatedProfile) {
      return Response.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return Response.json({
      success: true,
      avatarUrl,
      profile: updatedProfile,
    });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 200 });
    }
    return Response.json({ error: 'Failed to upload avatar' }, { status: 200 });
  }
}
