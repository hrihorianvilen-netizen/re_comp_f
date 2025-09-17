'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { ReviewComment } from '@/types/api';
import { useComments, useAddComment } from '@/hooks/useMerchants';
import { getImageUrl } from '@/lib/utils';

interface CommentSystemProps {
  reviewId: string;
  merchantSlug: string;
  initialComments?: ReviewComment[];
}

const reactionEmojis = {
  '❤️': { emoji: '❤️', label: 'Love' },
  '😢': { emoji: '😢', label: 'Sad' },
  '😡': { emoji: '😡', label: 'Angry' }
};

export default function CommentSystem({ reviewId, merchantSlug, initialComments = [] }: CommentSystemProps) {
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false);
  const [newComment, setNewComment] = useState({ reaction: '❤️' as '❤️' | '😢' | '😡', content: '', displayName: '' });
  const [showAllComments, setShowAllComments] = useState(false);

  // Use React Query hooks
  const { data: comments = initialComments, isLoading } = useComments(reviewId);
  const addCommentMutation = useAddComment();

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.reaction) return;

    try {
      await addCommentMutation.mutateAsync({
        reviewId,
        merchantSlug,
        data: {
          reaction: newComment.reaction,
          content: newComment.content.trim() || undefined,
          displayName: newComment.displayName.trim() || undefined
        }
      });
      
      // Reset form
      setNewComment({ reaction: '❤️', content: '', displayName: '' });
      setIsCommentFormOpen(false);
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

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

  // Determine how many comments to show
  const maxDisplayComments = 3;
  const displayedComments = showAllComments ? comments : comments.slice(0, maxDisplayComments);
  const hasMoreComments = comments.length > maxDisplayComments;

  if (isLoading) {
    return <div className="text-center py-2 text-gray-500">Loading comments...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Comment List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {displayedComments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 py-3">
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
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                    {comment.content}
                  </p>
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
      )}

      {/* Add Comment Button - Always visible at the bottom */}
      <div className="pt-2 border-t border-gray-100">
        {!isCommentFormOpen ? (
          <button
            onClick={() => setIsCommentFormOpen(true)}
            className="flex items-center space-x-2 text-[#198639] hover:text-green-700 font-medium transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add a comment</span>
          </button>
        ) : (
          /* Add Comment Form */
          <div className="bg-gray-50 rounded-lg p-4 border">
            <form onSubmit={handleAddComment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your reaction *
                </label>
                <div className="flex space-x-2">
                  {Object.entries(reactionEmojis).map(([key, { emoji, label }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setNewComment(prev => ({ ...prev, reaction: key as '❤️' | '😢' | '😡' }))}
                      className={`px-3 py-2 rounded-lg border-2 transition-colors flex items-center space-x-1 text-sm ${
                        newComment.reaction === key
                          ? 'border-[#198639] bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-base">{emoji}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="comment-content" className="block text-sm font-medium text-gray-700 mb-1">
                  Comment (Optional)
                </label>
                <textarea
                  id="comment-content"
                  value={newComment.content}
                  onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent text-sm"
                  placeholder="Share your thoughts..."
                />
              </div>
              
              <div>
                <label htmlFor="display-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Display name (Optional)
                </label>
                <input
                  id="display-name"
                  type="text"
                  value={newComment.displayName}
                  onChange={(e) => setNewComment(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent text-sm"
                  placeholder="How should we display your name?"
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.reaction}
                  className="px-4 py-2 bg-[#198639] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCommentFormOpen(false);
                    setNewComment({ reaction: '❤️', content: '', displayName: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}