'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { contentApi, Category } from '@/lib/api/content';
import { toast } from 'react-hot-toast';
import { getHtmlPreview } from '@/lib/htmlUtils';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Array<Category & { parentName?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filters, setFilters] = useState({
    action: '',
    parentCategory: ''
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch categories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await contentApi.getCategories(true); // Include inactive categories
      if (response.data) {
        // Flatten the tree structure if it's nested
        const flattenCategories = (cats: Category[], parentName: string = '-'): Array<Category & { parentName: string }> => {
          let result: Array<Category & { parentName: string }> = [];
          for (const cat of cats) {
            result.push({
              ...cat,
              parentName
            });
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenCategories(cat.children, cat.name));
            }
          }
          return result;
        };

        const flatCategories = flattenCategories(response.data);
        setCategories(flatCategories);
      } else {
        console.error('Failed to fetch categories:', response.error);
        toast.error(response.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const statusCounts = {
    all: categories.length,
    active: categories.filter(cat => cat.isActive).length,
    inactive: categories.filter(cat => !cat.isActive).length,
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = async () => {
    if (!filters.action || selectedCategories.length === 0) {
      toast.error('Please select categories and an action');
      return;
    }

    try {
      for (const categoryId of selectedCategories) {
        if (filters.action === 'delete') {
          const response = await contentApi.deleteCategory(categoryId);
          if (!response.data) {
            toast.error(`Failed to delete category: ${response.error}`);
          }
        } else if (filters.action === 'activate') {
          const response = await contentApi.updateCategory(categoryId, { isActive: true });
          if (!response.data) {
            toast.error(`Failed to activate category: ${response.error}`);
          }
        } else if (filters.action === 'deactivate') {
          const response = await contentApi.updateCategory(categoryId, { isActive: false });
          if (!response.data) {
            toast.error(`Failed to deactivate category: ${response.error}`);
          }
        }
      }

      toast.success('Action applied successfully');
      setSelectedCategories([]);
      setFilters({ action: '', parentCategory: '' });
      fetchCategories(); // Refresh the list
    } catch (error) {
      console.error('Error applying action:', error);
      toast.error('Failed to apply action');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const response = await contentApi.deleteCategory(categoryId);
        if (response.data) {
          toast.success('Category deleted successfully');
          fetchCategories();
        } else {
          toast.error(response.error || 'Failed to delete category');
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'active' && category.isActive) ||
      (selectedStatus === 'inactive' && !category.isActive);
    const matchesParent = filters.parentCategory === '' || category.parentId === filters.parentCategory;

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

  // Get parent categories for dropdown
  const parentCategories = categories.filter(cat => !cat.parentId && cat.isActive);

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A96B11]"></div>
            <div className="text-gray-500">Loading categories...</div>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Filters */}
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
                    <option value="activate">Activate</option>
                    <option value="deactivate">Deactivate</option>
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
                    {parentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right - Items per page info */}
              <div className="text-sm text-gray-600">
                {filteredCategories.length} items
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === paginatedCategories.length && paginatedCategories.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category.id)}
                        onChange={() => handleSelectCategory(category.id)}
                        className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.parentId && <span className="text-gray-400 mr-2">—</span>}
                        {category.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {category.description ? getHtmlPreview(category.description, 60) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {category.parentName || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {category._count?.posts || category.postCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/posts/categories/${category.id}`}
                          className="text-[#A96B11] hover:text-[#8B5A0F]"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCategories.length)} of {filteredCategories.length} entries
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}