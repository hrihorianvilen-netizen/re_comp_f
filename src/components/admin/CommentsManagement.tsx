'use client';

import { useState } from 'react';
import { ReviewComment } from '@/types/api';

// Mock data - replace with actual API call
const mockComments: ReviewComment[] = [
  {
    id: '1',
    reviewId: 'rev-1',
    userId: 'user-1',
    displayName: 'John Doe',
    content: 'Great review! I had a similar experience with this merchant.',
    reaction: '❤️',
    isReported: false,
    reportCount: 0,
    status: 'published',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    reviewId: 'rev-2',
    userId: 'user-2',
    displayName: 'Jane Smith',
    content: 'This is very helpful information, thank you for sharing!',
    reaction: '❤️',
    isReported: false,
    reportCount: 0,
    status: 'published',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z'
  }
];

type CommentStatus = 'all' | 'approved' | 'pending' | 'flagged';

export default function CommentsManagement() {
  const [statusFilter, setStatusFilter] = useState<CommentStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Mock loading state
  const [isLoading] = useState(false);
  
  const comments = mockComments;
  const totalPages = Math.ceil(comments.length / 10);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApproveComment = (commentId: string) => {
    console.log('Approving comment', commentId);
    // TODO: Implement API call
  };

  const handleFlagComment = (commentId: string) => {
    console.log('Flagging comment', commentId);
    // TODO: Implement API call
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      console.log('Deleting comment', commentId);
      // TODO: Implement API call
    }
  };

  const filteredComments = comments.filter(comment => {
    const matchesSearch = searchTerm === '' || 
      comment.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // For now, all comments are considered 'approved' since we don't have status field
    const matchesStatus = statusFilter === 'all' || statusFilter === 'approved';
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Comments Management</h1>
        <p className="text-gray-600 mt-1">Manage and moderate user comments on reviews</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Comments
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
              placeholder="Search by content or commenter name..."
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
              onChange={(e) => setStatusFilter(e.target.value as CommentStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
            >
              <option value="all">All Comments</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#198639]">{comments.length}</div>
              <div className="text-sm text-gray-600">Total Comments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">{comments.length}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">0</div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600">0</div>
              <div className="text-sm text-gray-600">Flagged</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-xl mb-4">No comments found</div>
              <p className="text-gray-400">Try adjusting your search criteria to see more results.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredComments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Comment Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        {comment.displayName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {comment.displayName || 'Anonymous'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {comment.reaction && (
                        <span className="text-lg" title="Reaction">
                          {comment.reaction}
                        </span>
                      )}
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Approved
                      </span>
                    </div>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-3">
                    <p className="text-gray-900 text-sm leading-relaxed">{comment.content}</p>
                  </div>

                  {/* Review Context */}
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <div className="text-xs text-gray-500 mb-1">Comment on Review:</div>
                    <div className="text-sm font-medium text-gray-700">Review ID: {comment.reviewId}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleApproveComment(comment.id)}
                      className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => handleFlagComment(comment.id)}
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors"
                    >
                      🚩 Flag
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                    >
                      👁️ View Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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