import { useLoaderData, useRevalidator } from 'react-router';
import { requireAuth, getUserId } from '~/lib/auth/session';
import { getFeed, createTweet, deleteTweet } from '~/models/tweet/tweet.model';
import { getLikeCount, isLikedByUser, toggleLike } from '~/models/like/like.model';
import { TweetFeed } from '~/components/tweet/TweetFeed';
import { TweetComposer } from '~/components/tweet/TweetComposer';
import type { Route } from './+types/home';

export async function loader({ request }: Route.LoaderArgs) {
  await requireAuth(request);
  const userId = await getUserId(request);
  const tweets = await getFeed(20, 0);

  // Enrich tweets with like information
  const enrichedTweets = await Promise.all(
    tweets.map(async (tweet) => {
      const likeCount = await getLikeCount(tweet.id);
      const isLiked = userId ? await isLikedByUser(tweet.id, userId) : false;
      return {
        ...tweet,
        likeCount,
        isLiked,
      };
    })
  );

  return { tweets: enrichedTweets, userId };
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireAuth(request);
  const formData = await request.formData();
  const tweetId = formData.get('tweetId') as string;
  const intent = formData.get('intent') as string;

  // Handle tweet composition
  if (intent === 'compose') {
    const content = formData.get('content') as string;

    try {
      await createTweet(userId, { content });
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to create tweet' };
    }
  }

  // Handle tweet deletion
  if (intent === 'delete' && tweetId) {
    try {
      const deleted = await deleteTweet(tweetId, userId);
      if (!deleted) {
        return { error: 'Failed to delete tweet' };
      }
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to delete tweet' };
    }
  }

  // Handle tweet like/unlike
  if (intent === 'like' && tweetId) {
    try {
      await toggleLike(tweetId, userId);
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Failed to toggle like' };
    }
  }

  return null;
}

export default function HomePage() {
  const { tweets, userId } = useLoaderData<typeof loader>();
  const revalidator = useRevalidator();

  const handleLoadMore = () => {
    revalidator.revalidate();
  };

  const handleDelete = async (tweetId: string) => {
    const formData = new FormData();
    formData.append('tweetId', tweetId);
    formData.append('intent', 'delete');

    const response = await fetch('/home', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      revalidator.revalidate();
    }
  };

  const handleLike = async (tweetId: string, liked: boolean) => {
    const formData = new FormData();
    formData.append('tweetId', tweetId);
    formData.append('intent', 'like');

    const response = await fetch('/home', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      // Revalidate to ensure data consistency
      revalidator.revalidate();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Inline Tweet Composer */}
      <div className="mb-6">
        <TweetComposer
          showCancelButton={false}
          redirectOnSuccess={false}
        />
      </div>

      {/* Tweet Feed */}
      <TweetFeed
        tweets={tweets}
        currentUserId={userId ?? undefined}
        onDelete={handleDelete}
        onLike={handleLike}
        showLoadMore={tweets.length >= 20}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
