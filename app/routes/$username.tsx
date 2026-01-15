import { useLoaderData } from 'react-router';
import { getUserByUsername } from '~/models/user/user.model';
import { getTweetsByUserId } from '~/models/tweet/tweet.model';
import { getLikeCount, isLikedByUser } from '~/models/like/like.model';
import { getUserId } from '~/lib/auth/session';
import { TweetFeed } from '~/components/tweet/TweetFeed';
import { formatDistanceToNow } from 'date-fns';
import type { Route } from './+types/$username';

export async function loader({ params, request }: Route.LoaderArgs) {
  const username = params.username;

  // Get profile
  const profile = await getUserByUsername(username);

  if (!profile) {
    throw new Response('User not found', { status: 404 });
  }

  // Get current user ID (optional)
  const currentUserId = await getUserId(request).catch(() => null);

  // Get user's tweets
  const tweets = await getTweetsByUserId(profile.id, 20, 0);

  // Enrich tweets with like information
  const enrichedTweets = await Promise.all(
    tweets.map(async (tweet) => {
      const likeCount = await getLikeCount(tweet.id);
      const isLiked = currentUserId ? await isLikedByUser(tweet.id, currentUserId) : false;
      return {
        ...tweet,
        likeCount,
        isLiked,
      };
    })
  );

  const isOwnProfile = currentUserId === profile.id;

  return {
    profile,
    tweets: enrichedTweets,
    isOwnProfile,
    currentUserId,
  };
}

export default function UserProfilePage() {
  const { profile, tweets, isOwnProfile, currentUserId } = useLoaderData<typeof loader>();

  const formatJoinDate = (date: Date | string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div>
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.username}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-3xl">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
              {isOwnProfile && (
                <a
                  href="/settings"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                >
                  Edit Profile
                </a>
              )}
            </div>

            {profile.bio && (
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{profile.bio}</p>
            )}

            <p className="text-gray-500 text-sm">
              Joined {formatJoinDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Tweets Section */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Tweets ({tweets.length})
        </h2>

        <TweetFeed
          tweets={tweets}
          currentUserId={currentUserId ?? undefined}
          showLoadMore={false}
        />
      </div>
    </div>
  );
}
