'use client';

import { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import Image from 'next/image';

// Mock data for posts
const mockPosts = [
  {
    id: '1',
    title: 'The Future of E-commerce Technology',
    author: 'John Smith',
    status: 'published',
    merchant: 'TechStore Pro',
    type: 'article',
    slot: 'featured',
    imageUrl: '/api/placeholder/80/60',
    comment: 'Great insights on emerging technologies...',
    commentCount: 24,
    postedDate: new Date('2025-01-02T10:30:00') // Static date
  },
  {
    id: '2',
    title: 'Top 10 Fashion Trends for Summer 2024',
    author: 'Sarah Johnson',
    status: 'published',
    merchant: 'Fashion Hub',
    type: 'list',
    slot: 'main',
    imageUrl: '/api/placeholder/80/60',
    comment: 'Love the summer collection picks!',
    commentCount: 18,
    postedDate: new Date('2024-12-30T14:20:00') // Static date
  },
  {
    id: '3',
    title: 'Home Decoration Ideas on a Budget',
    author: 'Mike Wilson',
    status: 'draft',
    merchant: 'Home Essentials',
    type: 'guide',
    slot: 'sidebar',
    imageUrl: '/api/placeholder/80/60',
    comment: '',
    commentCount: 0,
    postedDate: new Date('2025-01-03T09:15:00') // Static date
  },
  {
    id: '4',
    title: 'Holiday Shopping Guide 2024',
    author: 'Emma Davis',
    status: 'archived',
    merchant: 'Style Store',
    type: 'guide',
    slot: 'featured',
    imageUrl: '/api/placeholder/80/60',
    comment: 'Very helpful for holiday shopping!',
    commentCount: 45,
    postedDate: new Date('2024-12-05T16:45:00') // Static date
  },
  {
    id: '5',
    title: 'Outdated Product Review',
    author: 'Tom Brown',
    status: 'trash',
    merchant: 'Electronics Plus',
    type: 'review',
    slot: 'main',
    imageUrl: '/api/placeholder/80/60',
    comment: 'Product no longer available.',
    commentCount: 3,
    postedDate: new Date('2024-11-05T11:30:00') // Static date
  },
];

export default function PostsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filters, setFilters] = useState({
    action: '',
    merchantSearch: '',
    type: '',
    slot: ''
  });
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const statusCounts = {
    all: mockPosts.length,
    published: mockPosts.filter(post => post.status === 'published').length,
    draft: mockPosts.filter(post => post.status === 'draft').length,
    archived: mockPosts.filter(post => post.status === 'archived').length,
    trash: mockPosts.filter(post => post.status === 'trash').length,
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    console.log('Applying action:', filters.action);
  };

  const filteredPosts = mockPosts.filter(post => {
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;
    const matchesMerchant = filters.merchantSearch === '' || 
      post.merchant.toLowerCase().includes(filters.merchantSearch.toLowerCase());
    const matchesType = filters.type === '' || post.type === filters.type;
    const matchesSlot = filters.slot === '' || post.slot === filters.slot;

    return matchesStatus && matchesMerchant && matchesType && matchesSlot;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedPosts.length === paginatedPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(paginatedPosts.map(post => post.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600';
      case 'draft':
        return 'text-gray-600';
      case 'archived':
        return 'text-blue-600';
      case 'trash':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <Link
            href="/admin/posts/new"
            className="px-4 py-2 bg-[#A96B11] text-white text-sm font-medium rounded-md hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
          >
            Add Post
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {Object.entries(statusCounts).map(([status, count]) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    selectedStatus === status
                      ? 'border-[#A96B11] text-[#A96B11]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </button>
              ))}
            </nav>
          </div>

          {/* Search Bar with Search Style */}
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left - Action, Merchant Search, Type, Slot Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Action Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">Action</option>
                    <option value="publish">Publish</option>
                    <option value="draft">Move to Draft</option>
                    <option value="archive">Archive</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* Merchant Search */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filters.merchantSearch}
                    onChange={(e) => handleFilterChange('merchantSearch', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                    placeholder="Search merchants"
                  />
                </div>

                <span className="text-gray-400">|</span>

                {/* Type Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="article">Article</option>
                    <option value="list">List</option>
                    <option value="guide">Guide</option>
                    <option value="review">Review</option>
                  </select>
                </div>

                <span className="text-gray-400">|</span>

                {/* Slot Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.slot}
                    onChange={(e) => handleFilterChange('slot', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">All Slots</option>
                    <option value="featured">Featured</option>
                    <option value="main">Main</option>
                    <option value="sidebar">Sidebar</option>
                  </select>
                  <button className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors">
                    Filter
                  </button>
                </div>
              </div>

              {/* Right - Filtered Items Count */}
              <div className="text-sm text-gray-600">
                {filteredPosts.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedPosts.length === paginatedPosts.length && paginatedPosts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-3 text-sm font-medium text-gray-700 text-center">Title</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Author</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Comment</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Comment Statistic</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Posted Date</div>
            </div>
          </div>

          {/* Posts List */}
          <div className="divide-y divide-gray-200">
            {paginatedPosts.map((post) => (
              <div key={post.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  </div>

                  {/* Title */}
                  <div className="col-span-3 text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        width={80}
                        height={60}
                        className="w-20 h-15 object-cover rounded border border-gray-200"
                      />
                      <div className="space-y-1 text-left">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-[#A96B11] cursor-pointer block"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${getStatusColor(post.status)}`}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{post.merchant}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{post.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-900">{post.author}</div>
                  </div>

                  {/* Comment */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600 truncate">
                      {post.comment || 'No comments yet'}
                    </div>
                  </div>

                  {/* Comment Statistic */}
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{post.commentCount}</span>
                    </div>
                  </div>

                  {/* Posted Date */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600">
                      {moment(post.postedDate).format('HH:mm:ss DD/MM/YYYY')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg mt-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h.01m0 0h.01m0 0h.01m0 0h.01M9 16.5h.01m0 0h.01m0 0h.01m0 0h.01M7.5 12h.01m0 0h.01m0 0h.01m0 0H9m-1.5-1.5h.01m0 0h.01m0 0h.01m0 0h.01m-1.5 1.5h.01m0 0h.01m0 0h.01m0 0h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white shadow rounded-lg mt-6 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredPosts.length)} of {filteredPosts.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        page === currentPage
                          ? 'bg-[#A96B11] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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