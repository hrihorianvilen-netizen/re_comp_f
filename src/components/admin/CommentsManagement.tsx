'use client';

import { useState } from 'react';
import moment from 'moment';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { getHtmlPreview } from '@/lib/htmlUtils';
import CommunicationHeader from '@/components/admin/communication/CommunicationHeader';
import StatusFilter from '@/components/admin/communication/StatusFilter';
import ActionFilter from '@/components/admin/communication/ActionFilter';
import CommunicationPagination from '@/components/admin/communication/CommunicationPagination';
import { 
  useAdminComments, 
  useUpdateAdminComment,
  useUpdateCommentStatus, 
  useBulkActionComments 
} from '@/hooks/useAdminComments';

// Reaction emojis - same as the reviews system
const reactionEmojis = {
  '❤️': { emoji: '❤️', label: 'Love' },
  '😢': { emoji: '😢', label: 'Sad' },
  '😡': { emoji: '😡', label: 'Angry' }
};

interface CommentWithDetails {
  id: string;
  reviewId: string;
  userId?: string;
  displayName?: string;
  reaction: '❤️' | '😢' | '😡';
  content?: string;
  isReported: boolean;
  reportCount: number;
  status: 'published' | 'pending' | 'hidden';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name?: string;
    displayName?: string;
    email: string;
    avatar?: string;
  };
  review?: {
    id: string;
    title: string;
    slug: string;
    merchant?: {
      name: string;
      slug: string;
    };
  };
}

export default function CommentsManagement() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [reactionFilter, setReactionFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // API hooks
  const updateCommentMutation = useUpdateAdminComment();
  const updateCommentStatusMutation = useUpdateCommentStatus();
  const bulkActionMutation = useBulkActionComments();

  // Map UI status names to actual comment statuses
  const getActualStatus = (uiStatus: string) => {
    switch (uiStatus) {
      case 'spam': return 'hidden';
      case 'trash': return 'pending'; 
      case 'published': return 'published';
      case 'all': return undefined;
      default: return uiStatus;
    }
  };

  // Get filtered comments for the current page
  const { 
    data: commentsData, 
    isLoading,
    error 
  } = useAdminComments({
    page: currentPage,
    limit: itemsPerPage,
    query: searchQuery || undefined,
    status: getActualStatus(selectedStatus),
    reaction: reactionFilter || undefined,
    dateFrom: startDate || undefined,
    dateTo: endDate || undefined,
  });

  const commentsList = (commentsData?.comments || []) as CommentWithDetails[];

  // Calculate status counts
  const { data: statusCountsData } = useAdminComments({
    page: 1,
    limit: 50,
  });

  const getAllComments = () => statusCountsData?.comments || [];
  const statusCounts = {
    all: statusCountsData?.pagination?.total || commentsData?.pagination?.total || 0,
    published: getAllComments().filter(c => c.status === 'published').length,
    spam: getAllComments().filter(c => c.status === 'hidden').length, // Map 'hidden' to 'spam' for UI
    trash: getAllComments().filter(c => c.status === 'pending').length, // Map 'pending' to 'trash' for UI
  };

  const handleSelectAll = () => {
    if (selectedComments.length === commentsList.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(commentsList.map(c => c.id));
    }
  };

  const handleSelectComment = (commentId: string) => {
    if (selectedComments.includes(commentId)) {
      setSelectedComments(selectedComments.filter(id => id !== commentId));
    } else {
      setSelectedComments([...selectedComments, commentId]);
    }
  };

  const formatTimeAgo = (date: Date | string) => {
    return moment(date).fromNow();
  };

  const handleRowClick = (commentId: string) => {
    setExpandedComment(expandedComment === commentId ? null : commentId);
  };

  const getReactionEmoji = (reaction: string) => {
    return reactionEmojis[reaction as keyof typeof reactionEmojis]?.emoji || reaction;
  };

  const getReactionLabel = (reaction: string) => {
    return reactionEmojis[reaction as keyof typeof reactionEmojis]?.label || reaction;
  };

  // API operation handlers
  const handleUpdateComment = async (commentId: string) => {
    try {
      const form = document.querySelector(`#comment-form-${commentId}`) as HTMLFormElement;
      
      if (!form) {
        console.error('Form not found for comment:', commentId);
        return;
      }
      
      const formData = new FormData(form);
      const updateData = {
        content: formData.get('content') as string,
        displayName: formData.get('displayName') as string,
        reaction: formData.get('reaction') as string,
      };
      
      await updateCommentMutation.mutateAsync({
        id: commentId,
        data: updateData
      });
      
      setExpandedComment(null);
    } catch (error) {
      console.error('Failed to update comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update comment: ${errorMessage}`);
    }
  };

  const handleStatusChange = async (commentId: string, newStatus: string) => {
    try {
      await updateCommentStatusMutation.mutateAsync({ 
        id: commentId, 
        status: newStatus
      });
    } catch (error) {
      console.error('Failed to update comment status:', error);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedComments.length === 0) {
      alert('Please select comments to apply the action to.');
      return;
    }
    
    try {
      const actionMap: Record<string, string> = {
        'approve': 'publish',
        'hide': 'hide',
        'pending': 'pending'
      };
      
      if (actionMap[action]) {
        await bulkActionMutation.mutateAsync({ 
          action: actionMap[action], 
          ids: selectedComments 
        });
        setSelectedComments([]);
      } else {
        console.error('Unknown bulk action:', action);
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  // Helper functions
  const getAuthorName = (comment: CommentWithDetails) => {
    // Priority: user.displayName (current) > user.name > displayName (at creation time) > fallback
    return comment.user?.displayName || comment.user?.name || comment.displayName || 'Anonymous';
  };

  const getAuthorEmail = (comment: CommentWithDetails) => {
    return comment.user?.email || 'N/A';
  };

  const getActualAuthorId = (comment: CommentWithDetails) => {
    return comment.userId || 'N/A';
  };

  const getReviewTitle = (comment: CommentWithDetails) => {
    return comment.review?.title || 'Unknown Review';
  };

  const getMerchantName = (comment: CommentWithDetails) => {
    return comment.review?.merchant?.name || 'Unknown Merchant';
  };

  // Loading and error states
  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommunicationHeader title="Comments" />
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Comments page error:', error);
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CommunicationHeader title="Comments" />
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Failed to load comments</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {error.message.includes('401') || error.message.includes('403') 
                      ? 'Authentication error: Please make sure you are logged in as an admin.' 
                      : error.message.includes('404') 
                        ? 'Admin comments endpoint not found. The backend may not have the /admin/comments endpoint implemented.'
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
        <CommunicationHeader title="Comments" />

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
          reactingFilter={reactionFilter}
          onReactingChange={setReactionFilter}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          filteredCount={commentsList.length}
          showReactingFilter={true}
          onApply={() => handleBulkAction(actionFilter)}
        />

        {/* Comment List Section */}
        <div className="bg-white shadow rounded-t-lg overflow-hidden">
          {/* Table Header */}
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-2 sm:gap-4 items-center min-w-0">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedComments.length === commentsList.length && commentsList.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                />
              </div>
              <div className="col-span-2 sm:col-span-2 text-sm font-medium text-gray-700 truncate">Author</div>
              <div className="col-span-1 sm:col-span-1 text-sm font-medium text-gray-700 truncate">Reaction</div>
              <div className="col-span-3 sm:col-span-3 text-sm font-medium text-gray-700 truncate">Comment</div>
              <div className="col-span-3 sm:col-span-3 text-sm font-medium text-gray-700 truncate">Review</div>
              <div className="col-span-2 sm:col-span-2 text-sm font-medium text-gray-700 truncate">Date</div>
            </div>
          </div>

          {/* Comment List */}
          <div className="divide-y divide-gray-200">
            {commentsList.map((comment) => (
              <div key={comment.id}>
                <div className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => handleRowClick(comment.id)}>
                  <div className="grid grid-cols-12 gap-2 sm:gap-4 items-start min-w-0">
                    {/* Checkbox */}
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedComments.includes(comment.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleSelectComment(comment.id);
                        }}
                        className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                      />
                    </div>

                    {/* Author */}
                    <div className="col-span-2 sm:col-span-2 min-w-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{getAuthorName(comment)}</p>
                        <p className="text-xs text-gray-500 truncate">{getAuthorEmail(comment)}</p>
                      </div>
                    </div>

                    {/* Reaction */}
                    <div className="col-span-1 sm:col-span-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-lg">{getReactionEmoji(comment.reaction)}</span>
                        <span className="text-xs text-gray-600 capitalize">{getReactionLabel(comment.reaction)}</span>
                      </div>
                    </div>

                    {/* Comment Content */}
                    <div className="col-span-3 sm:col-span-3 min-w-0">
                      <p className="text-sm text-gray-900 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word'
                      }}>{comment.content ? getHtmlPreview(comment.content, 150) : 'No text content'}</p>
                    </div>

                    {/* Review Info */}
                    <div className="col-span-3 sm:col-span-3 min-w-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{getReviewTitle(comment)}</p>
                        <p className="text-xs text-gray-500 truncate">{getMerchantName(comment)}</p>
                      </div>
                    </div>

                    {/* Date and Status */}
                    <div className="col-span-2 sm:col-span-2 min-w-0">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          comment.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : comment.status === 'hidden'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {comment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Collapsible Edit Section */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedComment === comment.id ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <form id={`comment-form-${comment.id}`} data-comment-id={comment.id} className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Edit Comment</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Actual Author (Current User Info)</label>
                            <input
                              type="text"
                              value={getAuthorName(comment)}
                              disabled
                              readOnly
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              User ID: {getActualAuthorId(comment)} | Email: {getAuthorEmail(comment)}
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Display Name (editable)</label>
                            <input
                              type="text"
                              name="displayName"
                              defaultValue={comment.displayName || 'Anonymous'}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              This display name is shown publicly on the comment and can be edited
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              value={getAuthorEmail(comment)}
                              disabled
                              readOnly
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Reaction</label>
                            <select
                              name="reaction"
                              defaultValue={comment.reaction}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            >
                              {Object.entries(reactionEmojis).map(([key, { emoji, label }]) => (
                                <option key={key} value={key}>
                                  {emoji} {label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <select
                              defaultValue={comment.status}
                              onChange={(e) => handleStatusChange(comment.id, e.target.value)}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            >
                              <option value="published">Published</option>
                              <option value="pending">Pending</option>
                              <option value="hidden">Hidden</option>
                            </select>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Comment Content</label>
                            <RichTextEditor
                              value={comment.content || ''}
                              onChange={(value) => {
                                // Store the value for form submission
                                const form = document.querySelector(`form[data-comment-id="${comment.id}"]`) as HTMLFormElement;
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
                              placeholder="Enter comment content"
                              height="min-h-[150px]"
                              showPreview={false}
                              required={false}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={() => setExpandedComment(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={updateCommentMutation.isPending}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#A96B11] border border-transparent rounded-md hover:bg-[#8b5a0e] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateCommentMutation.isPending ? 'Updating...' : 'Update Comment'}
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
        {commentsList.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No comments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        {commentsData && (
          <CommunicationPagination
            currentPage={currentPage}
            totalPages={commentsData?.pagination?.pages || Math.ceil((commentsData?.pagination?.total || 0) / itemsPerPage)}
            onPageChange={setCurrentPage}
            totalItems={commentsData?.pagination?.total || 0}
            itemsPerPage={itemsPerPage}
          />
        )}
      </div>
    </div>
  );
}