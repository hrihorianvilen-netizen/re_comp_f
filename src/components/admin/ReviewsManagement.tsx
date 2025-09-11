'use client';

import { useState } from 'react';
import { 
  useAdminReviews, 
  useUpdateReviewStatus, 
  useBulkActionReviews, 
  useDeleteAdminReview 
} from '@/hooks/useMerchants';
import { Review } from '@/types/api';
import Link from 'next/link';

interface ReviewWithStatus extends Review {
  status?: 'published' | 'spam' | 'trash' | 'pending';
}

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1';
type StatusFilter = 'all' | 'published' | 'spam' | 'trash' | 'pending';
type SortOption = 'newest' | 'oldest' | 'rating-high' | 'rating-low';

export default function ReviewsManagement() {
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  
  const updateReviewStatusMutation = useUpdateReviewStatus();
  const bulkActionMutation = useBulkActionReviews();
  const deleteReviewMutation = useDeleteAdminReview();
  
  const { 
    data: reviewsData, 
    isLoading,
    error 
  } = useAdminReviews({
    page: currentPage,
    limit: 20,
    query: searchTerm || undefined,
    rating: ratingFilter === 'all' ? undefined : parseInt(ratingFilter),
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const reviews = (reviewsData?.reviews || []) as ReviewWithStatus[];
  const totalPages = reviewsData?.pagination?.pages || 1;

  // Helper function to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'spam': return 'bg-red-100 text-red-800';
      case 'trash': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: 'published' | 'spam' | 'trash' | 'pending') => {
    try {
      await updateReviewStatusMutation.mutateAsync({ id: reviewId, status: newStatus });
    } catch (error) {
      console.error('Failed to update review status:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string, reviewTitle: string) => {
    if (window.confirm(`Are you sure you want to delete review "${reviewTitle}"? This action cannot be undone.`)) {
      try {
        await deleteReviewMutation.mutateAsync(reviewId);
      } catch (error) {
        console.error('Failed to delete review:', error);
      }
    }
  };

  const handleSelectReview = (reviewId: string) => {
    setSelectedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === reviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviews.map(review => review.id));
    }
  };

  const handleBulkAction = async (action: 'publish' | 'spam' | 'trash') => {
    if (selectedReviews.length === 0) return;
    
    const actionText = action === 'publish' ? 'publish' : action === 'spam' ? 'mark as spam' : 'move to trash';
    if (window.confirm(`Are you sure you want to ${actionText} ${selectedReviews.length} review(s)?`)) {
      try {
        await bulkActionMutation.mutateAsync({ action, ids: selectedReviews });
        setSelectedReviews([]);
      } catch (error) {
        console.error('Failed to perform bulk action:', error);
      }
    }
  };

  // Since we're now fetching admin reviews, we don't need client-side filtering
  const filteredReviews = reviews;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Failed to load reviews. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reviews Management</h1>
        <p className="text-gray-600 mt-1">Manage and moderate user reviews</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Reviews
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
              placeholder="Search reviews..."
            />
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              <option value="spam">Spam</option>
              <option value="trash">Trash</option>
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <select
              id="rating"
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value as RatingFilter)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedReviews.length} review(s) selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Publish
                </button>
                <button
                  onClick={() => handleBulkAction('spam')}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  Mark as Spam
                </button>
                <button
                  onClick={() => handleBulkAction('trash')}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Move to Trash
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#198639]">{reviewsData?.pagination?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {reviews.filter(r => r.rating >= 4).length}
              </div>
              <div className="text-sm text-gray-600">High Rated (4-5⭐)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                {reviews.filter(r => r.rating === 3).length}
              </div>
              <div className="text-sm text-gray-600">Average (3⭐)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600">
                {reviews.filter(r => r.rating <= 2).length}
              </div>
              <div className="text-sm text-gray-600">Low Rated (1-2⭐)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-600">
                {reviews.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending Review</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length === reviews.length && reviews.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-[#198639] focus:ring-[#198639]"
                  />
                </th>
                <th className="w-2/5 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="w-24 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-28 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">No reviews found matching your criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={() => handleSelectReview(review.id)}
                        className="rounded border-gray-300 text-[#198639] focus:ring-[#198639]"
                      />
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate">{review.title}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {review.content.length > 100 ? `${review.content.substring(0, 100)}...` : review.content}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          by {review.displayName || 'Anonymous'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-32">
                      <div className="text-sm text-gray-900 truncate">{review.merchant?.name || review.merchantId}</div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-900 mr-1">{review.rating}</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-3 h-3 ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status)}`}>
                        {review.status || 'published'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1">
                        {/* Status Change */}
                        <select
                          value={review.status || 'published'}
                          onChange={(e) => handleStatusChange(review.id, e.target.value as 'published' | 'spam' | 'trash' | 'pending')}
                          disabled={updateReviewStatusMutation.isPending}
                          className="text-xs border-gray-300 rounded focus:ring-[#198639] focus:border-[#198639] disabled:opacity-50 py-1 px-1"
                        >
                          <option value="published">Published</option>
                          <option value="pending">Pending</option>
                          <option value="spam">Spam</option>
                          <option value="trash">Trash</option>
                        </select>
                        
                        {/* View Details */}
                        <Link
                          href={`/admin/reviews/${review.id}`}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          title="View Details"
                        >
                          👁️
                        </Link>
                        
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteReview(review.id, review.title)}
                          disabled={deleteReviewMutation.isPending}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                          title="Delete Review"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}