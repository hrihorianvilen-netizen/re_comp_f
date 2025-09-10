'use client';

import { useState } from 'react';
import moment from 'moment';
import { RatingStars } from '@/components/ui';
import CommunicationHeader from '@/components/admin/communication/CommunicationHeader';
import StatusFilter from '@/components/admin/communication/StatusFilter';
import ActionFilter from '@/components/admin/communication/ActionFilter';
import CommunicationPagination from '@/components/admin/communication/CommunicationPagination';

// Mock data for reviews
const mockReviews = [
  { 
    id: '1', 
    status: 'published',
    author: 'John Smith',
    email: 'john.smith@email.com',
    ipAddress: '192.168.1.100',
    merchant: 'TechStore Pro',
    rate: 5,
    title: 'Amazing experience with TechStore Pro',
    description: 'Excellent service and fast delivery! The product quality exceeded my expectations.',
    reactions: { love: 12, helpful: 8, cry: 0, angry: 1 },
    favourite: true,
    createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
  },
  { 
    id: '2', 
    status: 'published',
    author: 'Sarah Wilson',
    email: 'sarah.wilson@gmail.com',
    ipAddress: '10.0.0.25',
    merchant: 'Fashion Hub',
    rate: 4,
    title: 'Good products but slow shipping',
    description: 'Good quality products, but shipping took a bit longer than expected. Overall satisfied!',
    reactions: { love: 5, helpful: 15, cry: 2, angry: 0 },
    favourite: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
  },
  { 
    id: '3', 
    status: 'spam',
    author: 'Fake User',
    email: 'fake@spam.com',
    ipAddress: '123.45.67.89',
    merchant: 'Scam Store',
    rate: 1,
    title: 'Spam review content',
    description: 'This is clearly a spam review with fake content.',
    reactions: { love: 0, helpful: 0, cry: 0, angry: 8 },
    favourite: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
  },
  { 
    id: '4', 
    status: 'trash',
    author: 'Angry Customer',
    email: 'angry@customer.com',
    ipAddress: '172.16.0.5',
    merchant: 'Bad Shop',
    rate: 1,
    title: 'Terrible service, never again',
    description: 'Terrible experience, inappropriate language used. Never again!',
    reactions: { love: 0, helpful: 2, cry: 3, angry: 12 },
    favourite: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
  },
  { 
    id: '5', 
    status: 'published',
    author: 'Mike Johnson',
    email: 'mike.j@company.com',
    ipAddress: '203.0.113.42',
    merchant: 'Home Essentials',
    rate: 5,
    title: 'Perfect transaction, highly recommended',
    description: 'Perfect transaction, everything as described. Will buy again!',
    reactions: { love: 20, helpful: 18, cry: 0, angry: 0 },
    favourite: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
  },
];

export default function CommunicationReviewsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [merchantSearch, setMerchantSearch] = useState('');
  const [starFilter, setStarFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const statusCounts = {
    all: mockReviews.length,
    published: mockReviews.filter(r => r.status === 'published').length,
    spam: mockReviews.filter(r => r.status === 'spam').length,
    trash: mockReviews.filter(r => r.status === 'trash').length,
  };

  const filteredReviews = mockReviews.filter(review => {
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    return matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedReviews.length === paginatedReviews.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(paginatedReviews.map(r => r.id));
    }
  };

  const handleSelectReview = (reviewId: string) => {
    if (selectedReviews.includes(reviewId)) {
      setSelectedReviews(selectedReviews.filter(id => id !== reviewId));
    } else {
      setSelectedReviews([...selectedReviews, reviewId]);
    }
  };

  const formatTimeAgo = (date: Date) => {
    return moment(date).fromNow();
  };

  const handleRowClick = (reviewId: string) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };


  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CommunicationHeader title="Reviews" />

        <StatusFilter
          selectedStatus={selectedStatus}
          statusCounts={statusCounts}
          searchQuery={searchQuery}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
        />

        <ActionFilter
          actionFilter={actionFilter}
          onActionChange={setActionFilter}
          merchantSearch={merchantSearch}
          onMerchantSearchChange={setMerchantSearch}
          starFilter={starFilter}
          onStarChange={setStarFilter}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          filteredCount={filteredReviews.length}
          showMerchantSearch={true}
          showStarFilter={true}
        />

        {/* Review List Section */}
        <div className="bg-white shadow rounded-t-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedReviews.length === paginatedReviews.length && paginatedReviews.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                />
              </div>
              <div className="w-40 text-sm font-medium text-gray-700 flex items-center">Author</div>
              <div className="w-32 text-sm font-medium text-gray-700 flex items-center">Merchant</div>
              <div className="w-24 text-sm font-medium text-gray-700 flex items-center">Rate</div>
              <div className="flex-1 text-sm font-medium text-gray-700 flex items-center">Review Description</div>
              <div className="w-20 text-sm font-medium text-gray-700 flex items-center">Favourite</div>
            </div>
          </div>

          {/* Review List */}
          <div className="divide-y divide-gray-200">
            {paginatedReviews.map((review) => (
              <div key={review.id}>
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => handleRowClick(review.id)}>
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedReviews.includes(review.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectReview(review.id);
                        }}
                        className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                      />
                    </div>

                    {/* Author */}
                    <div className="w-40">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{review.author}</p>
                        <p className="text-xs text-gray-500">{review.email}</p>
                        <p className="text-xs text-gray-400">{review.ipAddress}</p>
                      </div>
                    </div>

                    {/* Merchant */}
                    <div className="w-32">
                      <p className="text-sm text-gray-900 truncate">{review.merchant}</p>
                    </div>

                    {/* Rate */}
                    <div className="w-24">
                      <div className="space-y-1">
                        <RatingStars rating={review.rate} size={16} />
                        <p className="text-xs text-gray-500">{formatTimeAgo(review.createdAt)}</p>
                      </div>
                    </div>

                    {/* Review Description */}
                    <div className="flex-1">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-900">{review.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.description}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1">
                            <span>😍</span>
                            <span>{review.reactions.love}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>👍</span>
                            <span>{review.reactions.helpful}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>😢</span>
                            <span>{review.reactions.cry}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span>😠</span>
                            <span>{review.reactions.angry}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Favourite */}
                    <div className="w-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Toggle favourite for:', review.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg 
                          className={`h-5 w-5 ${review.favourite ? 'text-red-500 fill-current' : ''}`} 
                          fill={review.favourite ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Edit Section */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedReview === review.id ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Edit Review</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Author Name</label>
                            <input
                              type="text"
                              defaultValue={review.author}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              defaultValue={review.email}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">IP Address</label>
                            <input
                              type="text"
                              defaultValue={review.ipAddress}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-300 text-white focus:outline-none"
                              readOnly
                            />
                          </div>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Review Title</label>
                            <input
                              type="text"
                              defaultValue={review.title}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                              placeholder="Enter review title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Review Description</label>
                            <textarea
                              rows={6}
                              defaultValue={review.description}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                              placeholder="Enter review description"
                            />
                          </div>

                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setExpandedReview(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Discard
                        </button>
                        <button
                          onClick={() => {
                            console.log('Update review:', review.id);
                            setExpandedReview(null);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#A96B11] border border-transparent rounded-md hover:bg-[#8b5a0e]"
                        >
                          Update Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reviews found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        <CommunicationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredReviews.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}