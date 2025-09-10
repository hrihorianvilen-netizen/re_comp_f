'use client';

import { useState } from 'react';
import moment from 'moment';
import { RatingStars } from '@/components/ui';
import CommunicationHeader from '@/components/admin/communication/CommunicationHeader';
import StatusFilter from '@/components/admin/communication/StatusFilter';
import ActionFilter from '@/components/admin/communication/ActionFilter';
import CommunicationPagination from '@/components/admin/communication/CommunicationPagination';

// Mock data for comments
const mockComments = [
  { 
    id: '1', 
    status: 'published',
    reporter: 'Alice Johnson',
    email: 'alice.johnson@email.com',
    ipAddress: '192.168.1.101',
    type: 'review',
    reacted: 'love',
    comment: 'Thank you for this detailed review! It really helped me make my decision.',
    reviewPost: 'Amazing experience with TechStore Pro',
    reactions: { love: 5, helpful: 3, cry: 0, angry: 0 },
    createdAt: new Date(Date.now() - 3 * 60 * 1000) // 3 minutes ago
  },
  { 
    id: '2', 
    status: 'published',
    reporter: 'Bob Smith',
    email: 'bob.smith@gmail.com',
    ipAddress: '10.0.0.30',
    type: 'post',
    reacted: 'helpful',
    comment: 'Great post! Very informative and well written.',
    reviewPost: 'Top 10 Shopping Tips for 2024',
    reactions: { love: 2, helpful: 8, cry: 0, angry: 1 },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  },
  { 
    id: '3', 
    status: 'spam',
    reporter: 'Spam User',
    email: 'spam@fake.com',
    ipAddress: '123.45.67.90',
    type: 'review',
    reacted: 'angry',
    comment: 'This is clearly spam content with inappropriate links.',
    reviewPost: 'Fake Review Title',
    reactions: { love: 0, helpful: 0, cry: 0, angry: 5 },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  },
  { 
    id: '4', 
    status: 'trash',
    reporter: 'John Doe',
    email: 'john.doe@company.com',
    ipAddress: '172.16.0.10',
    type: 'post',
    reacted: 'cry',
    comment: 'This comment contained inappropriate language.',
    reviewPost: 'How to Choose the Right Product',
    reactions: { love: 0, helpful: 1, cry: 3, angry: 2 },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
  },
  { 
    id: '5', 
    status: 'published',
    reporter: 'Emma Wilson',
    email: 'emma.w@email.com',
    ipAddress: '203.0.113.50',
    type: 'review',
    reacted: 'love',
    comment: 'Completely agree with this review! Had the same experience.',
    reviewPost: 'Perfect transaction, highly recommended',
    reactions: { love: 15, helpful: 10, cry: 0, angry: 0 },
    createdAt: new Date(Date.now() - 1 * 7 * 24 * 60 * 60 * 1000) // 1 week ago
  },
];

export default function CommunicationCommentsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [reactingFilter, setReactingFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const statusCounts = {
    all: mockComments.length,
    published: mockComments.filter(c => c.status === 'published').length,
    spam: mockComments.filter(c => c.status === 'spam').length,
    trash: mockComments.filter(c => c.status === 'trash').length,
  };

  const filteredComments = mockComments.filter(comment => {
    const matchesStatus = selectedStatus === 'all' || comment.status === selectedStatus;
    return matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredComments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedComments = filteredComments.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedComments.length === paginatedComments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(paginatedComments.map(c => c.id));
    }
  };

  const handleSelectComment = (commentId: string) => {
    if (selectedComments.includes(commentId)) {
      setSelectedComments(selectedComments.filter(id => id !== commentId));
    } else {
      setSelectedComments([...selectedComments, commentId]);
    }
  };

  const formatTimeAgo = (date: Date) => {
    return moment(date).fromNow();
  };

  const handleRowClick = (commentId: string) => {
    setExpandedComment(expandedComment === commentId ? null : commentId);
  };

  const getReactionEmoji = (reacted: string) => {
    switch (reacted) {
      case 'love': return '😍';
      case 'helpful': return '👍';
      case 'cry': return '😢';
      case 'angry': return '😠';
      default: return '';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          reactingFilter={reactingFilter}
          onReactingChange={setReactingFilter}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          filteredCount={filteredComments.length}
          showTypeFilter={true}
          showReactingFilter={true}
        />

        {/* Comment List Section */}
        <div className="bg-white shadow rounded-t-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-10 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedComments.length === paginatedComments.length && paginatedComments.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-[#198639] focus:ring-[#198639] border-gray-300 rounded"
                />
              </div>
              <div className="w-32 text-sm font-medium text-gray-700 flex items-center">Reporter</div>
              <div className="w-20 text-sm font-medium text-gray-700 flex items-center">Type</div>
              <div className="w-20 text-sm font-medium text-gray-700 flex items-center">Reacted</div>
              <div className="w-48 text-sm font-medium text-gray-700 flex items-center">Comment</div>
              <div className="flex-1 text-sm font-medium text-gray-700 flex items-center">Review/Post</div>
              <div className="w-24 text-sm font-medium text-gray-700 flex items-center">Created At</div>
            </div>
          </div>

          {/* Comment List */}
          <div className="divide-y divide-gray-200">
            {paginatedComments.map((comment) => (
              <div key={comment.id}>
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => handleRowClick(comment.id)}>
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="w-10">
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

                    {/* Reporter */}
                    <div className="w-32">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">{comment.reporter}</p>
                        <p className="text-xs text-gray-500">{comment.email}</p>
                        <p className="text-xs text-gray-400">{comment.ipAddress}</p>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="w-20">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        comment.type === 'review' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {comment.type}
                      </span>
                    </div>

                    {/* Reacted */}
                    <div className="w-20">
                      <span className="flex items-center gap-1 text-sm">
                        <span>{getReactionEmoji(comment.reacted)}</span>
                        <span className="text-xs text-gray-600 capitalize">{comment.reacted}</span>
                      </span>
                    </div>

                    {/* Comment */}
                    <div className="w-48">
                      <p className="text-sm text-gray-900 line-clamp-2">{comment.comment}</p>
                    </div>

                    {/* Review/Post */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-2">{comment.reviewPost}</p>
                    </div>

                    {/* Created At */}
                    <div className="w-24">
                      <p className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Collapsible Edit Section */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedComment === comment.id ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900">Edit Comment</h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Left Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Reporter</label>
                            <input
                              type="text"
                              defaultValue={comment.reporter}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                              type="email"
                              defaultValue={comment.email}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">IP Address</label>
                            <input
                              type="text"
                              defaultValue={comment.ipAddress}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-300 text-white focus:outline-none"
                              readOnly
                            />
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Comment</label>
                            <textarea
                              rows={6}
                              defaultValue={comment.comment}
                              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                              placeholder="Enter comment"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setExpandedComment(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          Discard
                        </button>
                        <button
                          onClick={() => {
                            console.log('Update comment:', comment.id);
                            setExpandedComment(null);
                          }}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#A96B11] border border-transparent rounded-md hover:bg-[#8b5a0e]"
                        >
                          Update Comment
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
        {filteredComments.length === 0 && (
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

        <CommunicationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredComments.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
}