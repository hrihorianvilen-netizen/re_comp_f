'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useAuth';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { RatingStars } from '@/components/ui';
import { Review, ReviewComment } from '@/types/api';

export default function MyReviewsPage() {
  const [filter, setFilter] = useState<'all' | 'recent' | 'most-comments'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const router = useRouter();
  const queryClient = useQueryClient();

  // Use React Query for user authentication
  const { data: user, isLoading: userLoading } = useUser();

  // Fetch reviews using React Query with optimized caching
  const { data: reviewsData, isLoading: reviewsLoading, error } = useQuery({
    queryKey: ['myReviews', currentPage, user?.id],
    queryFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const response = await api.getMyReviews({
        page: currentPage,
        limit: 20,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      return response.data;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Consider data fresh for 2 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await api.deleteMyReview(reviewId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    onSuccess: (_, reviewId) => {
      // Optimistically update the UI
      queryClient.setQueryData(['myReviews', currentPage, user?.id], (old: { reviews: Review[]; pagination?: { pages: number } } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          reviews: old.reviews.filter((review: Review) => review.id !== reviewId),
        };
      });

      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      alert('Review deleted successfully.');
    },
    onError: (error) => {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review. Please try again.');
    },
  });

  // Calculate emoticon counts for a review
  const getEmoticonCounts = (review: Review) => {
    const counts = { love: 0, cry: 0, angry: 0 };

    if (review.comments) {
      review.comments.forEach(comment => {
        if (comment.reaction === '❤️') counts.love++;
        else if (comment.reaction === '😢') counts.cry++;
        else if (comment.reaction === '😡') counts.angry++;
      });
    }

    return counts;
  };

  // Toggle review expansion
  const toggleReviewExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  // Toggle comments expansion
  const toggleCommentsExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedComments(newExpanded);
  };

  // Apply client-side filtering
  const getFilteredReviews = () => {
    if (!reviewsData?.reviews) return [];

    const reviews = [...reviewsData.reviews];

    switch (filter) {
      case 'recent':
        return reviews.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'most-comments':
        return reviews.sort((a, b) =>
          (b.comments?.length || 0) - (a.comments?.length || 0)
        );
      default:
        return reviews;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review? This will also delete all associated comments.')) {
      return;
    }
    deleteReviewMutation.mutate(reviewId);
  };

  // Redirect if not authenticated
  if (!userLoading && !user) {
    router.push('/auth/login?redirect=/account/reviews');
    return null;
  }

  // Loading state
  if (userLoading || reviewsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  const filteredReviews = getFilteredReviews();
  const totalPages = reviewsData?.pagination?.pages || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
            <Link
              href="/account"
              className="text-[#198639] hover:text-[#15732f] text-sm font-medium"
            >
              ← Back to Account
            </Link>
          </div>
          <p className="text-gray-600">
            Manage and track all your reviews in one place
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex gap-x-6 px-6">
              {(
                [
                  { value: 'all', label: 'All Reviews', icon: null },
                  { value: 'recent', label: 'Recent', icon: '🕐' },
                  { value: 'most-comments', label: 'Comments', icon: '💬' },
                ] as const
              ).map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => {
                    setFilter(value);
                    setCurrentPage(1);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-1 ${
                    filter === value
                      ? 'border-[#198639] text-[#198639]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {icon && <span className="text-base">{icon}</span>}
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error instanceof Error ? error.message : 'Failed to load reviews'}
          </div>
        )}

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No reviews yet</h3>
            <p className="text-gray-500 mb-4">
              Start sharing your experiences with the community
            </p>
            <Link
              href="/merchants"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#198639] hover:bg-[#15732f]"
            >
              Browse Merchants
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => {
              const emoticonCounts = getEmoticonCounts(review);
              const isExpanded = expandedReviews.has(review.id);
              const areCommentsExpanded = expandedComments.has(review.id);
              const hasComments = review.comments && review.comments.length > 0;
              const commentCount = review.comments?.length || 0;
              const visibleCommentsCount = 3; // Show first 3 comments

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Merchant Logo */}
                        {review.merchant && (
                          <Link href={`/merchants/${review.merchant.slug}`}>
                            <Image
                              src={
                                getImageUrl(review.merchant.logo) ||
                                '/images/default-merchant.png'
                              }
                              alt={review.merchant.name}
                              width={48}
                              height={48}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          </Link>
                        )}

                        {/* Review Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              {review.merchant ? (
                                <Link
                                  href={`/merchants/${review.merchant.slug}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-[#198639]"
                                >
                                  {review.merchant.name}
                                </Link>
                              ) : (
                                <span className="text-lg font-semibold text-gray-900">
                                  Unknown Merchant
                                </span>
                              )}
                              <div className="flex items-center mt-1 space-x-3">
                                <RatingStars rating={review.rating} size={20} />
                                <span className="text-sm text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Review Title and Content */}
                          {review.title && (
                            <h3 className="font-medium text-gray-900 mb-2">
                              {review.title}
                            </h3>
                          )}
                          <p className={`text-gray-700 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                            {review.content}
                          </p>

                          {/* Show More/Less Button for long content */}
                          {review.content.length > 200 && (
                            <button
                              onClick={() => toggleReviewExpanded(review.id)}
                              className="text-[#198639] hover:text-[#15732f] text-sm font-medium mt-2"
                            >
                              {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                          )}

                          {/* Reactions and Stats */}
                          <div className="flex items-center space-x-3 mt-4 pt-3 border-t">
                            {/* Emoticon Reactions */}
                            <div className="flex items-center space-x-2">
                              <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-all">
                                <span className="text-lg">❤️</span>
                                <span className="text-sm text-gray-600">{emoticonCounts.love}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-all">
                                <span className="text-lg">😢</span>
                                <span className="text-sm text-gray-600">{emoticonCounts.cry}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded transition-all">
                                <span className="text-lg">😡</span>
                                <span className="text-sm text-gray-600">{emoticonCounts.angry}</span>
                              </button>
                            </div>

                            {/* Comments Toggle */}
                            {hasComments && (
                              <>
                                <span className="text-gray-300">|</span>
                                <button
                                  onClick={() => toggleCommentsExpanded(review.id)}
                                  className="flex items-center text-sm text-[#198639] hover:text-[#15732f] font-medium"
                                >
                                  <svg
                                    className="w-4 h-4 mr-1"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                  </svg>
                                  {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                                  <svg
                                    className={`w-4 h-4 ml-1 transform transition-transform ${
                                      areCommentsExpanded ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 9l-7 7-7-7"
                                    />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>

                          {/* Comments Section */}
                          {hasComments && areCommentsExpanded && review.comments && (
                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                              {review.comments
                                .slice(0, commentCount > visibleCommentsCount && !expandedReviews.has(review.id + '_all_comments') ? visibleCommentsCount : undefined)
                                .map((comment: ReviewComment) => (
                                  <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="text-lg">{comment.reaction}</span>
                                          <span className="font-medium text-sm text-gray-900">
                                            {comment.displayName || comment.user?.displayName || 'Anonymous'}
                                          </span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                          </span>
                                        </div>
                                        {comment.content && (
                                          <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}

                              {/* Show More Comments */}
                              {commentCount > visibleCommentsCount && (
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedReviews);
                                    const key = review.id + '_all_comments';
                                    if (newExpanded.has(key)) {
                                      newExpanded.delete(key);
                                    } else {
                                      newExpanded.add(key);
                                    }
                                    setExpandedReviews(newExpanded);
                                  }}
                                  className="text-[#198639] hover:text-[#15732f] text-sm font-medium"
                                >
                                  {expandedReviews.has(review.id + '_all_comments')
                                    ? 'Show less comments'
                                    : `Show ${commentCount - visibleCommentsCount} more comments`}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="ml-4">
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deleteReviewMutation.isPending}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          title="Delete review"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 text-sm border rounded-md ${
                    currentPage === i + 1
                      ? 'bg-[#198639] text-white border-[#198639]'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}