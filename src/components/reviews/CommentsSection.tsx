'use client';

import { useState } from 'react';
import CommentForm, { CommentData } from './CommentForm';
import CommentItem from './CommentItem';
import { useAuth } from '@/contexts/AuthContext';

interface Comment {
  id: string;
  displayName?: string;
  reaction: string;
  content?: string;
  status?: string;
  reportCount?: number;
  createdAt: string | Date;
  user?: {
    displayName?: string;
    avatar?: string;
  };
}

interface CommentsSectionProps {
  reviewId: string;
  comments: Comment[];
  onCommentAdded?: (comment: Comment) => void;
}

export default function CommentsSection({ reviewId, comments, onCommentAdded }: CommentsSectionProps) {
  const { isAuthenticated } = useAuth();
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [localComments, setLocalComments] = useState<Comment[]>(comments);

  const handleCommentSubmit = async (data: CommentData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(isAuthenticated && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to post comment');
      }

      const result = await response.json();
      const newComment = result.comment;

      // Add to local state
      setLocalComments([newComment, ...localComments]);
      setShowCommentForm(false);

      // Callback
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to post comment. Please try again.');
    } finally {
      // Comment submission complete
    }
  };

  const handleReportComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/comments/${commentId}/report`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(isAuthenticated && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
          },
          body: JSON.stringify({ reason: 'Inappropriate content' })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (response.status === 429) {
          alert('You have already reported this comment recently.');
        } else {
          throw new Error(error.error || 'Failed to report');
        }
        return;
      }

      // Update local state if comment was auto-marked as spam
      const updatedComments = localComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, reportCount: (comment.reportCount || 0) + 1 };
        }
        return comment;
      });
      setLocalComments(updatedComments);

      alert('Comment reported successfully.');
    } catch (error) {
      console.error('Failed to report comment:', error);
      alert('Failed to report comment. Please try again.');
    }
  };

  // Count reactions
  const reactionCounts = localComments.reduce((acc, comment) => {
    const reaction = comment.reaction;
    if (reaction === 'love') acc.love++;
    if (reaction === 'sad') acc.sad++;
    if (reaction === 'angry') acc.angry++;
    return acc;
  }, { love: 0, sad: 0, angry: 0 });

  return (
    <div className="mt-8">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Comments ({localComments.length})
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <span>❤️ {reactionCounts.love}</span>
            <span>😢 {reactionCounts.sad}</span>
            <span>😡 {reactionCounts.angry}</span>
          </div>
        </div>
        {!showCommentForm && (
          <button
            onClick={() => setShowCommentForm(true)}
            className="px-4 py-2 bg-[#198639] text-white rounded-md hover:bg-[#15732f] font-medium transition-colors"
          >
            Add Comment
          </button>
        )}
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <div className="mb-6">
          <CommentForm
            reviewId={reviewId}
            onSubmit={handleCommentSubmit}
            onCancel={() => setShowCommentForm(false)}
          />
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {localComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          localComments
            .filter(comment => comment.status !== 'hidden' && comment.status !== 'spam') // Hide spam/hidden comments
            .map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReport={handleReportComment}
                isAdmin={false}
              />
            ))
        )}
      </div>
    </div>
  );
}