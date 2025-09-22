'use client';

import { useState } from 'react';
import moment from 'moment';

interface CommentItemProps {
  comment: {
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
  };
  onReport?: (commentId: string) => void;
  isAdmin?: boolean;
}

const REACTION_MAP: Record<string, string> = {
  love: '❤️',
  sad: '😢',
  angry: '😡',
};

export default function CommentItem({ comment, onReport, isAdmin = false }: CommentItemProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);

  // Don't show comment if it's marked as spam or hidden (unless admin)
  if ((comment.status === 'spam' || comment.status === 'hidden') && !isAdmin) {
    return null;
  }

  const handleReport = async () => {
    if (hasReported || !onReport) return;

    setIsReporting(true);
    try {
      await onReport(comment.id);
      setHasReported(true);
    } catch (error) {
      console.error('Failed to report comment:', error);
      alert('Failed to report comment. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };

  const getDisplayName = () => {
    return comment.user?.displayName || comment.displayName || 'Anonymous';
  };

  const getReactionEmoji = () => {
    return REACTION_MAP[comment.reaction] || comment.reaction;
  };

  return (
    <div className={`
      border-l-4 pl-4 py-3
      ${(comment.status === 'spam' || comment.status === 'hidden') ? 'opacity-50 bg-red-50 border-red-400' : 'border-gray-200'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Reaction */}
          <span className="text-xl" title={comment.reaction}>
            {getReactionEmoji()}
          </span>

          {/* Author & Time */}
          <div>
            <span className="font-medium text-gray-900">{getDisplayName()}</span>
            <span className="text-gray-500 text-sm ml-2">
              {moment(comment.createdAt).fromNow()}
            </span>
          </div>

          {/* Admin indicators */}
          {isAdmin && (
            <div className="flex items-center gap-2 ml-4">
              {(comment.status === 'spam' || comment.status === 'hidden') && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                  SPAM
                </span>
              )}
              {comment.reportCount && comment.reportCount > 0 && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                  {comment.reportCount} reports
                </span>
              )}
            </div>
          )}
        </div>

        {/* Report button */}
        {!isAdmin && onReport && (
          <button
            onClick={handleReport}
            disabled={hasReported || isReporting}
            className={`
              text-sm px-2 py-1 rounded transition-colors
              ${hasReported
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
              }
            `}
            title={hasReported ? 'Already reported' : 'Report as inappropriate'}
          >
            {hasReported ? (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Reported
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 2v9m0 4v.01M8 7l4-4 4 4m-4 12a9 9 0 100-18 9 9 0 000 18z" />
                </svg>
                {isReporting ? 'Reporting...' : 'Report'}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="text-gray-700">
        {comment.content}
      </div>
    </div>
  );
}