import { useState } from 'react';
import { useLoaderData, useActionData, Form, useNavigate, useRevalidator } from 'react-router';
import { requireAuth } from '~/lib/auth/session';
import { getUserById, updateProfile } from '~/models/user/user.model';
import { updateProfileSchema } from '~/models/user/user.schema';
import { AvatarUpload } from '~/components/profile/AvatarUpload';
import type { Route } from './+types/settings';

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireAuth(request);
  const profile = await getUserById(userId);

  if (!profile) {
    throw new Response('Profile not found', { status: 404 });
  }

  return { profile };
}

export async function action({ request }: Route.ActionArgs) {
  try {
    const userId = await requireAuth(request);
    const formData = await request.formData();

    const bio = formData.get('bio') as string;

    // Validate (only bio field - avatarUrl is handled separately by AvatarUpload component)
    const validated = updateProfileSchema.parse({ bio });

    // Update profile
    const updatedProfile = await updateProfile(userId, validated);

    if (!updatedProfile) {
      return { error: 'Failed to update profile' };
    }

    return { success: true, profile: updatedProfile };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Failed to update profile' };
  }
}

export default function SettingsPage() {
  const { profile } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [bio, setBio] = useState(profile.bio || '');

  const bioLength = bio.length;
  const bioRemaining = 160 - bioLength;
  const isBioValid = bioLength <= 160;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h1>

        {/* Avatar Upload Section (outside form) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Profile Picture
          </label>
          <AvatarUpload
            currentAvatarUrl={profile.avatarUrl}
            username={profile.username}
            onUploadComplete={() => revalidator.revalidate()}
          />
        </div>

        <Form method="post" className="space-y-6">

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                !isBioValid ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-1">
              <span className={`text-sm ${bioRemaining < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                {bioRemaining} characters remaining
              </span>
            </div>
          </div>

          {/* Success/Error Messages */}
          {actionData && 'success' in actionData && actionData.success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">Profile updated successfully!</p>
            </div>
          )}

          {actionData && 'error' in actionData && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{actionData.error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!isBioValid}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => navigate(`/${profile.username}`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
