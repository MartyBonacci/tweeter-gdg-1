import { formatDistanceToNow } from 'date-fns';
import { LikeButton } from '~/components/social/LikeButton';
import type { TweetWithAuthor } from '~/models/tweet/tweet.model';

interface TweetFeedItemProps {
  tweet: TweetWithAuthor;
  currentUserId?: string;
  onDelete?: (tweetId: string) => void;
  onLike?: (tweetId: string, liked: boolean) => void;
  showLikeButton?: boolean;
  showDeleteButton?: boolean;
}

export function TweetFeedItem({
  tweet,
  currentUserId,
  onDelete,
  onLike,
  showLikeButton = true,
  showDeleteButton = true,
}: TweetFeedItemProps) {
  const formatTimestamp = (date: Date | string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const isOwnTweet = currentUserId === tweet.profileId;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-start space-x-3">
        <a href={`/${tweet.author.username}`}>
          {tweet.author.avatarUrl ? (
            <img
              src={tweet.author.avatarUrl}
              alt={tweet.author.username}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg">
              {tweet.author.username.charAt(0).toUpperCase()}
            </div>
          )}
        </a>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <a
              href={`/${tweet.author.username}`}
              className="font-semibold text-gray-900 hover:text-blue-600"
            >
              {tweet.author.username}
            </a>
            <span className="text-gray-500 text-sm">
              {formatTimestamp(tweet.createdAt)}
            </span>
          </div>

          <p className="text-gray-900 whitespace-pre-wrap break-words">
            {tweet.content}
          </p>

          <div className="mt-3 flex items-center space-x-4 text-gray-500">
            {showLikeButton && (
              <LikeButton
                tweetId={tweet.id}
                initialLiked={tweet.isLiked ?? false}
                initialLikeCount={tweet.likeCount ?? 0}
                onLike={onLike}
              />
            )}

            {showDeleteButton && isOwnTweet && onDelete && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this tweet?')) {
                    onDelete(tweet.id);
                  }
                }}
                className="hover:text-red-600 transition"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
