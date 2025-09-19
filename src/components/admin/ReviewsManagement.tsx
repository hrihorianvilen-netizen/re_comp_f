'use client';

import { useState } from 'react';
import moment from 'moment';
import { RatingStars } from '@/components/ui';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { getHtmlPreview } from '@/lib/htmlUtils';
import CommunicationHeader from '@/components/admin/communication/CommunicationHeader';
import StatusFilter from '@/components/admin/communication/StatusFilter';
import ActionFilter from '@/components/admin/communication/ActionFilter';
import CommunicationPagination from '@/components/admin/communication/CommunicationPagination';
import { 
  useAdminReviews, 
  useUpdateReviewStatus, 
  useBulkActionReviews, 
  useUpdateAdminReview
} from '@/hooks/useMerchants';
import { Review, Merchant } from '@/types/api';

interface ReviewWithStatus extends Omit<Review, 'merchant'> {
  status?: 'published' | 'spam' | 'trash' | 'pending';
  author?: string;
  email?: string;
  ipAddress?: string;
  merchant?: Merchant | string;
  rate?: number;
  favourite?: boolean;
  isFeatured?: boolean;
  reactions?: { love: number; cry: number; angry: number };
}

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

  // API hooks
  const updateReviewStatusMutation = useUpdateReviewStatus();
  const updateAdminReviewMutation = useUpdateAdminReview();
  const bulkActionMutation = useBulkActionReviews();

  // Get filtered reviews for the current page
  const { 
    data: reviewsData, 
    isLoading,
    error 
  } = useAdminReviews({
    page: currentPage,
    limit: itemsPerPage,
    query: searchQuery || undefined,
    merchant: merchantSearch || undefined,
    rating: starFilter ? parseInt(starFilter) : undefined,
    status: selectedStatus === 'all' ? undefined : selectedStatus as 'published' | 'spam' | 'trash' | 'pending',
    dateFrom: startDate || undefined,
    dateTo: endDate || undefined,
  });

  // Get unfiltered counts for status tabs - simplified to avoid 400 errors
  const { data: statusCountsData } = useAdminReviews({
    page: 1,
    limit: 50, // Reduced limit to avoid potential server issues
    // Temporarily remove all filters to test basic endpoint
  });

  const reviewsList = (reviewsData?.reviews || []) as ReviewWithStatus[];

  // Calculate status counts from the unfiltered query
  const getAllReviews = () => statusCountsData?.reviews || [];
  const statusCounts = {
    all: statusCountsData?.pagination?.total || reviewsData?.pagination?.total || 0,
    published: getAllReviews().filter(r => (r as ReviewWithStatus).status === 'published').length,
    spam: getAllReviews().filter(r => (r as ReviewWithStatus).status === 'spam').length,
    trash: getAllReviews().filter(r => (r as ReviewWithStatus).status === 'trash').length,
  };

  const handleSelectAll = () => {
    if (selectedReviews.length === reviewsList.length) {
      setSelectedReviews([]);
    } else {
      setSelectedReviews(reviewsList.map(r => r.id));
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

  // API operation handlers
  const handleUpdateReview = async (reviewId: string) => {
    try {
      // Get form data from the expanded form
      const form = document.querySelector(`#review-form-${reviewId}`) as HTMLFormElement;
      
      if (!form) {
        console.error('Form not found for review:', reviewId);
        return;
      }
      
      const formData = new FormData(form);
      const updateData = {
        title: formData.get('title') as string,
        content: formData.get('content') as string,
      };
      console.log('Updating review with data:', { reviewId, updateData });
      
      // Call the API to update the review
      const result = await updateAdminReviewMutation.mutateAsync({
        id: reviewId,
        data: updateData
      });
      
      console.log('Update successful:', result);
      setExpandedReview(null);
    } catch (error: unknown) {
      console.error('Failed to update review - Full error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error message:', errorMessage);
      
      // Provide more user-friendly error messages
      const userMessage = errorMessage;
      
      alert(`Failed to update review: ${userMessage}`);
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      await updateReviewStatusMutation.mutateAsync({ 
        id: reviewId, 
        status: newStatus as 'published' | 'spam' | 'trash' | 'pending' 
      });
    } catch (error) {
      console.error('Failed to update review status:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedReviews.length === 0) {
      alert('Please select reviews to apply the action to.');
      return;
    }
    
    try {
      const actionMap: Record<string, 'publish' | 'spam' | 'trash'> = {
        'approve': 'publish',
        'reject': 'trash',
        'mark as spam': 'spam', 
        'move to trash': 'trash'
      };
      
      if (actionMap[action]) {
        await bulkActionMutation.mutateAsync({ 
          action: actionMap[action], 
          ids: selectedReviews 
        });
        setSelectedReviews([]);
      } else {
        console.error('Unknown bulk action:', action);
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };


  const handleToggleFavourite = async (reviewId: string) => {
    try {
      // TODO: Implement backend API call for toggling favourite
      console.log('Toggle favourite for:', reviewId);
    } catch (error) {
      console.error('Failed to toggle favourite:', error);
    }
  };

  // Helper functions to map real data to display format
  const getAuthorName = (review: ReviewWithStatus) => {
    // Priority: user.displayName (current) > user.name > displayName (at creation time) > fallback
    return review.user?.displayName || review.user?.name || review.displayName || 'Anonymous';
  };

  const getAuthorEmail = (review: ReviewWithStatus) => {
    return review.user?.email || 'N/A';
  };

  const getActualAuthorId = (review: ReviewWithStatus) => {
    return review.userId || 'N/A';
  };

  const getMerchantName = (review: ReviewWithStatus) => {
    if (typeof review.merchant === 'string') {
      return review.merchant;
    }
    return review.merchant?.name || 'Unknown Merchant';
  };

  const getReactions = (review: ReviewWithStatus) => {
    if (review.comments) {
      const reactions = { love: 0, cry: 0, angry: 0 };
      review.comments.forEach(comment => {
        if (comment.reaction === '❤️') reactions.love++;
        else if (comment.reaction === '😢') reactions.cry++;
        else if (comment.reaction === '😡') reactions.angry++;
      });
      return reactions;
    }
    return { love: 0, cry: 0, angry: 0 };
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommunicationHeader title="Reviews" />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Reviews page error:', error);
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommunicationHeader title="Reviews" />
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to load reviews</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {error.message.includes('401') || error.message.includes('403') 
                      ? 'Authentication error: Please make sure you are logged in as an admin.' 
                      : error.message.includes('404') 
                        ? 'Admin reviews endpoint not found. The backend may not have the /admin/reviews endpoint implemented.'
                        : `Error: ${error.message}`
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="py-6 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-w-0">
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
          filteredCount={reviewsList.length}
          showMerchantSearch={true}
          showStarFilter={true}
          onApply={() => handleBulkAction(actionFilter)}
        />

        {/* Review List Section */}
        <div className="bg-white shadow rounded-t-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center min-w-0">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedReviews.length === reviewsList.length && reviewsList.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                />
              </div>
              <div className="col-span-2 sm:col-span-2 text-sm font-medium text-gray-700 truncate">Author</div>
              <div className="col-span-2 sm:col-span-2 text-sm font-medium text-gray-700 truncate hidden sm:block">Merchant</div>
              <div className="col-span-1 sm:col-span-1 text-sm font-medium text-gray-700 truncate">Rate</div>
              <div className="col-span-5 sm:col-span-5 text-sm font-medium text-gray-700 truncate">Review Description</div>
              <div className="col-span-1 sm:col-span-1 text-sm font-medium text-gray-700 truncate"></div>
            </div>
          </div>

          {/* Review List */}
          <div className="divide-y divide-gray-200">
            {reviewsList.map((review) => (
              <div key={review.id}>
                <div className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => handleRowClick(review.id)}>
                  <div className="grid grid-cols-12 gap-2 sm:gap-4 items-start min-w-0">
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center">
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
                    <div className="col-span-2 sm:col-span-2 min-w-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{getAuthorName(review)}</p>
                        <p className="text-xs text-gray-500 truncate">{getAuthorEmail(review)}</p>
                      </div>
                    </div>

                    {/* Merchant */}
                    <div className="col-span-2 sm:col-span-2 min-w-0 hidden sm:block">
                      <p className="text-sm text-gray-900 truncate">{getMerchantName(review)}</p>
                    </div>

                    {/* Rate */}
                    <div className="col-span-1 sm:col-span-1 min-w-0">
                      <div className="space-y-1">
                        <RatingStars rating={review.rating} size={12} />
                        <p className="text-xs text-gray-500 truncate">{formatTimeAgo(new Date(review.createdAt))}</p>
                      </div>
                    </div>

                    {/* Review Description */}
                    <div className="col-span-5 sm:col-span-5 min-w-0">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{review.title}</h4>
                        <p className="text-sm text-gray-600 overflow-hidden" style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          wordBreak: 'break-word'
                        }}>{getHtmlPreview(review.content, 150)}</p>
                        <div className="flex items-center gap-2 text-xs">
                          {(() => {
                            const reactions = getReactions(review);
                            return (
                              <>
                                <span className="flex items-center gap-1">
                                  <span>❤️</span>
                                  <span>{reactions.love}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>😢</span>
                                  <span>{reactions.cry}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <span>😡</span>
                                  <span>{reactions.angry}</span>
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Favourite */}
                    <div className="col-span-1 sm:col-span-1 flex justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavourite(review.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg 
                          className={`h-5 w-5 ${(review as ReviewWithStatus).isFeatured ? 'text-red-500 fill-current' : ''}`} 
                          fill={(review as ReviewWithStatus).isFeatured ? "currentColor" : "none"} 
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
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <form id={`review-form-${review.id}`} data-review-id={review.id} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Edit Review</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Actual Author (Current User Info)</label>
                            <input
                              type="text"
                              value={getAuthorName(review)}
                              disabled
                              readOnly
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              User ID: {getActualAuthorId(review)} | Email: {getAuthorEmail(review)}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name (shown on review)</label>
                            <input
                              type="text"
                              value={review.displayName || 'Anonymous'}
                              disabled
                              readOnly
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-600 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              This is the display name shown publicly on the review (set when review was created)
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={(review.user?.email || 'N/A') ?? ''}
                              disabled
                              readOnly
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                              defaultValue={(review as ReviewWithStatus).status || 'published'}
                              onChange={(e) => handleStatusChange(review.id, e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            >
                              <option value="published">Published</option>
                              <option value="pending">Pending</option>
                              <option value="spam">Spam</option>
                              <option value="trash">Trash</option>
                            </select>
                          </div>

                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Review Title</label>
                            <input
                              type="text"
                              name="title"
                              defaultValue={review.title}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                              placeholder="Enter review title"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Review Content</label>
                            <RichTextEditor
                              value={review.content}
                              onChange={(value) => {
                                // Store the value for form submission
                                const form = document.querySelector(`form[data-review-id="${review.id}"]`) as HTMLFormElement;
                                if (form) {
                                  const input = form.querySelector('input[name="content"]') as HTMLInputElement;
                                  if (!input) {
                                    const hiddenInput = document.createElement('input');
                                    hiddenInput.type = 'hidden';
                                    hiddenInput.name = 'content';
                                    hiddenInput.value = value;
                                    form.appendChild(hiddenInput);
                                  } else {
                                    input.value = value;
                                  }
                                }
                              }}
                              placeholder="Enter review content"
                              height="min-h-[150px]"
                              showPreview={false}
                            />
                          </div>

                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setExpandedReview(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateReview(review.id)}
                          disabled={updateAdminReviewMutation.isPending}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#A96B11] border border-transparent rounded-md hover:bg-[#8b5a0e] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateAdminReviewMutation.isPending ? 'Updating...' : 'Update Review'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {reviewsList.length === 0 && !isLoading && (
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

        {reviewsData && (
          <CommunicationPagination
            currentPage={currentPage}
            totalPages={reviewsData?.pagination?.pages || Math.ceil((reviewsData?.pagination?.total || 0) / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={reviewsData?.pagination?.total || 0}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </div>
  );
}