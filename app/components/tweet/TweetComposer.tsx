import { useState, useEffect } from 'react';
import { Form, useActionData } from 'react-router';

interface TweetComposerProps {
  onCancel?: () => void;
  showCancelButton?: boolean;
  redirectOnSuccess?: boolean;
}

export function TweetComposer({
  onCancel,
  showCancelButton = false,
  redirectOnSuccess = true,
}: TweetComposerProps) {
  const actionData = useActionData<{ success?: boolean; error?: string }>();
  const [content, setContent] = useState('');

  // Clear form on successful submission
  useEffect(() => {
    if (actionData?.success) {
      setContent('');
    }
  }, [actionData]);

  const remainingChars = 140 - content.length;
  const isValid = content.length > 0 && content.length <= 140;
  const isOverLimit = remainingChars < 0;
  const isNearLimit = remainingChars < 20 && remainingChars >= 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <Form method="post" className="space-y-4" autoComplete="off">
        <input type="hidden" name="intent" value="compose" />
        <div>
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            autoComplete="off"
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
              isOverLimit ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-2">
            <span
              className={`text-sm font-medium ${
                isOverLimit
                  ? 'text-red-600'
                  : isNearLimit
                    ? 'text-yellow-600'
                    : 'text-gray-500'
              }`}
            >
              {remainingChars} characters remaining
            </span>
            {isOverLimit && (
              <span className="text-xs text-red-600">
                Your tweet is too long!
              </span>
            )}
          </div>
        </div>

        {actionData?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{actionData.error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!isValid}
            className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Tweet
          </button>
          {showCancelButton && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          )}
        </div>
      </Form>
    </div>
  );
}
