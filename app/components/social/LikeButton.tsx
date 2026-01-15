import { useState, useEffect } from 'react';

interface LikeButtonProps {
  tweetId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  onLike?: (tweetId: string, liked: boolean) => void;
}

export function LikeButton({
  tweetId,
  initialLiked = false,
  initialLikeCount = 0,
  onLike,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLiked, initialLikeCount]);

  const handleClick = async () => {
    if (isLoading) return;

    // Optimistic update
    const previousLiked = liked;
    const previousCount = likeCount;
    const newLiked = !liked;

    setLiked(newLiked);
    setLikeCount(newLiked ? likeCount + 1 : Math.max(0, likeCount - 1));
    setIsLoading(true);

    try {
      // Call the parent handler if provided
      if (onLike) {
        onLike(tweetId, newLiked);
      }

      // The parent component should handle the actual API call
      // This component just provides optimistic UI
    } catch (error) {
      // Revert on error
      setLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`flex items-center space-x-1 transition ${
        liked
          ? 'text-red-600 hover:text-red-700'
          : 'text-gray-500 hover:text-red-600'
      } ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
    >
      <span className="text-lg">{liked ? '❤️' : '🤍'}</span>
      <span className="text-sm font-medium">{likeCount}</span>
    </button>
  );
}
