'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { ReviewComment } from '@/types/api';
import { useComments } from '@/hooks/useMerchants';
import { getImageUrl } from '@/lib/utils';

interface CommentsViewProps {
  reviewId: string;
  initialComments?: ReviewComment[];
}

export default function CommentsView({ reviewId, initialComments = [] }: CommentsViewProps) {
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

  // Use React Query hooks
  const { data: comments = initialComments, isLoading } = useComments(reviewId);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  // Determine how many comments to show
  const maxDisplayComments = 3;
  const displayedComments = showAllComments ? comments : comments.slice(0, maxDisplayComments);
  const hasMoreComments = comments.length > maxDisplayComments;

  if (isLoading) {
    return <div className="text-center py-2 text-gray-500">Loading comments...</div>;
  }

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mt-4">
      {/* Comments Header */}
      <h5 className="text-sm font-medium text-gray-700">
        Comments ({comments.length})
      </h5>

      {/* Comment List */}
      <div className="space-y-3">
        {displayedComments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-3 py-2">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {comment.user?.avatar ? (
                <OptimizedImage
                  src={getImageUrl(comment.user.avatar)}
                  alt={comment.displayName || 'User'}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                  sizeType="avatar"
                  qualityPriority="medium"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    {(comment.displayName || comment.user?.displayName || 'A').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Comment Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-sm text-gray-900">
                  {comment.displayName || comment.user?.displayName || 'Anonymous'}
                </span>
                <span className="text-lg">{comment.reaction}</span>
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(comment.createdAt)}
                </span>
              </div>
              {comment.content && (
                <div className="mt-1">
                  {(() => {
                    const maxLength = 150; // Character limit for individual comments
                    const isExpanded = expandedComments.has(comment.id);
                    const shouldTruncate = comment.content.length > maxLength;
                    
                    return (
                      <>
                        <div
                          className={`text-sm text-gray-700 leading-relaxed whitespace-normal break-words prose prose-sm max-w-none ${
                            shouldTruncate && !isExpanded ? 'line-clamp-3' : ''
                          }`}
                          dangerouslySetInnerHTML={{ __html: comment.content }}
                        />
                        {shouldTruncate && (
                          <button
                            onClick={() => toggleCommentExpansion(comment.id)}
                            className="text-xs text-[#198639] hover:text-green-700 font-medium mt-1 cursor-pointer inline-block"
                          >
                            {isExpanded ? 'Show less' : 'Show more'}
                          </button>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Show More/Less Button */}
        {hasMoreComments && (
          <div className="text-center pt-2">
            <button
              onClick={() => setShowAllComments(!showAllComments)}
              className="text-sm text-[#198639] hover:text-green-700 font-medium"
            >
              {showAllComments 
                ? 'Show less' 
                : `View ${comments.length - maxDisplayComments} more comment${comments.length - maxDisplayComments !== 1 ? 's' : ''}`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}