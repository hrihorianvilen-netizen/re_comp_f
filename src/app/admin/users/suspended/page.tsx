'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import moment from 'moment';
import { useUsers, useUpdateUserStatus, useBulkActionUsers } from '@/hooks/useUsers';
import { User } from '@/types/api';


export default function SuspendedPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    searchByEmail: '',
    action: '',
    timeFilter: '',
    searchQuery: ''
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  
  const updateUserStatusMutation = useUpdateUserStatus();
  const bulkActionMutation = useBulkActionUsers();
  
  // Fetch suspended users from API
  const { data: usersData, isLoading, error } = useUsers({
    status: 'suspended',
    search: filters.searchQuery,
    page: currentPage,
    limit: itemsPerPage
  });
  
  const suspendedUsers = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;
  const total = usersData?.total || 0;

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    console.log('Searching with filters:', filters);
    setCurrentPage(1);
  };

  const handleApply = async () => {
    if (selectedUsers.length === 0 || !filters.action) return;
    
    try {
      if (filters.action === 'unsuspend') {
        await bulkActionMutation.mutateAsync({
          action: 'activate',
          ids: selectedUsers
        });
      } else if (filters.action === 'delete') {
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} user(s)? This action cannot be undone.`)) {
          await bulkActionMutation.mutateAsync({
            action: 'delete',
            ids: selectedUsers
          });
        }
      }
      setSelectedUsers([]);
    } catch (error) {
      console.error('Failed to apply bulk action:', error);
    }
  };
  
  const handleUnsuspendUser = async (userId: string) => {
    try {
      await updateUserStatusMutation.mutateAsync({
        id: userId,
        data: {
          status: 'active'
        }
      });
    } catch (error) {
      console.error('Failed to unsuspend user:', error);
    }
  };
  
  const toggleUserSelection = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };
  
  const toggleSelectAll = () => {
    if (selectedUsers.length === suspendedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(suspendedUsers.map(user => user.id));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A96B11]"></div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Failed to load suspended users. Please try again.</p>
      </div>
    );
  }
  
  const getSuspensionType = (user: User) => {
    // Determine suspension type based on suspension reason
    if (user.suspendedReason?.includes('(email)')) return 'Email';
    return 'Account';
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      'Account': 'bg-red-100 text-red-800',
      'Email': 'bg-blue-100 text-blue-800'
    };
    return typeColors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Suspended Users</h1>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={filters.searchByEmail}
                  onChange={(e) => handleFilterChange('searchByEmail', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11] text-sm"
                  placeholder="email or ip"
                />
                <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600">
                  Suspended
                </button>
              </div>
            </div>

            {/* Status Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left - Action, Date Filter, Search */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Action Dropdown */}
                <div className="flex items-center gap-2">
                  <select
                    value={filters.action}
                    onChange={(e) => handleFilterChange('action', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  >
                    <option value="">Action</option>
                    <option value="unsuspend">Unsuspend</option>
                    <option value="delete">Delete</option>
                    <option value="extend">Extend Suspension</option>
                  </select>
                  <button
                    onClick={handleApply}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Apply
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={filters.timeFilter}
                    onChange={(e) => handleFilterChange('timeFilter', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                  />
                  <button className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors">
                    Filter
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* Search */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                    placeholder="Search by name, email and user"
                  />
                  <button
                    onClick={handleSearch}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Right - Filtered Items Count */}
              <div className="text-sm text-gray-600">
                {total} items
              </div>
            </div>

          </div>
        </div>

        {/* Suspended Users List */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-14 gap-2 items-center">
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === suspendedUsers.length && suspendedUsers.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-3 text-sm font-medium text-gray-700 text-center">User Info</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Type</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Suspended At</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Suspended Until</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Suspended By</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Reason</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Actions</div>
            </div>
          </div>

          {/* Users List */}
          <div className="divide-y divide-gray-200">
            {suspendedUsers.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="grid grid-cols-14 gap-2 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  </div>

                  {/* User Info */}
                  <div className="col-span-3 text-center">
                    <div className="space-y-1">
                      <button
                        onClick={() => router.push(`/admin/users/suspended/${user.id}`)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {user.displayName || user.name || 'Anonymous'}
                      </button>
                      <div className="text-xs text-gray-600">{user.email}</div>
                      <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-1 flex justify-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(getSuspensionType(user))}`}>
                      {getSuspensionType(user)}
                    </span>
                  </div>

                  {/* Suspended At */}
                  <div className="col-span-2 text-center">
                    <div className="text-xs text-gray-900">
                      {user.updatedAt ? moment(user.updatedAt).format('DD/MM/YY HH:mm') : 'Unknown'}
                    </div>
                  </div>

                  {/* Suspended Until */}
                  <div className="col-span-2 text-center">
                    <div className="text-xs text-gray-900">
                      {user.suspendedUntil ? moment(user.suspendedUntil).format('DD/MM/YY HH:mm') : 'Permanent'}
                    </div>
                  </div>

                  {/* Suspended By */}
                  <div className="col-span-2 text-center">
                    <div className="text-xs text-gray-900">
                      {user.suspendedReason?.includes('by admin') ? 'Admin' : 'System'}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="col-span-2 text-center">
                    <div className="text-xs text-gray-700 truncate" title={user.suspendedReason || 'No reason'}>
                      {user.suspendedReason || 'No reason'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex justify-center space-x-1">
                    <button
                      onClick={() => router.push(`/admin/users/suspended/${user.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View details"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsuspendUser(user.id);
                      }}
                      disabled={updateUserStatusMutation.isPending}
                      className="text-green-600 hover:text-green-800 disabled:opacity-50"
                      title="Unsuspend user"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {suspendedUsers.length === 0 && (
          <div className="text-center py-12 bg-white shadow rounded-lg mt-6">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No suspended users found</h3>
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
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} results
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