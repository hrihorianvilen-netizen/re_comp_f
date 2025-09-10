'use client';

import { useState } from 'react';
import { useMerchants, useReviews } from '@/hooks/useMerchants';
import { Review } from '@/types/api';
import Link from 'next/link';

type ReviewStatus = 'all' | 'approved' | 'pending' | 'rejected';
type SortOption = 'newest' | 'oldest' | 'rating-high' | 'rating-low';

export default function ReviewsManagement() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  
  const { 
    data: reviewsData, 
    isLoading,
    error 
  } = useReviews({
    page: currentPage,
    limit: 20,
    sort: sortBy,
  });

  const reviews = reviewsData?.reviews || [];
  const totalPages = Math.ceil((reviewsData?.total || 0) / 20);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (reviewId: string, newStatus: string) => {
    // TODO: Implement status change API call
    console.log('Changing status for review', reviewId, 'to', newStatus);
  };

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      // TODO: Implement delete API call
      console.log('Deleting review', reviewId);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' || 
      review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Reviews
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
              placeholder="Search by title, description, or reviewer..."
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
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
            >
              <option value="all">All Reviews</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
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

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#198639]">{reviewsData?.total || 0}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {reviews.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                {reviews.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600">
                {reviews.filter(r => r.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">No reviews found matching your criteria.</div>
                  </td>
                </tr>
              ) : (
                filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{review.title}</div>
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {review.description}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          by {review.displayName || 'Anonymous'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{review.merchantId}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">{review.rating}</span>
                        <div className="flex ml-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                              key={star}
                              className={`w-4 h-4 ${
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
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(review.status || 'pending')}`}>
                        {review.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {/* Status Change Buttons */}
                        {review.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'approved')}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            title="Approve"
                          >
                            Approve
                          </button>
                        )}
                        {review.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'rejected')}
                            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                            title="Reject"
                          >
                            Reject
                          </button>
                        )}
                        
                        {/* View Details */}
                        <Link
                          href={`/admin/reviews/${review.id}`}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          View
                        </Link>
                        
                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                          title="Delete"
                        >
                          Delete
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