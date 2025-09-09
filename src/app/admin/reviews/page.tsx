'use client';

import { useState } from 'react';
import Link from 'next/link';
import RatingStars from '@/components/RatingStars';
import { Review } from '@/types/api';

// Mock data for admin review management
const mockReviews: (Review & { merchantName: string; status: string; flagged: boolean })[] = [
  {
    id: '1',
    slug: 'outstanding-service-lightning-fast-delivery',
    merchantId: '1',
    merchantName: 'TechStore Pro',
    displayName: 'John D.',
    title: 'Outstanding Service and Lightning-Fast Delivery!',
    rating: 5,
    content: 'Excellent service! My order arrived quickly and exactly as described.',
    helpful: 12,
    notHelpful: 1,
    createdAt: '2024-01-25T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
    comments: [],
    status: 'published',
    flagged: false,
  },
  {
    id: '2',
    slug: 'great-products-minor-shipping-delay',
    merchantId: '1',
    merchantName: 'TechStore Pro',
    displayName: 'Sarah M.',
    title: 'Great products, minor shipping delay',
    rating: 4,
    content: 'Quality products but shipping took longer than expected.',
    helpful: 8,
    notHelpful: 2,
    createdAt: '2024-01-24T00:00:00Z',
    updatedAt: '2024-01-24T00:00:00Z',
    comments: [],
    status: 'published',
    flagged: false,
  },
  {
    id: '3',
    slug: 'fake-products-terrible-service',
    merchantId: '4',
    merchantName: 'Scam Electronics',
    displayName: 'Anonymous',
    title: 'Fake products and terrible service',
    rating: 1,
    content: 'Received counterfeit items. Customer service is non-responsive.',
    helpful: 25,
    notHelpful: 3,
    createdAt: '2024-01-23T00:00:00Z',
    updatedAt: '2024-01-23T00:00:00Z',
    comments: [],
    status: 'pending',
    flagged: true,
  },
  {
    id: '4',
    slug: 'good-variety-fast-delivery',
    merchantId: '2',
    merchantName: 'Fashion Hub',
    displayName: 'Mike J.',
    title: 'Good variety, fast delivery',
    rating: 4,
    content: 'Nice selection of clothes and quick shipping.',
    helpful: 6,
    notHelpful: 0,
    createdAt: '2024-01-22T00:00:00Z',
    updatedAt: '2024-01-22T00:00:00Z',
    comments: [],
    status: 'published',
    flagged: false,
  },
  {
    id: '5',
    slug: 'food-arrived-cold-disappointing',
    merchantId: '3',
    merchantName: 'QuickFood Delivery',
    displayName: 'Lisa K.',
    title: 'Food was cold and late',
    rating: 2,
    content: 'Order arrived 45 minutes late and food was cold.',
    helpful: 15,
    notHelpful: 5,
    createdAt: '2024-01-21T00:00:00Z',
    updatedAt: '2024-01-21T00:00:00Z',
    comments: [],
    status: 'published',
    flagged: false,
  },
];

const statusColors = {
  published: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  hidden: 'bg-gray-100 text-gray-800',
};

export default function AdminReviewsPage() {
  const [reviews] = useState(mockReviews);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);

  const filteredReviews = reviews.filter(review => {
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    const matchesSearch = review.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         review.merchantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFlagged = !showFlaggedOnly || review.flagged;
    return matchesStatus && matchesSearch && matchesFlagged;
  });

  const handleSelectAll = () => {
    if (selectedReviews.length === filteredReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(filteredReviews.map(r => r.id));
    }
  };

  const handleSelectReview = (reviewId: string) => {
    if (selectedReviews.includes(reviewId)) {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    } else {
      setSelectedReviews([...selectedReviews, reviewId]);
    }
  };

  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor and moderate user reviews across all merchants
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="show-flagged"
                  type="checkbox"
                  checked={showFlaggedOnly}
                  onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                  className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                />
                <label htmlFor="show-flagged" className="ml-2 text-sm text-gray-700">
                  Show flagged only
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search reviews, merchants, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="published">Published</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedReviews.length > 0 && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">
                  {selectedReviews.length} review(s) selected
                </span>
                <div className="flex space-x-2">
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    Approve
                  </button>
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                    Hide
                  </button>
                  <button className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Reviews Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedReviews.length === filteredReviews.length && filteredReviews.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                  />
                </th>
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
                  Helpful
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReviews.map((review) => (
                <tr key={review.id} className={`hover:bg-gray-50 ${review.flagged ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedReviews.includes(review.id)}
                      onChange={() => handleSelectReview(review.id)}
                      className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="flex items-center mb-1">
                        <div className="text-sm font-medium text-gray-900">
                          {review.title}
                        </div>
                        {review.flagged && (
                          <svg className="ml-2 h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        by {review.displayName}
                      </div>
                      <div className="text-sm text-gray-600 truncate">
                        {review.content}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/merchants/${review.merchantId}`}
                      className="text-sm text-[#198639] hover:text-[#145a2c]"
                    >
                      {review.merchantName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <RatingStars rating={review.rating} size={16} />
                      <span className="ml-1 text-sm text-gray-600">
                        {review.rating}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span className="text-green-600">+{review.helpful}</span>
                      <span className="text-red-600">-{review.notHelpful}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[review.status as keyof typeof statusColors]}`}>
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Link
                        href={`/reviews/${review.slug || review.id}`}
                        target="_blank"
                        className="text-[#198639] hover:text-[#145a2c]"
                      >
                        View
                      </Link>
                      <button className="text-gray-600 hover:text-gray-900">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2-2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search criteria or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}