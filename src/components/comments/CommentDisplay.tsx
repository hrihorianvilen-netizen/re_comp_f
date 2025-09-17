'use client';

import OptimizedImage from '@/components/ui/OptimizedImage';
import { ReviewComment } from '@/types/api';
import { getImageUrl } from '@/lib/utils';

interface CommentDisplayProps {
  comments: ReviewComment[];
  showAll?: boolean;
  maxDisplay?: number;
}


export default function CommentDisplay({ comments, showAll = false, maxDisplay = 3 }: CommentDisplayProps) {
  if (!comments || comments.length === 0) {
    return null;
  }

  const displayComments = showAll ? comments : comments.slice(0, maxDisplay);
  const remainingCount = comments.length - maxDisplay;

  // Group comments by reaction for summary display
  const reactionCounts = comments.reduce((acc, comment) => {
    acc[comment.reaction] = (acc[comment.reaction] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-2">
      {/* Reaction Summary */}
      {Object.keys(reactionCounts).length > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Reactions:</span>
          {Object.entries(reactionCounts).map(([reaction, count]) => (
            <div key={reaction} className="flex items-center space-x-1">
              <span className="text-base">{reaction}</span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Individual Comments */}
      <div className="space-y-2">
        {displayComments.map((comment, index) => (
          <div key={comment.id || index} className="bg-gray-50 rounded px-3 py-2">
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {comment.user?.avatar ? (
                  <OptimizedImage
                    src={getImageUrl(comment.user.avatar)}
                    alt={comment.displayName || 'User'}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover"
                    sizeType="avatar"
                    qualityPriority="medium"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      {(comment.displayName || comment.user?.displayName || 'A').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {comment.displayName || comment.user?.displayName || 'Anonymous'}
                  </p>
                  <span className="text-base">{comment.reaction}</span>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {comment.content && (
                  <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
                )}
                {comment.isReported && (
                  <span className="inline-block mt-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded">
                    ⚠️ Reported
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show More Link */}
      {!showAll && remainingCount > 0 && (
        <button className="text-sm text-[#198639] hover:text-green-700 font-medium">
          View {remainingCount} more comment{remainingCount !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}