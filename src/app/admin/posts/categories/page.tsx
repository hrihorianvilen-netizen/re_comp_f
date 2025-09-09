'use client';

import { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';

// Mock data for categories
const mockCategories = [
  {
    id: '1',
    name: 'Technology',
    slug: 'technology',
    description: 'Latest tech news and reviews',
    status: 'published',
    parent: null,
    parentName: '-',
    position: 1,
    postCount: 45,
    createdAt: new Date('2024-12-01T10:30:00'),
    updatedAt: new Date('2025-01-02T14:20:00')
  },
  {
    id: '2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Fashion trends and style guides',
    status: 'published',
    parent: null,
    parentName: '-',
    position: 2,
    postCount: 32,
    createdAt: new Date('2024-12-05T09:15:00'),
    updatedAt: new Date('2024-12-30T11:45:00')
  },
  {
    id: '3',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Mobile technology and reviews',
    status: 'published',
    parent: '1',
    parentName: 'Technology',
    position: 1,
    postCount: 18,
    createdAt: new Date('2024-12-10T16:00:00'),
    updatedAt: new Date('2025-01-01T09:30:00')
  },
  {
    id: '4',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Lifestyle and wellness content',
    status: 'trash',
    parent: null,
    parentName: '-',
    position: 3,
    postCount: 0,
    createdAt: new Date('2024-11-15T12:00:00'),
    updatedAt: new Date('2024-12-20T10:15:00')
  },
  {
    id: '5',
    name: 'Summer Fashion',
    slug: 'summer-fashion',
    description: 'Summer fashion trends',
    status: 'published',
    parent: '2',
    parentName: 'Fashion',
    position: 1,
    postCount: 12,
    createdAt: new Date('2024-12-15T14:30:00'),
    updatedAt: new Date('2024-12-28T16:20:00')
  },
];

export default function CategoriesPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filters, setFilters] = useState({
    action: '',
    parentCategory: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const statusCounts = {
    all: mockCategories.length,
    published: mockCategories.filter(cat => cat.status === 'published').length,
    trash: mockCategories.filter(cat => cat.status === 'trash').length,
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

  const filteredCategories = mockCategories.filter(category => {
    const matchesStatus = selectedStatus === 'all' || category.status === selectedStatus;
    const matchesParent = filters.parentCategory === '' || category.parent === filters.parentCategory;

    return matchesStatus && matchesParent;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedCategories.length === paginatedCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(paginatedCategories.map(cat => cat.id));
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'trash':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get parent categories for dropdown (categories without parent)
  const parentCategories = mockCategories.filter(cat => cat.parent === null && cat.status === 'published');

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <Link
            href="/admin/posts/categories/new"
            className="px-4 py-2 bg-[#A96B11] text-white text-sm font-medium rounded-md hover:bg-[#8B5A0F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11]"
          >
            New Category
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
              {/* Left - Action, Parent Category Filters */}
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
                    <option value="trash">Move to Trash</option>
                    <option value="delete">Delete Permanently</option>
                  </select>
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* Parent Category Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.parentCategory}
                    onChange={(e) => handleFilterChange('parentCategory', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">All Parent Categories</option>
                    <option value="">Root Categories</option>
                    {parentCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <button className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors">
                    Filter
                  </button>
                </div>
              </div>

              {/* Right - Filtered Items Count */}
              <div className="text-sm text-gray-600">
                {filteredCategories.length} items
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedCategories.length === paginatedCategories.length && paginatedCategories.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Name</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Slug</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Parent</div>
              <div className="col-span-3 text-sm font-medium text-gray-700 text-center">Description</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Position</div>
            </div>
          </div>

          {/* Categories List */}
          <div className="divide-y divide-gray-200">
            {paginatedCategories.map((category) => (
              <div key={category.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleSelectCategory(category.id)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  </div>

                  {/* Name */}
                  <div className="col-span-2 text-center">
                    <Link
                      href={`/admin/posts/categories/${category.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-[#A96B11] cursor-pointer block"
                    >
                      {category.name}
                    </Link>
                  </div>

                  {/* Slug */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-600 font-mono">
                      /{category.slug}
                    </div>
                  </div>

                  {/* Parent */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm text-gray-900">
                      {category.parentName || '-'}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="col-span-3 text-center">
                    <div className="text-sm text-gray-600 truncate">
                      {category.description || 'No description'}
                    </div>
                  </div>

                  {/* Position */}
                  <div className="col-span-2 text-center">
                    <div className="text-sm font-medium text-gray-900">
                      {category.position}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg mt-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
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
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} results
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