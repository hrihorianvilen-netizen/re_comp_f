'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { contentApi, Post, Category } from '@/lib/api/content';
import { toast } from 'react-hot-toast';

export default function PostsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filters, setFilters] = useState({
    action: '',
    search: '',
    categoryId: '',
    tags: [] as string[],
    isFeatured: false,
    isPinned: false,
  });
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    trash: 0,
  });

  // Fetch posts
  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedStatus, filters.categoryId, filters.search]);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchStatistics();
  }, []);

  const fetchCategories = async () => {
    const response = await contentApi.getCategories();
    if (response.data) {
      setCategories(response.data);
    }
  };

  const fetchStatistics = async () => {
    const response = await contentApi.getStatistics();
    if (response.data) {
      const { overview } = response.data;
      setStatusCounts({
        all: overview.totalPosts,
        published: overview.publishedPosts,
        draft: overview.draftPosts,
        scheduled: overview.scheduledPosts,
        trash: overview.trashedPosts,
      });
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | boolean | string[]> = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (filters.categoryId) {
        params.categoryId = filters.categoryId;
      }

      if (filters.search) {
        params.search = filters.search;
      }

      if (filters.isFeatured) {
        params.isFeatured = true;
      }

      if (filters.isPinned) {
        params.isPinned = true;
      }

      if (filters.tags.length > 0) {
        params.tags = filters.tags;
      }

      const response = await contentApi.getPosts(params);

      if (response.data) {
        setPosts(response.data.posts);
        setTotalPosts(response.data.pagination.total);
        setTotalPages(response.data.pagination.pages);
      } else if (response.error) {
        toast.error(response.error);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: string, value: string | boolean | string[]) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleBulkAction = async () => {
    if (!filters.action || selectedPosts.length === 0) {
      toast.error('Please select an action and at least one post');
      return;
    }

    const response = await contentApi.bulkPostOperation(filters.action, selectedPosts);

    if (response.data) {
      toast.success(response.data.message);
      setSelectedPosts([]);
      fetchPosts();
      fetchStatistics();
    } else if (response.error) {
      toast.error(response.error);
    }
  };

  const handleDeletePost = async (id: string, permanent: boolean = false) => {
    if (!confirm(`Are you sure you want to ${permanent ? 'permanently delete' : 'trash'} this post?`)) {
      return;
    }

    const response = await contentApi.deletePost(id, permanent);

    if (response.data) {
      toast.success(response.data.message);
      fetchPosts();
      fetchStatistics();
    } else if (response.error) {
      toast.error(response.error);
    }
  };

  const handleRestorePost = async (id: string) => {
    const response = await contentApi.restorePost(id);

    if (response.data) {
      toast.success('Post restored successfully');
      fetchPosts();
      fetchStatistics();
    } else if (response.error) {
      toast.error(response.error);
    }
  };

  const handleDuplicatePost = async (id: string) => {
    const response = await contentApi.duplicatePost(id);

    if (response.data) {
      toast.success('Post duplicated successfully');
      fetchPosts();
    } else if (response.error) {
      toast.error(response.error);
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.id));
    }
  };

  const handleSelectPost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      trash: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[status as keyof typeof colors] || colors.draft}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
                  onClick={() => {
                    setSelectedStatus(status);
                    setCurrentPage(1);
                  }}
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

          {/* Filters */}
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left - Action and Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Bulk Action */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">Bulk Action</option>
                    <option value="publish">Publish</option>
                    <option value="draft">Move to Draft</option>
                    <option value="trash">Move to Trash</option>
                    <option value="delete">Delete Permanently</option>
                    <option value="feature">Mark as Featured</option>
                    <option value="unfeature">Remove Featured</option>
                  </select>
                  <button
                    onClick={handleBulkAction}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* Search */}
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  placeholder="Search posts..."
                />

                <span className="text-gray-400">|</span>

                {/* Category Filter */}
                <select
                  value={filters.categoryId}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Featured/Pinned Filters */}
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured}
                    onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                    className="text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.isPinned}
                    onChange={(e) => handleFilterChange('isPinned', e.target.checked)}
                    className="text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                  />
                  <span className="text-sm text-gray-700">Pinned</span>
                </label>
              </div>

              {/* Right - Results Count */}
              <div className="text-sm text-gray-600">
                {totalPosts} items
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
                  checked={selectedPosts.length === posts.length && posts.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-4 text-sm font-medium text-gray-700">Title</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Category</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Status</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Views</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Comments</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Actions</div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#A96B11]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading posts...
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedStatus === 'all' ? 'Get started by creating a new post.' : 'No posts with this status.'}
              </p>
              {selectedStatus === 'all' && (
                <div className="mt-6">
                  <Link
                    href="/admin/posts/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#A96B11] hover:bg-[#8B5A0F]"
                  >
                    Create New Post
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {posts.map((post) => (
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
                    <div className="col-span-4">
                      <div className="space-y-1">
                        <Link
                          href={`/admin/posts/${post.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-[#A96B11] block"
                        >
                          {post.title}
                        </Link>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          {post.isFeatured && (
                            <span className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded">Featured</span>
                          )}
                          {post.isPinned && (
                            <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Pinned</span>
                          )}
                          {post.tags.length > 0 && (
                            <span>Tags: {post.tags.slice(0, 3).join(', ')}{post.tags.length > 3 && '...'}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          By {post.authorUser?.name || post.author} • {moment(post.publishedAt || post.createdAt).format('MMM DD, YYYY')}
                        </div>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-2 text-center">
                      <span className="text-sm text-gray-900">{post.category?.name || 'Uncategorized'}</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 text-center">
                      {getStatusBadge(post.status)}
                    </div>

                    {/* Views */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm text-gray-600">{post.views}</span>
                    </div>

                    {/* Comments */}
                    <div className="col-span-1 text-center">
                      <span className="text-sm text-gray-600">{post._count?.comments || 0}</span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center justify-center space-x-2">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-[#A96B11] hover:text-[#8B5A0F] text-sm"
                      >
                        Edit
                      </Link>
                      {post.status === 'trash' ? (
                        <>
                          <button
                            onClick={() => handleRestorePost(post.id)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id, true)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDuplicatePost(post.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Trash
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white shadow rounded-lg mt-6 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalPosts)} of {totalPosts} results
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
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

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