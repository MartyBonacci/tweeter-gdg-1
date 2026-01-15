import { TweetFeedItem } from './TweetFeedItem';
import type { TweetWithAuthor } from '~/models/tweet/tweet.model';

interface TweetFeedProps {
  tweets: TweetWithAuthor[];
  currentUserId?: string;
  onDelete?: (tweetId: string) => void;
  onLike?: (tweetId: string, liked: boolean) => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
}

export function TweetFeed({
  tweets,
  currentUserId,
  onDelete,
  onLike,
  showLoadMore = false,
  onLoadMore,
}: TweetFeedProps) {
  if (tweets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500 mb-4">No tweets yet. Be the first to post!</p>
        <a
          href="/compose"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Compose Your First Tweet
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetFeedItem
          key={tweet.id}
          tweet={tweet}
          currentUserId={currentUserId}
          onDelete={onDelete}
          onLike={onLike}
        />
      ))}

      {showLoadMore && onLoadMore && (
        <div className="text-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
