'use client';

import { useState } from 'react';
import moment from 'moment';
import Link from 'next/link';
import { useUsers, useBulkActionUsers } from '@/hooks/useUsers';

type UserStatus = 'all' | 'active' | 'inactive' | 'suspended';
type UserType = 'all' | 'customer' | 'merchant' | 'admin';
type BulkAction = 'activate' | 'suspend' | 'delete' | 'reset_password';

export default function UserManagement() {
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<BulkAction | ''>('');
  const [userTypeFilter, setUserTypeFilter] = useState<UserType>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const bulkActionMutation = useBulkActionUsers();
  
  // Use the actual filters that have been applied
  const { 
    data: usersData, 
    isLoading,
    error 
  } = useUsers({
    page: currentPage,
    limit: itemsPerPage,
    search: appliedSearch || undefined,
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    sort: 'newest',
  });

  const users = usersData?.users || [];
  const totalPages = usersData?.totalPages || 1;
  const totalUsers = usersData?.total || 0;

  // Calculate status counts from current data
  const statusCounts = {
    all: users.filter(user => user).length,
    active: users.filter(user => user.status === 'active').length,
    inactive: users.filter(user => user.status === 'inactive' || !user.status).length,
    suspended: users.filter(user => user.status === 'suspended').length,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: '#4b8eff', bg: 'bg-blue-50', text: 'text-blue-700' },
      inactive: { color: '#999999', bg: 'bg-gray-50', text: 'text-gray-700' },
      suspended: { color: '#ff553e', bg: 'bg-red-50', text: 'text-red-700' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span 
          className="w-2 h-2 rounded-full mr-1.5" 
          style={{ backgroundColor: config.color }}
        ></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUserTypeBadge = (provider: string) => {
    const typeConfig = {
      email: 'bg-green-100 text-green-800',
      google: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800',
      apple: 'bg-gray-100 text-gray-800'
    };

    const badgeClass = typeConfig[provider as keyof typeof typeConfig] || 'bg-gray-100 text-gray-800';

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
        {provider.charAt(0).toUpperCase() + provider.slice(1)}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    return moment(dateString).format('HH:mm:ss DD/MM/YYYY');
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0 || !actionFilter) return;
    
    // Map 'activate' to the correct action
    const mappedAction = actionFilter === 'activate' ? 'activate' : actionFilter;
    const actionText = actionFilter === 'delete' ? 'delete' : `${actionFilter}`;
    
    if (window.confirm(`Are you sure you want to ${actionText} ${selectedUsers.length} user(s)?`)) {
      try {
        await bulkActionMutation.mutateAsync({ 
          action: mappedAction as 'suspend' | 'activate' | 'delete', 
          ids: selectedUsers 
        });
        setSelectedUsers([]);
        setActionFilter('');
      } catch (error) {
        console.error('Failed to perform bulk action:', error);
      }
    }
  };

  const handleSearch = () => {
    setAppliedSearch(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilter = () => {
    setSelectedStatus(statusFilter);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalUsers);

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A96B11]"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600">Error loading users: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-900">Users</h1>
          <Link
            href="/admin/users/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8b5a0e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
          >
            New User
          </Link>
        </div>

        {/* First Status Filter Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              {/* Status Filter Tabs - Left */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedStatus('all');
                    setStatusFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'all'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All <span className="text-gray-500">({statusCounts.all})</span>
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => {
                    setSelectedStatus('active');
                    setStatusFilter('active');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'active'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Active <span className="text-gray-500">({statusCounts.active})</span>
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => {
                    setSelectedStatus('inactive');
                    setStatusFilter('inactive');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'inactive'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Inactive <span className="text-gray-500">({statusCounts.inactive})</span>
                </button>
                <span className="text-gray-400">|</span>
                <button
                  onClick={() => {
                    setSelectedStatus('suspended');
                    setStatusFilter('suspended');
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1 text-sm font-medium transition-colors ${
                    selectedStatus === 'suspended'
                      ? 'text-[#A96B11] border-b-2 border-[#A96B11]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Suspended <span className="text-gray-500">({statusCounts.suspended})</span>
                </button>
              </div>

              {/* Search - Right */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search users by name, email, or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Second Filter Section */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left - Action, User Type, Status Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Action Dropdown */}
                <div className="flex items-center gap-2">
                  <select 
                    value={actionFilter}
                    onChange={(e) => setActionFilter(e.target.value as BulkAction | '')}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11]"
                  >
                    <option value="">Action</option>
                    <option value="activate">Activate</option>
                    <option value="suspend">Suspend</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleBulkAction}
                    disabled={!actionFilter || selectedUsers.length === 0 || bulkActionMutation.isPending}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bulkActionMutation.isPending ? 'Processing...' : 'Apply'}
                  </button>
                </div>

                <span className="text-gray-400">|</span>

                {/* User Type Dropdown */}
                <div className="flex items-center gap-2">
                  <select 
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value as UserType)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11]"
                  >
                    <option value="all">All Providers</option>
                    <option value="email">Email</option>
                    <option value="google">Google</option>
                    <option value="facebook">Facebook</option>
                  </select>
                </div>

                <span className="text-gray-400">|</span>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as UserStatus)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleFilter}
                    className="inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none transition-colors"
                  >
                    Filter
                  </button>
                </div>
              </div>

              {/* Right - Filtered Items Count */}
              <div className="text-sm text-gray-600">
                {totalUsers} items
              </div>
            </div>
          </div>
        </div>

        {/* Users List Section */}
        <div className="bg-white shadow rounded-lg">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                />
              </div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">User ID</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Display Name</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Provider</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Email</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Phone</div>
              <div className="col-span-2 text-sm font-medium text-gray-700 text-center">Created Date</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Last Login</div>
              <div className="col-span-1 text-sm font-medium text-gray-700 text-center">Status</div>
            </div>
          </div>

          {/* Users List */}
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Checkbox */}
                  <div className="col-span-1 flex justify-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="w-4 h-4 text-[#A96B11] border-gray-300 rounded focus:ring-[#A96B11]"
                    />
                  </div>
                  
                  {/* User ID */}
                  <div className="col-span-1 text-center">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-[#A96B11] cursor-pointer"
                    >
                      {user.id.slice(0, 8)}...
                    </Link>
                  </div>

                  {/* Display Name */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm font-medium text-gray-900">{user.displayName || user.name || 'Anonymous'}</p>
                  </div>

                  {/* Provider */}
                  <div className="col-span-1 flex justify-center">
                    {getUserTypeBadge(user.provider || 'email')}
                  </div>

                  {/* Email */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-gray-900 truncate">{user.email}</p>
                  </div>

                  {/* Phone */}
                  <div className="col-span-1 text-center">
                    <p className="text-sm text-gray-900">{user.phone || '-'}</p>
                  </div>

                  {/* Created Date */}
                  <div className="col-span-2 text-center">
                    <p className="text-sm text-gray-900">{formatDateTime(user.createdAt)}</p>
                  </div>

                  {/* Last Login */}
                  <div className="col-span-1 text-center">
                    <p className="text-sm text-gray-900">
                      {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex justify-center">
                    {getStatusBadge(user.status || 'inactive')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white shadow rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
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
                Showing {startIndex + 1} to {endIndex} of {totalUsers} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === page
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